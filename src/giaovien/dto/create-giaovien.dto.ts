import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { GioiTinh } from '@prisma/client';

export class CreateGiaovienDto {
  @IsString() Magv: string;
  @IsString() Hotengv: string;
  @IsOptional() @IsDateString() Ngaysinh?: string;
  @IsOptional() @IsEnum(GioiTinh) Gioitinh?: GioiTinh;
  @IsOptional() @IsString() SDT?: string;
  @IsOptional() @IsEmail() Email?: string;
}
