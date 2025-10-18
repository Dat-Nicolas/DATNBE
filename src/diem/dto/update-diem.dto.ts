import { PartialType } from '@nestjs/swagger';
import { CreateDiemDto } from './create-diem.dto';

export class UpdateDiemDto extends PartialType(CreateDiemDto) {}
