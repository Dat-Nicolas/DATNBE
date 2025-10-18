-- CreateTable
CREATE TABLE "DiemRL" (
    "id" SERIAL NOT NULL,
    "Mahs" TEXT NOT NULL,
    "Malop" TEXT NOT NULL,
    "Namhoc" INTEGER NOT NULL,
    "Hocky" "Hocky" NOT NULL,
    "Diem" INTEGER NOT NULL,
    "Note" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiemRL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiemRL_Malop_Namhoc_Hocky_idx" ON "DiemRL"("Malop", "Namhoc", "Hocky");

-- CreateIndex
CREATE INDEX "DiemRL_Mahs_Namhoc_Hocky_idx" ON "DiemRL"("Mahs", "Namhoc", "Hocky");

-- AddForeignKey
ALTER TABLE "DiemRL" ADD CONSTRAINT "DiemRL_Mahs_fkey" FOREIGN KEY ("Mahs") REFERENCES "Hocsinh"("Mahs") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiemRL" ADD CONSTRAINT "DiemRL_Malop_fkey" FOREIGN KEY ("Malop") REFERENCES "Lop"("Malop") ON DELETE RESTRICT ON UPDATE CASCADE;
