import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Updated Course Title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Updated course description with more details',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
