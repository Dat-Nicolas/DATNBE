-- DropForeignKey
ALTER TABLE "public"."Giangday" DROP CONSTRAINT "Giangday_Magv_fkey";

-- CreateTable
CREATE TABLE "NamHoc" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NamHoc_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "HocKy" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearCode" TEXT NOT NULL,

    CONSTRAINT "HocKy_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "HocKy_yearCode_idx" ON "HocKy"("yearCode");

-- AddForeignKey
ALTER TABLE "HocKy" ADD CONSTRAINT "HocKy_yearCode_fkey" FOREIGN KEY ("yearCode") REFERENCES "NamHoc"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Giangday" ADD CONSTRAINT "Giangday_Magv_fkey" FOREIGN KEY ("Magv") REFERENCES "Giaovien"("Magv") ON DELETE CASCADE ON UPDATE CASCADE;
