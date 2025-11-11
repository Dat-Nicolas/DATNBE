import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateHocKyDto } from './create-hocky.dto';

// KHÔNG cho update "code" (khóa chính)
export class UpdateHocKyDto extends PartialType(
  OmitType(CreateHocKyDto, ['code'] as const),
) {}
