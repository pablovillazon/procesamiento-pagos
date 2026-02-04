import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuthService } from '../../src/auth/auth.service';
import { Role } from '../../src/generated/prisma/enums';
import * as bcrypt from 'bcryptjs';

describe('Auth Integration Tests (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let authService: AuthService;
  let testUserId: string;
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    // Clean up test user if exists
    await prismaService.user.deleteMany({ where: { email: testEmail } });

    // Create test user
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prismaService.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        role: Role.OPERATOR,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test user
    await prismaService.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should fail login with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        });

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should fail login with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        });

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notanemail',
          password: testPassword,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject password shorter than 6 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'short',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('AuthService - validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const user = await authService.validateUser(testEmail, testPassword);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
    });

    it('should return null for invalid password', async () => {
      const user = await authService.validateUser(testEmail, 'wrongpassword');
      expect(user).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const user = await authService.validateUser('nonexistent@example.com', testPassword);
      expect(user).toBeNull();
    });
  });

  describe('AuthService - login', () => {
    it('should generate a valid JWT token on login', async () => {
      const user = await authService.validateUser(testEmail, testPassword);
      const result = await authService.login(user ?? null!);

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
      expect(result.access_token.split('.').length).toBe(3); // JWT has 3 parts
    });
  });

  describe('Auth + DB integration', () => {
    it('creates user and authenticates', async () => {
      await request(app.getHttpServer())      
      .post('/users')
      .send({ email: 'admin@test.com', password: 'secret123' })
      .expect(201)

      const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'secret123' })
      .expect(201)

      expect(res.body.access_token).toBeDefined()
    })
  });
});
