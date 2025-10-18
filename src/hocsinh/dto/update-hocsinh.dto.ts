import { PartialType } from '@nestjs/swagger';
import { CreateHocsinhDto } from './create-hocsinh.dto';

export class UpdateHocsinhDto extends PartialType(CreateHocsinhDto) {}
