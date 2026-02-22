import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { PurchasedCourseItem, UserProfile, UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser('sub') userId: string): Promise<UserProfile> {
    return this.usersService.getProfile(userId);
  }

  @Get('my-courses')
  @Roles('STUDENT')
  async getMyCourses(@CurrentUser('sub') userId: string): Promise<PurchasedCourseItem[]> {
    return this.usersService.getPurchasedCourses(userId);
  }
}
