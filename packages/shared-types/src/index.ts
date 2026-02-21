export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface PurchaseCoursePayload {
  courseId: string;
}

export interface RevenueOverviewDto {
  totalRevenue: string;
  totalOrders: number;
}
