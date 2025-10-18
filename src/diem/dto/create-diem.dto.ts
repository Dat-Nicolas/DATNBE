import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Hocky } from '@prisma/client';

export class CreateDiemDto {
  @IsOptional() @IsNumber() @Min(0) @Max(10) DiemTH?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) Diem15p?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) Diemmieng?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) Diemhs2?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) Diemhs3?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) Diemtbmon?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) Diemtbnam?: number;

  @IsInt() Namhoc: number;
  @IsEnum(Hocky) Hocky: Hocky;

  @IsString() Mamon: string;
  @IsString() Mahs: string;
  @IsOptional() @IsInt() GiangdayId?: number;
}
