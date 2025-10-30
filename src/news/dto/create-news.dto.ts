import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean = false;

  @IsOptional()
  @IsString()
  thumbnail?: string;
}
