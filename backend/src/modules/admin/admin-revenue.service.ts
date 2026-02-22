import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface RevenueOverview {
  totalRevenue: string;
  totalOrders: number;
}

@Injectable()
export class AdminRevenueService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<RevenueOverview> {
    const [aggregate, totalOrders] = await Promise.all([
      this.prisma.purchaseTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' },
      }),
      this.prisma.purchaseTransaction.count({ where: { status: 'SUCCESS' } }),
    ]);

    return {
      totalRevenue: aggregate._sum.amount?.toString() ?? '0.00',
      totalOrders,
    };
  }
}
