import { PartialType } from '@nestjs/mapped-types';
import { CreateLopDto } from './create-lop.dto';

export class UpdateLopDto extends PartialType(CreateLopDto) {}
