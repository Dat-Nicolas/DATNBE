import { PartialType } from '@nestjs/swagger';
import { CreateGiaovienDto } from './create-giaovien.dto';

export class UpdateGiaovienDto extends PartialType(CreateGiaovienDto) {}
