import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Con trỏ bản ghi kế tiếp' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Giới hạn bản ghi', default: '10' })
  @IsOptional()
  @IsString()
  limit?: string;
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}
