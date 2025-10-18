import { PrismaClient, GioiTinh, Hocky, type Giangday, type Diem } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Đang reset database...')
  await prisma.chitietdiem.deleteMany()
  await prisma.diem.deleteMany()
  await prisma.giangday.deleteMany()
  await prisma.hocsinh.deleteMany()
  await prisma.monhoc.deleteMany()
  await prisma.lop.deleteMany()
  await prisma.giaovien.deleteMany()

  // ------------------ GIAO VIÊN ------------------
  console.log('👩‍🏫 Thêm giáo viên...')
  await prisma.giaovien.createMany({
    data: Array.from({ length: 10 }).map((_, i) => ({
      Magv: `GV${(i + 1).toString().padStart(3, '0')}`,
      Hotengv: [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Phạm Minh Đức', 'Lê Thu Hương', 'Võ Quốc Khánh',
        'Đặng Văn Lợi', 'Bùi Thị Mai', 'Ngô Đức Nam', 'Hoàng Thị Oanh', 'Đỗ Quang Phúc'
      ][i],
      Ngaysinh: new Date(1980 + i, 5, 15),
      Gioitinh: i % 2 === 0 ? GioiTinh.NAM : GioiTinh.NU,
      SDT: `090${i}12345`,
      Email: `gv${i + 1}@truongabc.edu.vn`,
    })),
  })

  // ------------------ MÔN HỌC ------------------
  console.log('📘 Thêm môn học...')
  await prisma.monhoc.createMany({
    data: [
      { Mamon: 'TOAN', Tenmon: 'Toán học', Magv: 'GV001' },
      { Mamon: 'VAN', Tenmon: 'Ngữ văn', Magv: 'GV002' },
      { Mamon: 'ANH', Tenmon: 'Tiếng Anh', Magv: 'GV003' },
      { Mamon: 'LY', Tenmon: 'Vật lý', Magv: 'GV004' },
      { Mamon: 'HOA', Tenmon: 'Hóa học', Magv: 'GV005' },
      { Mamon: 'SINH', Tenmon: 'Sinh học', Magv: 'GV006' },
      { Mamon: 'SU', Tenmon: 'Lịch sử', Magv: 'GV007' },
      { Mamon: 'DIA', Tenmon: 'Địa lý', Magv: 'GV008' },
      { Mamon: 'CN', Tenmon: 'Công nghệ', Magv: 'GV009' },
      { Mamon: 'TD', Tenmon: 'Thể dục', Magv: 'GV010' },
    ],
  })

  // ------------------ LỚP ------------------
  console.log('🏫 Thêm lớp...')
  await prisma.lop.createMany({
    data: Array.from({ length: 10 }).map((_, i) => ({
      Malop: `10A${i + 1}`,
      Tenlop: `Lớp 10A${i + 1}`,
      Magv: `GV00${(i % 5) + 1}`,
    })),
  })

  // ------------------ HỌC SINH ------------------
  console.log('👨‍🎓 Thêm học sinh...')
  await prisma.hocsinh.createMany({
    data: Array.from({ length: 10 }).map((_, i) => ({
      Mahs: `HS${(i + 1).toString().padStart(3, '0')}`,
      Hotenhs: [
        'Nguyễn Văn Hòa', 'Trần Thị Thu', 'Lê Đức Anh', 'Phạm Thanh Tùng', 'Vũ Thị Hoa',
        'Đỗ Ngọc Linh', 'Ngô Minh Đức', 'Bùi Thị Lan', 'Hoàng Gia Huy', 'Phan Hải Yến'
      ][i],
      Diachi: `Phường ${i + 1}, Quận Hoàn Kiếm, Hà Nội`,
      Ngaysinh: new Date(2008, i, 10 + i),
      Gioitinh: i % 2 === 0 ? GioiTinh.NAM : GioiTinh.NU,
      Malop: `10A${(i % 5) + 1}`,
    })),
  })

  // ------------------ GIẢNG DẠY ------------------
  console.log('📚 Thêm giảng dạy...')
  const gdList: Giangday[] = []                 // <-- định kiểu mảng
  for (let i = 0; i < 10; i++) {
    const giangday = await prisma.giangday.create({
      data: {
        Namhoc: 2025,
        Hocky: i % 2 === 0 ? Hocky.HK1 : Hocky.HK2 ,
        // KHÔNG set STT (tự autoincrement)
        Magv: `GV00${(i % 5) + 1}`,
        Malop: `10A${(i % 5) + 1}`,
        Mamon: ['TOAN', 'VAN', 'ANH', 'LY', 'HOA'][i % 5],
      },
    })
    gdList.push(giangday)
  }

  // ------------------ ĐIỂM ------------------
  console.log('🧮 Thêm điểm...')
  const diemList: Diem[] = []                   // <-- định kiểu mảng
  for (let i = 0; i < 10; i++) {
    const diem = await prisma.diem.create({
      data: {
        Namhoc: 2025,
        Hocky: Hocky.HK1,
        Mahs: `HS${( (i % 10) + 1 ).toString().padStart(3, '0')}`, // đảm bảo tồn tại
        Mamon: ['TOAN', 'VAN', 'ANH', 'LY', 'HOA'][i % 5],
        DiemTH: 6 + Math.random() * 4,
        Diem15p: 6 + Math.random() * 4,
        Diemmieng: 6 + Math.random() * 4,
        Diemhs2: 6 + Math.random() * 4,
        Diemhs3: 6 + Math.random() * 4,
        Diemtbmon: 7 + Math.random() * 2,
        Diemtbnam: 7 + Math.random() * 2,
        GiangdayId: gdList[i].STT,              // dùng STT trả về
      },
    })
    diemList.push(diem)
  }

  // ------------------ CHI TIẾT ĐIỂM ------------------
  console.log('📝 Thêm chi tiết điểm...')
  for (let i = 0; i < 10; i++) {
    await prisma.chitietdiem.create({
      data: {
        Diem: 7 + Math.random() * 3,
        Madiem: diemList[i].Madiem,
      },
    })
  }

  console.log('✅ Seed hoàn tất!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
