import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CourseModule } from '../../src/modules/course/course.module';
import { PrismaService } from '../../src/services/prisma.service';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { CourseStatus, Role } from '@prisma/client';

describe('Course CRUD Contract Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockUser = {
    id: 'test-user-id-1',
    email: 'instructor@test.com',
    role: Role.INSTRUCTOR,
  };

  const mockUserOther = {
    id: 'test-user-id-2',
    email: 'other@test.com',
    role: Role.INSTRUCTOR,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CourseModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const request = context.switchToHttp().getRequest();
          request.user = mockUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.course.deleteMany({
      where: {
        ownerId: { in: [mockUser.id, mockUserOther.id] },
      },
    });
  });

  describe('POST /courses - Create Course', () => {
    it('should create a new course with valid data', async () => {
      const createDto = {
        title: 'Test Course',
        description: 'Test Description',
      };

      const response = await request(app.getHttpServer())
        .post('/courses')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Course created successfully');
      expect(response.body.data).toMatchObject({
        title: createDto.title,
        description: createDto.description,
        ownerId: mockUser.id,
        status: CourseStatus.DRAFT,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should fail with missing title', async () => {
      const createDto = {
        description: 'Test Description',
      };

      await request(app.getHttpServer())
        .post('/courses')
        .send(createDto)
        .expect(400);
    });

    it('should fail with empty title', async () => {
      const createDto = {
        title: '',
        description: 'Test Description',
      };

      await request(app.getHttpServer())
        .post('/courses')
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /courses - List Courses', () => {
    it('should return empty array when no courses exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/courses')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Courses retrieved successfully');
      expect(response.body.data).toEqual([]);
    });

    it('should return only courses owned by current user', async () => {
      // Create courses for mockUser
      await prisma.course.createMany({
        data: [
          {
            title: 'Course 1',
            description: 'Description 1',
            ownerId: mockUser.id,
          },
          {
            title: 'Course 2',
            description: 'Description 2',
            ownerId: mockUser.id,
          },
        ],
      });

      // Create course for other user
      await prisma.course.create({
        data: {
          title: 'Other Course',
          description: 'Other Description',
          ownerId: mockUserOther.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/courses')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((c: any) => c.ownerId === mockUser.id)).toBe(true);
    });
  });

  describe('GET /courses/:id - Get Single Course', () => {
    it('should return course when user owns it', async () => {
      const course = await prisma.course.create({
        data: {
          title: 'Test Course',
          description: 'Test Description',
          ownerId: mockUser.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/courses/${course.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Course retrieved successfully');
      expect(response.body.data).toMatchObject({
        id: course.id,
        title: course.title,
        description: course.description,
        ownerId: mockUser.id,
      });
    });

    it('should return 404 when course does not exist', async () => {
      await request(app.getHttpServer())
        .get('/courses/non-existent-id')
        .expect(404);
    });

    it('should return 403 when user does not own the course', async () => {
      const course = await prisma.course.create({
        data: {
          title: 'Other Course',
          description: 'Other Description',
          ownerId: mockUserOther.id,
        },
      });

      await request(app.getHttpServer())
        .get(`/courses/${course.id}`)
        .expect(403);
    });
  });

  describe('PUT /courses/:id - Update Course', () => {
    it('should update course when user owns it', async () => {
      const course = await prisma.course.create({
        data: {
          title: 'Original Title',
          description: 'Original Description',
          ownerId: mockUser.id,
        },
      });

      const updateDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const response = await request(app.getHttpServer())
        .put(`/courses/${course.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Course updated successfully');
      expect(response.body.data).toMatchObject({
        id: course.id,
        title: updateDto.title,
        description: updateDto.description,
        ownerId: mockUser.id,
      });
    });

    it('should allow partial update', async () => {
      const course = await prisma.course.create({
        data: {
          title: 'Original Title',
          description: 'Original Description',
          ownerId: mockUser.id,
        },
      });

      const updateDto = {
        title: 'Updated Title Only',
      };

      const response = await request(app.getHttpServer())
        .put(`/courses/${course.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: course.id,
        title: updateDto.title,
        description: 'Original Description', // Should remain unchanged
      });
    });

    it('should return 403 when user does not own the course', async () => {
      const course = await prisma.course.create({
        data: {
          title: 'Other Course',
          description: 'Other Description',
          ownerId: mockUserOther.id,
        },
      });

      const updateDto = {
        title: 'Updated Title',
      };

      await request(app.getHttpServer())
        .put(`/courses/${course.id}`)
        .send(updateDto)
        .expect(403);
    });

    it('should return 404 when course does not exist', async () => {
      const updateDto = {
        title: 'Updated Title',
      };

      await request(app.getHttpServer())
        .put('/courses/non-existent-id')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /courses/:id - Delete Course', () => {
    it('should delete course when user owns it', async () => {
      const course = await prisma.course.create({
        data: {
          title: 'Test Course',
          description: 'Test Description',
          ownerId: mockUser.id,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/courses/${course.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data', null);
      expect(response.body).toHaveProperty('message', 'Course deleted successfully');

      // Verify course is deleted
      const deletedCourse = await prisma.course.findUnique({
        where: { id: course.id },
      });
      expect(deletedCourse).toBeNull();
    });

    it('should return 403 when user does not own the course', async () => {
      const course = await prisma.course.create({
        data: {
          title: 'Other Course',
          description: 'Other Description',
          ownerId: mockUserOther.id,
        },
      });

      await request(app.getHttpServer())
        .delete(`/courses/${course.id}`)
        .expect(403);

      // Verify course still exists
      const existingCourse = await prisma.course.findUnique({
        where: { id: course.id },
      });
      expect(existingCourse).not.toBeNull();
    });

    it('should return 404 when course does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/courses/non-existent-id')
        .expect(404);
    });
  });
});
