import { IsOptional, IsString } from 'class-validator';

export class CreateLopDto {
  @IsString() Malop: string;
  @IsOptional() @IsString() Tenlop?: string;
  @IsOptional() @IsString() Magv?: string; 
}
