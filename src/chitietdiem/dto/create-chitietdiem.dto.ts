import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateChitietdiemDto {
  @IsNumber() @Min(0) @Max(10) Diem: number;
  @IsInt() Madiem: number;     // FK tới Diem.Madiem
}
