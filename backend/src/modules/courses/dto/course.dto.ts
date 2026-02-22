import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { CursorPaginationDto } from '../../../common/pagination/cursor-pagination.dto';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 199000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ example: 199000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

export class CourseCursorQueryDto extends CursorPaginationDto {}
