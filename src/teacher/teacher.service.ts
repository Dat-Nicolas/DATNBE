import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getMagvFromUserEmail } from './teacher.helper';
import { PassThrough } from 'stream';
import { format as csvFormat } from '@fast-csv/format';
import ExcelJS from 'exceljs';
function toYear(v: unknown) {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  if (!Number.isInteger(n)) throw new BadRequestException('Năm học không hợp lệ');
  return n;
}

function toDate(v: unknown) {
  const d = new Date(v as string);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Ngày sinh không hợp lệ');
  return d;
}

function bucketLabel(score: number) {
  if (score < 40) return '0-39';
  if (score < 60) return '40-59';
  if (score < 80) return '60-79';
  return '80-100';
}

type DRLFilter = { Malop: string; Namhoc?: number; Hocky?: 'HK1'|'HK2'|'HK_HE' };

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // ----------- LỚP CHỦ NHIỆM -----------
  async getHomerooms(userEmail: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const list = await this.prisma.lop.findMany({
      where: { Magv }, // Lop.GVCN ~ Lop.Magv
      select: { Malop: true, Tenlop: true },
      orderBy: { Malop: 'asc' },
    });
    return list;
  }

  async getHomeroomStudents(userEmail: string, Malop: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    return this.prisma.hocsinh.findMany({
      where: { Malop },
      orderBy: { Mahs: 'asc' },
    });
  }

  async addStudentToHomeroom(userEmail: string, Malop: string, dto: any) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    // Ngaysinh trong schema là bắt buộc
    return this.prisma.hocsinh.create({
      data: {
        Mahs: dto.Mahs,
        Hotenhs: dto.Hotenhs,
        Gioitinh: dto.Gioitinh,
        Ngaysinh: toDate(dto.Ngaysinh),
        Diachi: dto.Diachi ?? null,
        Malop,
      },
    });
  }

  async updateStudentInHomeroom(userEmail: string, Malop: string, Mahs: string, dto: any) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs } });
    if (!hs || hs.Malop !== Malop) throw new ForbiddenException('HS không thuộc lớp này');

    return this.prisma.hocsinh.update({
      where: { Mahs },
      data: {
        Hotenhs: dto.Hotenhs,
        Gioitinh: dto.Gioitinh,
        Ngaysinh: dto.Ngaysinh ? toDate(dto.Ngaysinh) : hs.Ngaysinh,
        Diachi: dto.Diachi ?? hs.Diachi,
      },
    });
  }

  async removeStudentFromHomeroom(userEmail: string, Malop: string, Mahs: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs } });
    if (!hs || hs.Malop !== Malop) throw new ForbiddenException('HS không thuộc lớp này');

    return this.prisma.hocsinh.delete({ where: { Mahs } });
  }

  // ----------- LỚP PHỤ TRÁCH (DẠY LỚP/MÔN) -----------
  async getTeachings(userEmail: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const list = await this.prisma.giangday.findMany({
      where: { Magv },
      include: { Lop: true, Monhoc: true },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'desc' }],
    });
    // Trả về cho FE tự lọc theo năm/học kỳ
    return list.map((g) => ({
      Malop: g.Malop,
      Tenlop: g.Lop?.Tenlop ?? g.Malop,
      Mamon: g.Mamon,
      Tenmon: g.Monhoc?.Tenmon ?? g.Mamon,
      Namhoc: g.Namhoc,
      Hocky: g.Hocky,
    }));
  }

  async getTeachingStudents(userEmail: string, Malop: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const has = await this.prisma.giangday.findFirst({ where: { Magv, Malop } });
    if (!has) throw new ForbiddenException('Bạn không dạy lớp này');
    return this.prisma.hocsinh.findMany({ where: { Malop }, orderBy: { Mahs: 'asc' } });
  }

  // ----------- ĐIỂM RÈN LUYỆN (DRL) -----------
  async getDRLByClass(
    userEmail: string,
    q: { Malop: string; Namhoc?: number | string; Hocky: 'HK1' | 'HK2' | 'HK_HE' },
  ) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop: q.Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const where: Prisma.DiemRLWhereInput = {
      Malop: q.Malop,
      Hocky: q.Hocky,
      ...(q.Namhoc !== undefined && q.Namhoc !== null ? { Namhoc: toYear(q.Namhoc) } : {}),
    };

    const list = await this.prisma.diemRL.findMany({
      where,
      include: { Hocsinh: true },
      orderBy: { id: 'desc' },
    });

    return list.map((d) => ({
      id: d.id,
      Mahs: d.Mahs,
      Hotenhs: d.Hocsinh?.Hotenhs,
      Malop: d.Malop,
      Nam: d.Namhoc,
      Hocky: d.Hocky,
      Diem: d.Diem,
      Note: d.Note,
    }));
  }

  async createDRL(userEmail: string, dto: {
    Mahs: string;
    Malop: string;
    Namhoc: number | string;
    Hocky: 'HK1' | 'HK2' | 'HK_HE';
    Diem: number;
    Note?: string;
  }) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop: dto.Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs: dto.Mahs } });
    if (!hs || hs.Malop !== dto.Malop) throw new ForbiddenException('HS không thuộc lớp này');

    return this.prisma.diemRL.create({
      data: {
        Mahs: dto.Mahs,
        Malop: dto.Malop,
        Namhoc: toYear(dto.Namhoc),
        Hocky: dto.Hocky,
        Diem: dto.Diem,
        Note: dto.Note ?? null,
        createdBy: Magv,
      },
    });
  }

  async updateDRL(
    userEmail: string,
    id: number,
    dto: Partial<{
      Mahs: string;
      Malop: string;
      Namhoc: number | string;
      Hocky: 'HK1' | 'HK2' | 'HK_HE';
      Diem: number;
      Note: string;
    }>,
  ) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const rec = await this.prisma.diemRL.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('DRL not found');

    // xác thực quyền theo lớp chủ nhiệm hiện tại của teacher
    const lop = await this.prisma.lop.findUnique({ where: { Malop: rec.Malop } });
    if (!lop || lop.Magv !== Magv) throw new ForbiddenException();

    // nếu đổi Mahs/Malop/Năm/HK, vẫn đảm bảo HS thuộc lớp và lớp thuộc GV
    let Mahs = rec.Mahs;
    let Malop = rec.Malop;
    let Namhoc = rec.Namhoc;
    let Hocky = rec.Hocky;

    if (dto.Malop && dto.Malop !== Malop) {
      const lop2 = await this.prisma.lop.findUnique({ where: { Malop: dto.Malop } });
      if (!lop2 || lop2.Magv !== Magv) throw new ForbiddenException('Không phải lớp CN của bạn');
      Malop = dto.Malop;
    }

    if (dto.Mahs && dto.Mahs !== Mahs) {
      const hs2 = await this.prisma.hocsinh.findUnique({ where: { Mahs: dto.Mahs } });
      if (!hs2 || hs2.Malop !== Malop) throw new ForbiddenException('HS không thuộc lớp');
      Mahs = dto.Mahs;
    }

    if (dto.Namhoc !== undefined) Namhoc = toYear(dto.Namhoc);
    if (dto.Hocky) Hocky = dto.Hocky;

    return this.prisma.diemRL.update({
      where: { id },
      data: {
        Mahs,
        Malop,
        Namhoc,
        Hocky,
        Diem: dto.Diem ?? rec.Diem,
        Note: dto.Note ?? rec.Note,
      },
    });
  }

  async deleteDRL(userEmail: string, id: number) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const rec = await this.prisma.diemRL.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('DRL not found');
    const lop = await this.prisma.lop.findUnique({ where: { Malop: rec.Malop } });
    if (!lop || lop.Magv !== Magv) throw new ForbiddenException();
    return this.prisma.diemRL.delete({ where: { id } });
  }

  async getDRLByStudent(userEmail: string, Mahs: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs }, include: { Lop: true } });
    if (!hs) return [];
    if (!hs.Lop || hs.Lop.Magv !== Magv) throw new ForbiddenException('HS không thuộc lớp CN của bạn');

    return this.prisma.diemRL.findMany({
      where: { Mahs },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'desc' }],
    });
  }

   private async assertHomeroomOwner(userEmail: string, Malop: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');
    return { Magv, lop };
  }

  async getDRLSummary(userEmail: string, q: DRLFilter) {
    await this.assertHomeroomOwner(userEmail, q.Malop);

    const where: Prisma.DiemRLWhereInput = {
      Malop: q.Malop,
      ...(q.Namhoc ? { Namhoc: q.Namhoc } : {}),
      ...(q.Hocky ? { Hocky: q.Hocky } : {}),
    };

    const rows = await this.prisma.diemRL.findMany({
      where,
      include: { Hocsinh: true },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'desc' }, { id: 'desc' }],
    });

    const count = rows.length;
    const scores = rows.map(r => r.Diem);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = count ? +(sum / count).toFixed(2) : 0;
    const min = count ? Math.min(...scores) : null;
    const max = count ? Math.max(...scores) : null;

    // phân bố theo khoảng
    const distribution = rows.reduce<Record<string, number>>((acc, r) => {
      const k = bucketLabel(r.Diem);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

    // top/bottom 10
    const sorted = [...rows].sort((a, b) => b.Diem - a.Diem);
    const top10 = sorted.slice(0, 10).map(r => ({
      Mahs: r.Mahs, Hotenhs: r.Hocsinh?.Hotenhs ?? null, Diem: r.Diem, Namhoc: r.Namhoc, Hocky: r.Hocky,
    }));
    const bottom10 = [...sorted].reverse().slice(0, 10).map(r => ({
      Mahs: r.Mahs, Hotenhs: r.Hocsinh?.Hotenhs ?? null, Diem: r.Diem, Namhoc: r.Namhoc, Hocky: r.Hocky,
    }));

    // thống kê theo học kỳ (nếu chưa lọc Hocky)
    const bySemester = q.Hocky
      ? undefined
      : ['HK1','HK2','HK_HE'].map(hk => {
          const list = rows.filter(r => r.Hocky === hk);
          const c = list.length;
          const s = list.reduce((a,b)=>a+b.Diem,0);
          return { Hocky: hk, Count: c, Avg: c ? +(s/c).toFixed(2) : 0 };
        });

    return {
      filter: q,
      count, avg, min, max,
      distribution,
      top10, bottom10,
      bySemester,
    };
  }

  async getDRLYearly(userEmail: string, q: { Malop: string; Hocky?: 'HK1'|'HK2'|'HK_HE' }) {
    await this.assertHomeroomOwner(userEmail, q.Malop);

    // group theo Namhoc (và Hocky nếu được cung cấp)
    const where: Prisma.DiemRLWhereInput = {
      Malop: q.Malop,
      ...(q.Hocky ? { Hocky: q.Hocky } : {}),
    };

    const rows = await this.prisma.diemRL.findMany({ where });
    const map = new Map<number, { Count: number; Sum: number; Min: number; Max: number }>();

    for (const r of rows) {
      const year = r.Namhoc;
      if (!map.has(year)) map.set(year, { Count: 0, Sum: 0, Min: r.Diem, Max: r.Diem });
      const item = map.get(year)!;
      item.Count += 1;
      item.Sum += r.Diem;
      item.Min = Math.min(item.Min, r.Diem);
      item.Max = Math.max(item.Max, r.Diem);
    }

    const result = [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([Namhoc, v]) => ({
        Namhoc,
        Count: v.Count,
        Avg: v.Count ? +(v.Sum / v.Count).toFixed(2) : 0,
        Min: v.Min,
        Max: v.Max,
      }));

    return { filter: q, data: result };
    // Bạn có thể chart hóa ở FE theo {Namhoc, Avg}
  }

  // -------- EXPORT EXCEL --------
  async exportDRLExcel(userEmail: string, q: DRLFilter): Promise<Buffer> {
    await this.assertHomeroomOwner(userEmail, q.Malop);

    const where: Prisma.DiemRLWhereInput = {
      Malop: q.Malop,
      ...(q.Namhoc ? { Namhoc: q.Namhoc } : {}),
      ...(q.Hocky ? { Hocky: q.Hocky } : {}),
    };

    const rows = await this.prisma.diemRL.findMany({
      where,
      include: { Hocsinh: true },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'desc' }, { id: 'desc' }],
    });

    const summary = await this.getDRLSummary(userEmail, q);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'DRL System';
    wb.created = new Date();

    // Sheet 1: Data
    const ws1 = wb.addWorksheet('Data');
    ws1.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Mã HS', key: 'Mahs', width: 14 },
      { header: 'Họ tên', key: 'Hotenhs', width: 28 },
      { header: 'Lớp', key: 'Malop', width: 12 },
      { header: 'Năm', key: 'Namhoc', width: 8 },
      { header: 'Học kỳ', key: 'Hocky', width: 10 },
      { header: 'Điểm RL', key: 'Diem', width: 10 },
      { header: 'Ghi chú', key: 'Note', width: 40 },
      { header: 'Tạo lúc', key: 'createdAt', width: 20 },
    ];
    rows.forEach(r => {
      ws1.addRow({
        id: r.id,
        Mahs: r.Mahs,
        Hotenhs: r.Hocsinh?.Hotenhs ?? '',
        Malop: r.Malop,
        Namhoc: r.Namhoc,
        Hocky: r.Hocky,
        Diem: r.Diem,
        Note: r.Note ?? '',
        createdAt: r['createdAt'] ? new Date(r['createdAt']).toISOString() : '',
      });
    });
    ws1.getRow(1).font = { bold: true };

    // Sheet 2: Summary
    const ws2 = wb.addWorksheet('Summary');
    ws2.addRows([
      ['Bộ lọc', JSON.stringify(q)],
      ['Số bản ghi', summary.count],
      ['Điểm TB', summary.avg],
      ['Min', summary.min ?? ''],
      ['Max', summary.max ?? ''],
      [],
      ['Phân bố điểm'],
      ['Khoảng', 'Số lượng'],
      ...Object.entries(summary.distribution).map(([k, v]) => [k, v]),
      [],
      ['Top 10'],
      ['Mã HS', 'Họ tên', 'Năm', 'HK', 'Điểm'],
      ...summary.top10.map(x => [x.Mahs, x.Hotenhs ?? '', x.Namhoc, x.Hocky, x.Diem]),
      [],
      ['Bottom 10'],
      ['Mã HS', 'Họ tên', 'Năm', 'HK', 'Điểm'],
      ...summary.bottom10.map(x => [x.Mahs, x.Hotenhs ?? '', x.Namhoc, x.Hocky, x.Diem]),
    ]);
    ws2.eachRow((row, idx) => { if ([1,7,9,12,14].includes(idx)) row.font = { bold: true }; });

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  // -------- EXPORT CSV --------
  async exportDRLCSV(userEmail: string, q: DRLFilter) {
    await this.assertHomeroomOwner(userEmail, q.Malop);

    const where: Prisma.DiemRLWhereInput = {
      Malop: q.Malop,
      ...(q.Namhoc ? { Namhoc: q.Namhoc } : {}),
      ...(q.Hocky ? { Hocky: q.Hocky } : {}),
    };

    const rows = await this.prisma.diemRL.findMany({
      where,
      include: { Hocsinh: true },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'desc' }, { id: 'desc' }],
    });

    const stream = new PassThrough();
    const csv = csvFormat({ headers: true });
    csv.pipe(stream);

    rows.forEach(r => {
      csv.write({
        id: r.id,
        mahs: r.Mahs,
        hoten: r.Hocsinh?.Hotenhs ?? '',
        malop: r.Malop,
        nam: r.Namhoc,
        hocky: r.Hocky,
        diem: r.Diem,
        note: r.Note ?? '',
      });
    });
    csv.end();

    const filename = `DRL_${q.Malop}${q.Namhoc ? '_' + q.Namhoc : ''}${q.Hocky ? '_' + q.Hocky : ''}.csv`;
    return { stream, filename };
  }
}
