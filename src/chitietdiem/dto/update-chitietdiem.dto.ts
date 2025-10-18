import { PartialType } from '@nestjs/swagger';
import { CreateChitietdiemDto } from './create-chitietdiem.dto';

export class UpdateChitietdiemDto extends PartialType(CreateChitietdiemDto) {}
