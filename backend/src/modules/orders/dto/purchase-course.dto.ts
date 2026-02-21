import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PurchaseCourseDto {
  @ApiProperty()
  @IsString()
  courseId!: string;
}

export class PurchaseCourseResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;
}
