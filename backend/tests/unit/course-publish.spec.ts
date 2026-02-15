import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from '../../src/modules/course/course.service';
import { PrismaService } from '../../src/services/prisma.service';
import { CourseStatus, Role } from '@prisma/client';

describe('Course Publish/Unpublish (T026)', () => {
  let courseService: CourseService;
  let prisma: PrismaService;

  let instructorId: string;
  let otherInstructorId: string;
  let courseId: string;

  beforeAll(async () => {
    prisma = new PrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);

    // Create test instructors
    const instructor = await prisma.user.create({
      data: {
        email: `instructor-pub-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test Instructor',
        role: Role.INSTRUCTOR,
      },
    });
    instructorId = instructor.id;

    const otherInstructor = await prisma.user.create({
      data: {
        email: `other-inst-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Other Instructor',
        role: Role.INSTRUCTOR,
      },
    });
    otherInstructorId = otherInstructor.id;

    // Create test course
    const course = await prisma.course.create({
      data: {
        title: 'Test Course for Publishing',
        description: 'A course to test publish/unpublish',
        status: CourseStatus.DRAFT,
        ownerId: instructorId,
      },
    });
    courseId = course.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.course.deleteMany({ where: { ownerId: instructorId } });
    await prisma.course.deleteMany({ where: { ownerId: otherInstructorId } });
    await prisma.user.delete({ where: { id: instructorId } });
    await prisma.user.delete({ where: { id: otherInstructorId } });
    await prisma.$disconnect();
  });

  describe('updateStatus - Publish course', () => {
    it('should publish a draft course', async () => {
      const result = await courseService.updateStatus(courseId, instructorId, CourseStatus.PUBLISHED);
      expect(result.status).toBe(CourseStatus.PUBLISHED);
    });

    it('should update course in database to published status', async () => {
      const dbCourse = await prisma.course.findUnique({ where: { id: courseId } });
      expect(dbCourse.status).toBe(CourseStatus.PUBLISHED);
    });

    it('should throw error if course does not exist', async () => {
      const fakeId = 'non-existent-id-12345';
      await expect(courseService.updateStatus(fakeId, instructorId, CourseStatus.PUBLISHED)).rejects.toThrow();
    });

    it('should throw error if user does not own the course', async () => {
      await expect(courseService.updateStatus(courseId, otherInstructorId, CourseStatus.PUBLISHED)).rejects.toThrow();
    });
  });

  describe('updateStatus - Unpublish course', () => {
    beforeEach(async () => {
      // Ensure course is published
      await prisma.course.update({
        where: { id: courseId },
        data: { status: CourseStatus.PUBLISHED },
      });
    });

    it('should unpublish a published course', async () => {
      const result = await courseService.updateStatus(courseId, instructorId, CourseStatus.DRAFT);
      expect(result.status).toBe(CourseStatus.DRAFT);
    });

    it('should update course in database to draft status', async () => {
      await courseService.updateStatus(courseId, instructorId, CourseStatus.DRAFT);
      const dbCourse = await prisma.course.findUnique({ where: { id: courseId } });
      expect(dbCourse.status).toBe(CourseStatus.DRAFT);
    });

    it('should throw error if user does not own the course', async () => {
      await expect(courseService.updateStatus(courseId, otherInstructorId, CourseStatus.DRAFT)).rejects.toThrow();
    });
  });

  describe('Toggle publish status multiple times', () => {
    it('should toggle between published and draft status correctly', async () => {
      // Start from draft
      await prisma.course.update({
        where: { id: courseId },
        data: { status: CourseStatus.DRAFT },
      });

      // Publish
      let result = await courseService.updateStatus(courseId, instructorId, CourseStatus.PUBLISHED);
      expect(result.status).toBe(CourseStatus.PUBLISHED);

      // Unpublish
      result = await courseService.updateStatus(courseId, instructorId, CourseStatus.DRAFT);
      expect(result.status).toBe(CourseStatus.DRAFT);

      // Publish again
      result = await courseService.updateStatus(courseId, instructorId, CourseStatus.PUBLISHED);
      expect(result.status).toBe(CourseStatus.PUBLISHED);
    });
  });
});
