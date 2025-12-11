import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../shared/enums/role.enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'test@test.com', password: 'password' };

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashedPassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken and user if login successful', async () => {
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashedPassword', role: 'STUDENT' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mockToken');

      const result = await service.login(loginDto);

      expect(result.accessToken).toEqual('mockToken');
      expect(result.user).toBeDefined();
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, role: mockUser.role });
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@test.com',
      password: 'password',
      fullName: 'New User',
      role: UserRole.STUDENT
    };

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'new@test.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should create user and return token if email is unique', async () => {
      const mockUser = {
        id: '1',
        ...registerDto,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mockToken');

      const result = await service.register(registerDto);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toEqual('mockToken');
      expect(result.user.email).toEqual(registerDto.email);
    });
  });
});
