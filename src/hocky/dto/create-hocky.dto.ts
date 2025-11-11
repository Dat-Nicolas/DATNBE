import { IsString, Length } from 'class-validator';

export class CreateHocKyDto {
  @IsString()
  @Length(2, 32)
  code: string;       // VD: HK1-2425

  @IsString()
  @Length(2, 128)
  name: string;       // VD: Học kỳ I

  @IsString()
  @Length(2, 32)
  yearCode: string;   // FK → NamHoc.code (VD: NH2425)
}
