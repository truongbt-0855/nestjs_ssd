import { CourseStatus } from '@prisma/client';

export class Course {
  id: string;
  title: string;
  description?: string;
  status: CourseStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
