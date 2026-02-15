import { CourseStatus } from '@prisma/client';

export class CourseResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
