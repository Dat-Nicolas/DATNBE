import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { GioiTinh } from '@prisma/client';

export class CreateHocsinhDto {
  @IsString() Mahs: string;
  @IsString() Hotenhs: string;
  @IsOptional() @IsString() Diachi?: string;
  @IsDateString() Ngaysinh: string;            
  @IsEnum(GioiTinh) Gioitinh: GioiTinh;
  @IsOptional() @IsString() Malop?: string;     
}
