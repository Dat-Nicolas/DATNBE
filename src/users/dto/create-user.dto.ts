import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';

const ROLES = ['USER', 'ADMIN'] as const;
type Role = (typeof ROLES)[number];

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsIn(ROLES)
  role: Role;
}
