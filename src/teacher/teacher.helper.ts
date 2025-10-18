import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export async function getMagvFromUserEmail(prisma: PrismaService, userEmail: string): Promise<string> {
  if (!userEmail) throw new ForbiddenException('No email');
  const u = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!u || u.role !== 'TEACHER') throw new ForbiddenException('Not a teacher');

  const gv = await prisma.giaovien.findUnique({ where: { Email: userEmail } });
  if (!gv) throw new NotFoundException('Teacher profile not found');
  return gv.Magv;
}
