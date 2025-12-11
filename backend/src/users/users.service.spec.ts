import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../shared/enums/role.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

const mockUserId = 'uuid-1234';
const mockDate = new Date();

const mockUserDto = {
  email: 'test@example.com',
  fullName: 'Xyrel D. Tenefrancia',
  password: 'password123',
  role: UserRole.STUDENT,
};

const mockUserRecord = {
  id: mockUserId,
  email: mockUserDto.email,
  fullName: mockUserDto.fullName,
  role: mockUserDto.role,
  password: 'hashed_password_123',
  createdAt: mockDate,
  updatedAt: mockDate,
};

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password and create a user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_123');
      mockPrismaService.user.create.mockResolvedValue(mockUserRecord);

      const result = await service.create(mockUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUserDto,
          password: 'hashed_password_123',
        },
      });
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toEqual(mockUserId);
    });
  });

  describe('findAll', () => {
    it('should return an array of UserEntities', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUserRecord]);
      const result = await service.findAll();
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result[0]).toBeInstanceOf(UserEntity);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);
      const result = await service.findOne(mockUserId);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should hash password if provided and update user', async () => {
      const updateUserDto = { password: 'newPassword' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');

      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUserRecord,
        password: 'hashed_new_password',
      });

      const result = await service.update(mockUserId, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { password: 'hashed_new_password' },
      });
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should not hash password if not provided', async () => {
      const updateUserDto = { fullName: 'Updated Name' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUserRecord, fullName: 'Updated Name' });

      await service.update(mockUserId, updateUserDto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateUserDto,
      });
    });

    it('should fail if user to update does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.update(mockUserId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the user if they exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);
      mockPrismaService.user.delete.mockResolvedValue(mockUserRecord);

      const result = await service.remove(mockUserId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should fail if user to remove does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.remove(mockUserId)).rejects.toThrow(NotFoundException);
    });
  });
});
