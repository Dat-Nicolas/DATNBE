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


export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    sortBy: string;
    order: 'asc' | 'desc';
  };
};

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
  sortBy: string,
  order: 'asc' | 'desc',
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    sortBy,
    order,
  };
}