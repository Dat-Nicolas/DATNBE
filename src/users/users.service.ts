import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async create(dto: CreateUserDto) {
    const password = await argon2.hash(dto.password);
    return this.prisma.user.create({ data: { ...dto, password } });
  }

  async update(id: number, dto: UpdateUserDto) {
    if (dto.password) dto.password = await argon2.hash(dto.password);
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
