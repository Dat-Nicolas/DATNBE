import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateNamHocDto } from './create-namhoc.dto';

// KHÔNG cho update "code" (khóa chính)
export class UpdateNamHocDto extends PartialType(
  OmitType(CreateNamHocDto, ['code'] as const),
) {}
