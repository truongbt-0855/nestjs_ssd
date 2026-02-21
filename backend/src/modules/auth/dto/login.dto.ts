import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'student@nestlearn.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Student@123' })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  tokenType!: string;
}
