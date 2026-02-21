import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminRevenueService } from './admin-revenue.service';

@Module({
  controllers: [AdminController],
  providers: [AdminRevenueService],
  exports: [AdminRevenueService],
})
export class AdminModule {}
