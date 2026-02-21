import { Injectable } from '@nestjs/common';

export interface RevenueOverview {
  totalRevenue: string;
  totalOrders: number;
}

@Injectable()
export class AdminRevenueService {
  async getOverview(): Promise<RevenueOverview> {
    return {
      totalRevenue: '0.00',
      totalOrders: 0,
    };
  }
}
