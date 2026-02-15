import { PrismaClient, Role, CourseStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed data...');

  // Clear existing data (for dev/testing only)
  console.log('🗑️  Clearing existing data...');
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // Seed instructors
  console.log('👨‍🏫 Creating instructors...');
  const instructor1 = await prisma.user.create({
    data: {
      name: 'Instructor One',
      email: 'instructor1@example.com',
      password: passwordHash,
      role: Role.INSTRUCTOR,
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Instructor Two',
      email: 'instructor2@example.com',
      password: passwordHash,
      role: Role.INSTRUCTOR,
    },
  });

  // Seed students
  console.log('👨‍🎓 Creating students...');
  const student1 = await prisma.user.create({
    data: {
      name: 'Student One',
      email: 'student1@example.com',
      password: passwordHash,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Student Two',
      email: 'student2@example.com',
      password: passwordHash,
      role: Role.STUDENT,
    },
  });

  // Seed courses
  console.log('📚 Creating courses...');
  const courses = await prisma.course.createMany({
    data: [
      // Instructor 1 - Published courses
      {
        title: 'NestJS Fundamentals',
        description: 'Learn the basics of NestJS, a progressive Node.js framework for building efficient server-side applications.',
        status: CourseStatus.PUBLISHED,
        ownerId: instructor1.id,
      },
      {
        title: 'TypeScript Mastery',
        description: 'Master TypeScript from basics to advanced concepts. Improve code quality and developer experience.',
        status: CourseStatus.PUBLISHED,
        ownerId: instructor1.id,
      },
      // Instructor 1 - Draft courses
      {
        title: 'Advanced NestJS Patterns',
        description: 'Deep dive into advanced NestJS patterns and best practices.',
        status: CourseStatus.DRAFT,
        ownerId: instructor1.id,
      },

      // Instructor 2 - Published courses
      {
        title: 'React for Beginners',
        description: 'Introduction to React and modern hooks. Build interactive user interfaces.',
        status: CourseStatus.PUBLISHED,
        ownerId: instructor2.id,
      },
      {
        title: 'GraphQL API Development',
        description: 'Build scalable and efficient APIs using GraphQL with Apollo Server.',
        status: CourseStatus.PUBLISHED,
        ownerId: instructor2.id,
      },
      {
        title: 'Tailwind CSS Advanced',
        description: 'Learn advanced Tailwind CSS techniques for building beautiful UIs.',
        status: CourseStatus.PUBLISHED,
        ownerId: instructor2.id,
      },
      // Instructor 2 - Draft courses
      {
        title: 'Next.js Full Stack',
        description: 'Build full stack applications with Next.js and modern tools.',
        status: CourseStatus.DRAFT,
        ownerId: instructor2.id,
      },
    ],
  });

  console.log(`✅ Seed data created successfully!`);
  console.log(`📊 Summary:`);
  console.log(`   - Instructors: 2`);
  console.log(`   - Students: 2`);
  console.log(`   - Total Courses: ${courses.count} (5 PUBLISHED, 2 DRAFT)`);
  console.log(`\n🔐 Login Credentials:`);
  console.log(`   Instructor: instructor1@example.com / password123`);
  console.log(`   Instructor: instructor2@example.com / password123`);
  console.log(`   Student: student1@example.com / password123`);
  console.log(`   Student: student2@example.com / password123`);
}



main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
