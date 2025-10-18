import { PartialType } from '@nestjs/swagger';
import { CreateGiangdayDto } from './create-giangday.dto';

export class UpdateGiangdayDto extends PartialType(CreateGiangdayDto) {}
