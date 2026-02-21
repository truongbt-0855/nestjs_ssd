import { Injectable } from '@nestjs/common';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  balance: string;
}

@Injectable()
export class UsersService {
  async getProfile(userId: string): Promise<UserProfile> {
    return {
      id: userId,
      email: 'student@nestlearn.local',
      fullName: 'Demo Student',
      role: 'STUDENT',
      balance: '1000.00',
    };
  }
}
