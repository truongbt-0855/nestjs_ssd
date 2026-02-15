import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CourseModule } from '../../src/modules/course/course.module';
import { PrismaService } from '../../src/services/prisma.service';
import { CourseStatus, Role } from '@prisma/client';

describe('Published Course Listing Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let testUser1Id: string;
  let testUser2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CourseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: `test-instructor-1-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test Instructor 1',
        role: Role.INSTRUCTOR,
      },
    });
    testUser1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: `test-instructor-2-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test Instructor 2',
        role: Role.INSTRUCTOR,
      },
    });
    testUser2Id = user2.id;
  });

  afterAll(async () => {
    // Clean up test users and their courses
    await prisma.course.deleteMany({
      where: {
        ownerId: { in: [testUser1Id, testUser2Id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUser1Id, testUser2Id] },
      },
    });
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test courses before each test
    await prisma.course.deleteMany({
      where: {
        ownerId: { in: [testUser1Id, testUser2Id] },
      },
    });
  });

  describe('GET /courses/published - List Published Courses', () => {
    it('should return array when querying published courses', async () => {
      const response = await request(app.getHttpServer())
        .get('/courses/published')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Published courses retrieved successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return only published courses', async () => {
      // Create mix of draft and published courses
      await prisma.course.createMany({
        data: [
          {
            title: 'Published Course 1',
            description: 'Description 1',
            status: CourseStatus.PUBLISHED,
            ownerId: testUser1Id,
          },
          {
            title: 'Draft Course 1',
            description: 'Description 2',
            status: CourseStatus.DRAFT,
            ownerId: testUser1Id,
          },
          {
            title: 'Published Course 2',
            description: 'Description 3',
            status: CourseStatus.PUBLISHED,
            ownerId: testUser2Id,
          },
          {
            title: 'Draft Course 2',
            description: 'Description 4',
            status: CourseStatus.DRAFT,
            ownerId: testUser2Id,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/courses/published')
        .expect(200);

      // All returned courses should be published
      expect(response.body.data.every((c: any) => c.status === CourseStatus.PUBLISHED)).toBe(true);
      
      // Our two published courses should be in the results
      const titles = response.body.data.map((c: any) => c.title);
      expect(titles).toContain('Published Course 1');
      expect(titles).toContain('Published Course 2');
      
      // Draft courses should NOT be in results
      expect(titles).not.toContain('Draft Course 1');
      expect(titles).not.toContain('Draft Course 2');
    });

    it('should return published courses from all instructors', async () => {
      await prisma.course.createMany({
        data: [
          {
            title: 'Instructor 1 Course',
            description: 'Course by instructor 1',
            status: CourseStatus.PUBLISHED,
            ownerId: testUser1Id,
          },
          {
            title: 'Instructor 2 Course',
            description: 'Course by instructor 2',
            status: CourseStatus.PUBLISHED,
            ownerId: testUser2Id,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/courses/published')
        .expect(200);

      // Our test courses should be in the results
      const courses = response.body.data;
      const testCourses = courses.filter((c: any) => 
        c.ownerId === testUser1Id || c.ownerId === testUser2Id
      );
      
      expect(testCourses).toHaveLength(2);
      const ownerIds = testCourses.map((c: any) => c.ownerId);
      expect(ownerIds).toContain(testUser1Id);
      expect(ownerIds).toContain(testUser2Id);
    });

    it('should return courses ordered by creation date (newest first)', async () => {
      // Create courses with slight delay to ensure different timestamps
      const course1 = await prisma.course.create({
        data: {
          title: 'Older Course',
          description: 'Created first',
          status: CourseStatus.PUBLISHED,
          ownerId: testUser1Id,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const course2 = await prisma.course.create({
        data: {
          title: 'Newer Course',
          description: 'Created second',
          status: CourseStatus.PUBLISHED,
          ownerId: testUser1Id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/courses/published')
        .expect(200);

      // Find our test courses in the results
      const courses = response.body.data;
      const olderCourse = courses.find((c: any) => c.id === course1.id);
      const newerCourse = courses.find((c: any) => c.id === course2.id);
      
      expect(olderCourse).toBeDefined();
      expect(newerCourse).toBeDefined();
      
      // Newer course should appear before older course (descending order)
      const olderIndex = courses.indexOf(olderCourse);
      const newerIndex = courses.indexOf(newerCourse);
      expect(newerIndex).toBeLessThan(olderIndex);
    });

    it('should return all required fields for each course', async () => {
      const createdCourse = await prisma.course.create({
        data: {
          title: 'Test Course',
          description: 'Test Description',
          status: CourseStatus.PUBLISHED,
          ownerId: testUser1Id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/courses/published')
        .expect(200);

      // Find our test course in the results
      const course = response.body.data.find((c: any) => c.id === createdCourse.id);
      expect(course).toBeDefined();

      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('title', 'Test Course');
      expect(course).toHaveProperty('description', 'Test Description');
      expect(course).toHaveProperty('status', CourseStatus.PUBLISHED);
      expect(course).toHaveProperty('ownerId', testUser1Id);
      expect(course).toHaveProperty('createdAt');
      expect(course).toHaveProperty('updatedAt');
    });

    it('should not require authentication', async () => {
      const createdCourse = await prisma.course.create({
        data: {
          title: 'Public Course',
          description: 'Accessible without auth',
          status: CourseStatus.PUBLISHED,
          ownerId: testUser1Id,
        },
      });

      // Request without Authorization header
      const response = await request(app.getHttpServer())
        .get('/courses/published')
        .expect(200);

      // Our course should be in the results
      const course = response.body.data.find((c: any) => c.id === createdCourse.id);
      expect(course).toBeDefined();
      expect(course.title).toBe('Public Course');
    });

    it('should handle empty description field', async () => {
      const createdCourse = await prisma.course.create({
        data: {
          title: 'Course Without Description',
          description: null,
          status: CourseStatus.PUBLISHED,
          ownerId: testUser1Id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/courses/published')
        .expect(200);

      // Find our course in the results
      const course = response.body.data.find((c: any) => c.id === createdCourse.id);
      expect(course).toBeDefined();
      expect(course.description).toBeNull();
    });
  });
});
