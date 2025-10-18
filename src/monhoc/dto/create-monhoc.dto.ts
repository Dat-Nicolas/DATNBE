import { IsOptional, IsString } from 'class-validator';
export class CreateMonhocDto {
  @IsString() Mamon: string;
  @IsString() Tenmon: string;
  @IsOptional() @IsString() Magv?: string; 
}
