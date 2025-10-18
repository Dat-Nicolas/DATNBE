import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt() @Min(1)
  limit?: number = 20;
}
export function toSkipTake({ page = 1, limit = 20 }: PaginationDto) {
  const take = Math.min(Math.max(limit, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;
  return { skip, take };
}
