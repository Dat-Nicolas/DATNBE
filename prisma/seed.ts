// prisma/seed.ts
import {
  PrismaClient,
  GioiTinh,
  Hocky,
  Role,
  type Giangday as GiangdayModel,
  type Diem as DiemModel,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const ahash = (raw: string) => argon2.hash(raw);
const rand = (min = 6, max = 10) =>
  Math.round((min + Math.random() * (max - min)) * 10) / 10;

async function main() {
  console.log('🌱 Reset database (delete in dependency order)...');

  // Xoá theo thứ tự phụ thuộc để sạch sẽ (dù đã có onDelete)
  await prisma.chitietdiem.deleteMany();
  await prisma.diem.deleteMany();
  await prisma.giangday.deleteMany();
  await prisma.diemRL.deleteMany();
  await prisma.hocsinh.deleteMany();
  await prisma.monhoc.deleteMany();
  await prisma.lop.deleteMany();
  await prisma.giaovien.deleteMany();
  await prisma.hocKy.deleteMany();
  await prisma.namHoc.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();

  // ---------- USERS ----------
  console.log('👤 Seed admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      name: 'Admin',
      role: Role.ADMIN,
      password: await ahash('admin123'),
    },
    create: {
      email: 'admin@gmail.com',
      password: await ahash('admin123'),
      name: 'Admin',
      role: Role.ADMIN,
    },
  });
  const adminId = admin.id;

  // ---------- NAM HOC & HOC KY ----------
  console.log('📅 Seed Năm học + Học kỳ...');
  const years = [
    { code: 'NH2425', name: 'Năm học 2024-2025', active: true },
    { code: 'NH2526', name: 'Năm học 2025-2026', active: false },
  ];

  await prisma.namHoc.createMany({
    data: years,
    skipDuplicates: true,
  });

  const hocKyRows = [
    { code: 'HK1-2425', name: 'Học kỳ I', yearCode: 'NH2425' },
    { code: 'HK2-2425', name: 'Học kỳ II', yearCode: 'NH2425' },
    { code: 'HK1-2526', name: 'Học kỳ I', yearCode: 'NH2526' },
    { code: 'HK2-2526', name: 'Học kỳ II', yearCode: 'NH2526' },
  ];
  await prisma.hocKy.createMany({
    data: hocKyRows,
    skipDuplicates: true,
  });

  // ---------- NEWS ----------
  console.log('📰 Seed News...');
  const newsPayload = [
    { title: 'Thông báo nghỉ Tết Dương lịch 2026', content: 'Toàn trường nghỉ từ ngày 30/12/2025 đến hết ngày 02/01/2026.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'thong-bao-nghi-tet-duong-lich-2026', thumbnail: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=600&q=80' },
    { title: 'Hội thi giáo viên giỏi cấp trường', content: 'Công đoàn tổ chức hội thi giáo viên dạy giỏi với sự tham gia của 15 thầy cô.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'hoi-thi-giao-vien-gioi', thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80' },
    { title: 'Học sinh đạt giải thi học sinh giỏi tỉnh', content: '5 học sinh trường THPT Thái Thụy đạt giải Nhất và Nhì cấp tỉnh.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'hoc-sinh-gioi-tinh-2025', thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80' },
    { title: 'Lễ tổng kết năm học 2025', content: 'Buổi lễ tổng kết diễn ra long trọng tại hội trường lớn của trường.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'le-tong-ket-nam-hoc-2025', thumbnail: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80' },
    { title: 'Phát động phong trào thi đua chào mừng ngày Nhà giáo Việt Nam', content: 'Tổ chức các hoạt động thi đua, văn nghệ và thể thao chào mừng 20/11.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'phat-dong-thi-dua-20-11', thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80' },
    { title: 'Chương trình thiện nguyện mùa đông ấm', content: 'Đoàn trường kêu gọi quyên góp áo ấm cho học sinh vùng cao.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'thien-nguyen-mua-dong-am', thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80' },
    { title: 'Tập huấn phòng cháy chữa cháy', content: 'Buổi tập huấn PCCC được tổ chức với sự hướng dẫn của lực lượng công an.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'tap-huan-pccc', thumbnail: 'https://picsum.photos/id/1062/600/400' },
    { title: 'Thông báo nhận học bạ lớp 12', content: 'Phòng đào tạo thông báo thời gian nhận học bạ cho học sinh khối 12.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'thong-bao-nhan-hoc-ba', thumbnail: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80' },
    { title: 'Thông báo thu học phí học kỳ II', content: 'Phụ huynh và học sinh nộp học phí trước ngày 10/02/2026.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'thong-bao-thu-hoc-phi', thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80' },
    { title: 'Khai giảng năm học mới 2025-2026', content: 'Buổi lễ khai giảng diễn ra trong không khí vui tươi và trang trọng.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'le-khai-giang-2025-2026', thumbnail: 'https://images.unsplash.com/photo-1534081333815-ae5019106622?auto=format&fit=crop&w=600&q=80' },
    { title: 'Hoạt động trải nghiệm ngoại khóa', content: 'Học sinh khối 11 tham quan bảo tàng tỉnh Thái Bình.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'hoat-dong-ngoai-khoa', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
    { title: 'Lịch kiểm tra giữa kỳ II', content: 'Các lớp tiến hành kiểm tra giữa kỳ từ ngày 15 đến 22/3/2026.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'lich-kiem-tra-giua-ky-2', thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80' },
    { title: 'Tuyên dương học sinh tiêu biểu tháng 9', content: 'Nhà trường tuyên dương 20 học sinh tiêu biểu đạt thành tích xuất sắc.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'tuyen-duong-hoc-sinh-tieu-bieu', thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80' },
    { title: 'Triển khai thi thử tốt nghiệp THPT', content: 'Lịch thi thử sẽ diễn ra vào ngày 12-13/05/2026 cho khối 12.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-18T07:54:04.126Z', slug: 'thi-thu-tot-nghiep-2026', thumbnail: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=600&q=80' },
    { title: 'Tham gia Hội khỏe Phù Đổng cấp tỉnh', content: 'Đội tuyển thể thao của trường đạt 2 huy chương vàng và 1 huy chương bạc.', published: true, createdAt: '2025-10-10T21:42:59.996Z', updatedAt: '2025-10-10T21:42:59.996Z', slug: 'hoi-khoe-phu-dong', thumbnail: 'https://images.unsplash.com/photo-1533236897111-3e94666b2edf?auto=format&fit=crop&w=600&q=80' },
    { title: 'Ngày hội tư vấn tuyển sinh đại học 2026', content: 'Buổi tư vấn có sự tham gia của 10 trường đại học khu vực miền Bắc.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'ngay-hoi-tu-van-tuyen-sinh-2026', thumbnail: 'https://picsum.photos/id/433/600/400' },
    { title: 'Lễ trao thưởng học sinh đạt điểm cao kỳ thi THPT', content: 'Tôn vinh các em đạt trên 27 điểm trong kỳ thi THPT quốc gia.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-13T21:42:59.996Z', slug: 'le-trao-thuong-thpt-2026', thumbnail: 'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?auto=format&fit=crop&w=600&q=80' },
    { title: 'Kế hoạch tuyển sinh năm học 2025-2026', content: 'Nhà trường thông báo thời gian và chỉ tiêu tuyển sinh cho năm học mới.', published: false, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-18T07:49:23.668Z', slug: 'ke-hoach-tuyen-sinh-2025-2026', thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
    { title: 'Cuộc thi sáng tạo khoa học kỹ thuật', content: 'Học sinh trường giành 3 giải cao trong cuộc thi KHKT cấp tỉnh.', published: true, createdAt: '2025-10-13T21:42:59.996Z', updatedAt: '2025-10-18T07:54:04.126Z', slug: 'cuoc-thi-sang-tao-khkt', thumbnail: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=600&q=80' },
  ];

  await Promise.all(
    newsPayload.map((n) =>
      prisma.news.upsert({
        where: { slug: n.slug },
        update: {
          title: n.title,
          content: n.content,
          published: n.published,
          thumbnail: n.thumbnail,
          updatedAt: new Date(n.updatedAt),
          authorId: adminId,
        },
        create: {
          title: n.title,
          content: n.content,
          published: n.published,
          slug: n.slug,
          thumbnail: n.thumbnail,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
          authorId: adminId,
        },
      }),
    ),
  );
  console.log('📰 News ok');

  // ---------- GIÁO VIÊN ----------
  console.log('👩‍🏫 Seed giáo viên + user teacher...');
  const gvData = Array.from({ length: 10 }).map((_, i) => ({
    Magv: `GV${(i + 1).toString().padStart(3, '0')}`,
    Hotengv: [
      'Nguyễn Văn An',
      'Trần Thị Bình',
      'Phạm Minh Đức',
      'Lê Thu Hương',
      'Võ Quốc Khánh',
      'Đặng Văn Lợi',
      'Bùi Thị Mai',
      'Ngô Đức Nam',
      'Hoàng Thị Oanh',
      'Đỗ Quang Phúc',
    ][i],
    Ngaysinh: new Date(1980 + i, 5, 15),
    Gioitinh: i % 2 === 0 ? GioiTinh.NAM : GioiTinh.NU,
    SDT: `090${i}12345`,
    Email: `gv${i + 1}@gmail.com`,
  }));
  await prisma.giaovien.createMany({ data: gvData, skipDuplicates: true });

  await Promise.all(
    gvData.map(async (gv) =>
      prisma.user.upsert({
        where: { email: gv.Email! },
        update: {
          name: gv.Hotengv,
          role: Role.TEACHER,
          password: await ahash(`teacher${gv.Magv}`),
        },
        create: {
          email: gv.Email!,
          password: await ahash(`teacher${gv.Magv}`),
          name: gv.Hotengv,
          role: Role.TEACHER,
        },
      }),
    ),
  );

  // ---------- LỚP ----------
  console.log('🏫 Seed lớp...');
  await prisma.lop.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      Malop: `10A${i + 1}`,
      Tenlop: `Lớp 10A${i + 1}`,
      Magv: `GV${(i + 1).toString().padStart(3, '0')}`, // GVCN
    })),
    skipDuplicates: true,
  });

  // ---------- MÔN HỌC ----------
  console.log('📘 Seed môn học...');
  await prisma.monhoc.createMany({
    data: [
      { Mamon: 'TOAN', Tenmon: 'Toán học', Magv: 'GV001' },
      { Mamon: 'VAN',  Tenmon: 'Ngữ văn',  Magv: 'GV002' },
      { Mamon: 'ANH',  Tenmon: 'Tiếng Anh',Magv: 'GV003' },
      { Mamon: 'LY',   Tenmon: 'Vật lý',   Magv: 'GV004' },
      { Mamon: 'HOA',  Tenmon: 'Hóa học',  Magv: 'GV005' },
      { Mamon: 'SINH', Tenmon: 'Sinh học', Magv: 'GV006' },
      { Mamon: 'SU',   Tenmon: 'Lịch sử',  Magv: 'GV007' },
      { Mamon: 'DIA',  Tenmon: 'Địa lý',   Magv: 'GV008' },
      { Mamon: 'CN',   Tenmon: 'Công nghệ',Magv: 'GV009' },
      { Mamon: 'TD',   Tenmon: 'Thể dục',  Magv: 'GV010' },
    ],
    skipDuplicates: true,
  });

  // ---------- HỌC SINH ----------
  console.log('👨‍🎓 Seed học sinh + user student...');
  const hsData = Array.from({ length: 20 }).map((_, i) => ({
    Mahs: `HS${(i + 1).toString().padStart(3, '0')}`,
    Hotenhs: [
      'Nguyễn Văn Hòa','Trần Thị Thu','Lê Đức Anh','Phạm Thanh Tùng',
      'Vũ Thị Hoa','Đỗ Ngọc Linh','Ngô Minh Đức','Bùi Thị Lan',
      'Hoàng Gia Huy','Phan Hải Yến','Phạm Mai Anh','Vũ Tiến Dũng',
      'Nguyễn Hồng Quân','Trần Bảo Ngọc','Đào Minh Khang','Đinh Đức Long',
      'Phạm Quỳnh Anh','Hoàng Minh Châu','Lý Thanh Tâm','Nguyễn Hải Đăng'
    ][i],
    Diachi: `Phường ${i + 1}, Quận Hoàn Kiếm, Hà Nội`,
    Ngaysinh: new Date(2008, i % 12, 10 + (i % 15)),
    Gioitinh: i % 2 === 0 ? GioiTinh.NAM : GioiTinh.NU,
    Malop: `10A${(i % 5) + 1}`,
  }));
  await prisma.hocsinh.createMany({ data: hsData, skipDuplicates: true });

  await Promise.all(
    hsData.map(async (hs) => {
      const email = `${hs.Mahs.toLowerCase()}@gmail.com`;
      const raw = `${hs.Mahs}${hs.Malop}`; // HS00110A1
      return prisma.user.upsert({
        where: { email },
        update: {
          name: hs.Hotenhs,
          role: Role.USER,
          password: await ahash(raw),
        },
        create: {
          email,
          password: await ahash(raw),
          name: hs.Hotenhs,
          role: Role.USER,
        },
      });
    }),
  );

  // ---------- GIẢNG DẠY ----------
  console.log('📚 Seed giảng dạy...');
  // sử dụng năm học đang active = NH2425 -> Namhoc = 2025
  const NamhocVal = 2025;
  const subjects = ['TOAN', 'VAN', 'ANH', 'LY', 'HOA'] as const;
  const classes = ['10A1', '10A2', '10A3', '10A4', '10A5'] as const;
  const teachers = ['GV001', 'GV002', 'GV003', 'GV004', 'GV005'] as const;

  const gdList: GiangdayModel[] = [];
  for (let i = 0; i < 10; i++) {
    const Hk = i % 2 === 0 ? Hocky.HK1 : Hocky.HK2;
    const Magv = teachers[i % teachers.length];
    const Malop = classes[i % classes.length];
    const Mamon = subjects[i % subjects.length];
    const gd = await prisma.giangday.create({
      data: { Namhoc: NamhocVal, Hocky: Hk, Magv, Malop, Mamon },
    });
    gdList.push(gd);
  }

  // ---------- ĐIỂM + CHI TIẾT ----------
  console.log('🧮 Seed điểm + chi tiết...');
  const hsCodes = await prisma.hocsinh.findMany({
    select: { Mahs: true, Malop: true },
  });

  const diemList: DiemModel[] = [];
  for (let i = 0; i < 20; i++) {
    const hs = hsCodes[i % hsCodes.length];
    const Hk = i % 2 === 0 ? Hocky.HK1 : Hocky.HK2;
    const Mamon = subjects[i % subjects.length];
    const gd = gdList.find(
      (g) =>
        g.Namhoc === NamhocVal &&
        g.Hocky === Hk &&
        g.Mamon === Mamon &&
        g.Malop === hs.Malop
    );

    const diem = await prisma.diem.create({
      data: {
        Namhoc: NamhocVal,
        Hocky: Hk,
        Mamon,
        Mahs: hs.Mahs,
        DiemTH: rand(),
        Diem15p: rand(),
        Diemmieng: rand(),
        Diemhs2: rand(),
        Diemhs3: rand(),
        Diemtbmon: rand(7, 9),
        Diemtbnam: rand(7, 9),
        GiangdayId: gd?.STT ?? null,
      },
    });
    diemList.push(diem);
  }

  for (const d of diemList) {
    await prisma.chitietdiem.createMany({
      data: [
        { Madiem: d.Madiem, Diem: rand(6, 10) },
        { Madiem: d.Madiem, Diem: rand(6, 10) },
        { Madiem: d.Madiem, Diem: rand(6, 10) },
      ],
    });
  }

  // ---------- ĐIỂM RÈN LUYỆN ----------
  console.log('🏅 Seed DRL...');
  const drlData = hsCodes.slice(0, 15).map((hs, i) => ({
    Mahs: hs.Mahs,
    Malop: hs.Malop!,
    Namhoc: NamhocVal,
    Hocky: i % 2 === 0 ? Hocky.HK1 : Hocky.HK2,
    Diem: 70 + (i % 30),
    Note: i % 3 === 0 ? 'Chăm chỉ, tích cực' : null,
    createdBy: 'system-seed',
  }));
  await prisma.diemRL.createMany({ data: drlData });

  console.log('✅ Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
