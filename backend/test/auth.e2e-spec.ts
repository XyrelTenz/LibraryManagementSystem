import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Auth System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/auth/register (POST)', () => {
    const testUser = {
      email: 'newstudent@school.edu',
      password: 'securePassword123',
      fullName: 'Juan Dela Cruz',
    };

    beforeEach(async () => {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    });

    it('should register a new student and return a JWT token', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res: any) => {
          // Validation Logic
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user).toHaveProperty('email', testUser.email);
          expect(res.body.user).not.toHaveProperty('password'); // Security check
        });
    });

    it('should fail if email is not valid', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: '123',
          fullName: 'Test',
        })
        .expect(400);
    });
  });
});
