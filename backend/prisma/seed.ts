import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUserWithWallet(input: {
  email: string;
  fullName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  password: string;
  balance: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      role: input.role,
      passwordHash,
    },
    create: {
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      passwordHash,
    },
  });

  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: { balance: input.balance },
    create: {
      userId: user.id,
      balance: input.balance,
    },
  });
}

async function main(): Promise<void> {
  await upsertUserWithWallet({
    email: 'admin@nestlearn.local',
    fullName: 'System Admin',
    role: 'ADMIN',
    password: 'Admin@123',
    balance: '0',
  });

  await upsertUserWithWallet({
    email: 'instructor@nestlearn.local',
    fullName: 'Demo Instructor',
    role: 'INSTRUCTOR',
    password: 'Instructor@123',
    balance: '0',
  });

  await upsertUserWithWallet({
    email: 'student@nestlearn.local',
    fullName: 'Demo Student',
    role: 'STUDENT',
    password: 'Student@123',
    balance: '1000000',
  });

  const nestBasic = await prisma.course.upsert({
    where: { id: 'seed-course-nest-basic' },
    update: {
      title: 'NestJS Basic',
      description: 'Khóa học nền tảng NestJS',
      price: '199000',
      published: true,
    },
    create: {
      id: 'seed-course-nest-basic',
      title: 'NestJS Basic',
      description: 'Khóa học nền tảng NestJS',
      price: '199000',
      published: true,
    },
  });

  const nestAdvanced = await prisma.course.upsert({
    where: { id: 'seed-course-nest-advanced' },
    update: {
      title: 'NestJS Advanced',
      description: 'Module hóa, CQRS và background jobs',
      price: '299000',
      published: true,
    },
    create: {
      id: 'seed-course-nest-advanced',
      title: 'NestJS Advanced',
      description: 'Module hóa, CQRS và background jobs',
      price: '299000',
      published: true,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'seed-lesson-1' },
    update: {
      courseId: nestBasic.id,
      title: 'Giới thiệu NestJS',
      videoUrl: 'https://example.com/video/nest-basic-1.mp4',
      order: 1,
    },
    create: {
      id: 'seed-lesson-1',
      courseId: nestBasic.id,
      title: 'Giới thiệu NestJS',
      videoUrl: 'https://example.com/video/nest-basic-1.mp4',
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: 'seed-lesson-2' },
    update: {
      courseId: nestAdvanced.id,
      title: 'Event-driven với BullMQ',
      videoUrl: 'https://example.com/video/nest-advanced-1.mp4',
      order: 1,
    },
    create: {
      id: 'seed-lesson-2',
      courseId: nestAdvanced.id,
      title: 'Event-driven với BullMQ',
      videoUrl: 'https://example.com/video/nest-advanced-1.mp4',
      order: 1,
    },
  });
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
