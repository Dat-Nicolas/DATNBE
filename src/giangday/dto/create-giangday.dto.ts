import { IsEnum, IsInt, IsString } from 'class-validator';
import { Hocky } from '@prisma/client';

export class CreateGiangdayDto {
  @IsInt() Namhoc: number;
  @IsEnum(Hocky) Hocky: Hocky;

  @IsString() Magv: string;
  @IsString() Malop: string;
  @IsString() Mamon: string;
}
