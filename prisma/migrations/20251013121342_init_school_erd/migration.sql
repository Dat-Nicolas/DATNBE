/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `News` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GioiTinh" AS ENUM ('NAM', 'NU', 'KHAC');

-- CreateEnum
CREATE TYPE "Hocky" AS ENUM ('HK1', 'HK2', 'HK_HE');

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT;

-- CreateTable
CREATE TABLE "Lop" (
    "Malop" TEXT NOT NULL,
    "Tenlop" TEXT,
    "Magv" TEXT,

    CONSTRAINT "Lop_pkey" PRIMARY KEY ("Malop")
);

-- CreateTable
CREATE TABLE "Hocsinh" (
    "Mahs" TEXT NOT NULL,
    "Hotenhs" TEXT NOT NULL,
    "Diachi" TEXT,
    "Ngaysinh" TIMESTAMP(3) NOT NULL,
    "Gioitinh" "GioiTinh" NOT NULL,
    "Malop" TEXT,

    CONSTRAINT "Hocsinh_pkey" PRIMARY KEY ("Mahs")
);

-- CreateTable
CREATE TABLE "Giaovien" (
    "Magv" TEXT NOT NULL,
    "Hotengv" TEXT NOT NULL,
    "Ngaysinh" TIMESTAMP(3),
    "Gioitinh" "GioiTinh",
    "SDT" TEXT,
    "Email" TEXT,

    CONSTRAINT "Giaovien_pkey" PRIMARY KEY ("Magv")
);

-- CreateTable
CREATE TABLE "Monhoc" (
    "Mamon" TEXT NOT NULL,
    "Tenmon" TEXT NOT NULL,
    "Magv" TEXT,

    CONSTRAINT "Monhoc_pkey" PRIMARY KEY ("Mamon")
);

-- CreateTable
CREATE TABLE "Giangday" (
    "STT" SERIAL NOT NULL,
    "Namhoc" INTEGER NOT NULL,
    "Hocky" "Hocky" NOT NULL,
    "Magv" TEXT NOT NULL,
    "Malop" TEXT NOT NULL,
    "Mamon" TEXT NOT NULL,

    CONSTRAINT "Giangday_pkey" PRIMARY KEY ("STT")
);

-- CreateTable
CREATE TABLE "Diem" (
    "Madiem" SERIAL NOT NULL,
    "DiemTH" DOUBLE PRECISION,
    "Diem15p" DOUBLE PRECISION,
    "Diemmieng" DOUBLE PRECISION,
    "Diemhs2" DOUBLE PRECISION,
    "Diemhs3" DOUBLE PRECISION,
    "Diemtbmon" DOUBLE PRECISION,
    "Diemtbnam" DOUBLE PRECISION,
    "Namhoc" INTEGER NOT NULL,
    "Hocky" "Hocky" NOT NULL,
    "Mamon" TEXT NOT NULL,
    "Mahs" TEXT NOT NULL,
    "GiangdayId" INTEGER,

    CONSTRAINT "Diem_pkey" PRIMARY KEY ("Madiem")
);

-- CreateTable
CREATE TABLE "Chitietdiem" (
    "Machitietdiem" SERIAL NOT NULL,
    "Diem" DOUBLE PRECISION NOT NULL,
    "Madiem" INTEGER NOT NULL,

    CONSTRAINT "Chitietdiem_pkey" PRIMARY KEY ("Machitietdiem")
);

-- CreateIndex
CREATE UNIQUE INDEX "Giaovien_Email_key" ON "Giaovien"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Giangday_Namhoc_Hocky_Magv_Malop_Mamon_key" ON "Giangday"("Namhoc", "Hocky", "Magv", "Malop", "Mamon");

-- CreateIndex
CREATE UNIQUE INDEX "Diem_Mahs_Mamon_Namhoc_Hocky_key" ON "Diem"("Mahs", "Mamon", "Namhoc", "Hocky");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- AddForeignKey
ALTER TABLE "Lop" ADD CONSTRAINT "Lop_Magv_fkey" FOREIGN KEY ("Magv") REFERENCES "Giaovien"("Magv") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hocsinh" ADD CONSTRAINT "Hocsinh_Malop_fkey" FOREIGN KEY ("Malop") REFERENCES "Lop"("Malop") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monhoc" ADD CONSTRAINT "Monhoc_Magv_fkey" FOREIGN KEY ("Magv") REFERENCES "Giaovien"("Magv") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Giangday" ADD CONSTRAINT "Giangday_Magv_fkey" FOREIGN KEY ("Magv") REFERENCES "Giaovien"("Magv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Giangday" ADD CONSTRAINT "Giangday_Malop_fkey" FOREIGN KEY ("Malop") REFERENCES "Lop"("Malop") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Giangday" ADD CONSTRAINT "Giangday_Mamon_fkey" FOREIGN KEY ("Mamon") REFERENCES "Monhoc"("Mamon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diem" ADD CONSTRAINT "Diem_Mahs_fkey" FOREIGN KEY ("Mahs") REFERENCES "Hocsinh"("Mahs") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diem" ADD CONSTRAINT "Diem_Mamon_fkey" FOREIGN KEY ("Mamon") REFERENCES "Monhoc"("Mamon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diem" ADD CONSTRAINT "Diem_GiangdayId_fkey" FOREIGN KEY ("GiangdayId") REFERENCES "Giangday"("STT") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chitietdiem" ADD CONSTRAINT "Chitietdiem_Madiem_fkey" FOREIGN KEY ("Madiem") REFERENCES "Diem"("Madiem") ON DELETE CASCADE ON UPDATE CASCADE;
