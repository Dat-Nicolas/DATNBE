import { PartialType } from '@nestjs/swagger';
import { CreateMonhocDto } from './create-monhoc.dto';

export class UpdateMonhocDto extends PartialType(CreateMonhocDto) {}
