import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateNamHocDto {
  @IsString()
  @Length(2, 32)
  code: string;              // VD: NH2425

  @IsString()
  @Length(2, 128)
  name: string;              // VD: Năm học 2024-2025

  @IsOptional()
  @IsBoolean()
  active?: boolean;          // true/false
}
