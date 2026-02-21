import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CursorPaginationDto } from '../../../common/pagination/cursor-pagination.dto';

export class CreateLessonDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  order!: number;
}

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;
}

export class LessonCursorQueryDto extends CursorPaginationDto {}
