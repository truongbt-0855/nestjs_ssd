import { PrismaClient, Role, CourseStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (for dev/testing only)
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  const passwordHash = await bcrypt.hash('password123', 10);
  const instructor = await prisma.user.create({
    data: {
      name: 'Instructor One',
      email: 'instructor1@example.com',
      password: passwordHash,
      role: Role.INSTRUCTOR,
    },
  });
  const student = await prisma.user.create({
    data: {
      name: 'Student One',
      email: 'student1@example.com',
      password: passwordHash,
      role: Role.STUDENT,
    },
  });

  // Seed courses
  await prisma.course.createMany({
    data: [
      {
        title: 'NestJS Fundamentals',
        description: 'Learn the basics of NestJS',
        status: CourseStatus.PUBLISHED,
        ownerId: instructor.id,
      },
      {
        title: 'React for Beginners',
        description: 'Introduction to React and hooks',
        status: CourseStatus.DRAFT,
        ownerId: instructor.id,
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
