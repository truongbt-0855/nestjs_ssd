import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'NestJS Advanced Course',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn advanced NestJS concepts including GraphQL, Microservices, and Testing',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
