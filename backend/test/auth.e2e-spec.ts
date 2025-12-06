import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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

    // ⬇️ CRITICAL: This enables validation logic (like @IsEmail) in the test environment
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

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

    // Clean DB before each test so we don't get "Email already taken" errors
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
          // 1. Check for Token
          expect(res.body).toHaveProperty('accessToken');

          // 2. Check User Data
          expect(res.body.user).toHaveProperty('email', testUser.email);
          expect(res.body.user).toHaveProperty('fullName', testUser.fullName);

          // 3. SECURITY CHECK: Password must NOT be in the response
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail if email is not valid', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email', // Invalid email
          password: '123',
          fullName: 'Test',
        })
        .expect(400); // Expect Bad Request
    });
  });
});
