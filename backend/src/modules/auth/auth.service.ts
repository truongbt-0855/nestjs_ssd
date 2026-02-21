import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const allowedEmails = new Set([
      'admin@nestlearn.local',
      'instructor@nestlearn.local',
      'student@nestlearn.local',
    ]);

    if (!allowedEmails.has(payload.email)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, await bcrypt.hash(payload.password, 10));
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = payload.email.startsWith('admin')
      ? 'ADMIN'
      : payload.email.startsWith('instructor')
        ? 'INSTRUCTOR'
        : 'STUDENT';

    const accessToken = await this.jwtService.signAsync({
      sub: payload.email,
      email: payload.email,
      role,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
