import { IsOptional, IsString, IsEmail, IsEnum, IsArray } from 'class-validator';

export class UpdateGiaovienDto {
  @IsOptional() @IsString() Magv?: string;
  @IsOptional() @IsString() Hotengv?: string;
  @IsOptional() @IsEmail()  Email?: string;
  @IsOptional() @IsString() SDT?: string;
  @IsOptional() @IsEnum({ NAM: 'NAM', NU: 'NU', KHAC: 'KHAC' })
  Gioitinh?: 'NAM' | 'NU' | 'KHAC';
  @IsOptional() @IsString() Ngaysinh?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  ChuNhiemMalop?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  MonPhuTrachMamon?: string[];
}
