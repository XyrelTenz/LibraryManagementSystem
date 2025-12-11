import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../shared/enums/role.enum';

// 1. Define Mock Data
const mockUserId = 'uuid-1234';
const mockDate = new Date();

// FIX: Changed 'name' to 'fullName' to match your DTO
const mockUserDto = {
  email: 'test@example.com',
  fullName: 'Xyrel D. Tenefrancia',
  password: 'password123',
  role: UserRole.STUDENT, // Added role since it's in your DTO (optional but good to have)
};

// FIX: Updated the DB simulator record to match the DTO fields
const mockUserRecord = {
  id: mockUserId,
  email: mockUserDto.email,
  fullName: mockUserDto.fullName, // matches DTO
  role: mockUserDto.role,
  password: 'hashed_password_123',
  createdAt: mockDate,
  updatedAt: mockDate,
};

// 2. Create a Mock for PrismaService
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

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE ---
  describe('create', () => {
    it('should hash the password and create a user', async () => {
      // Arrange
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed_password_123'));
      mockPrismaService.user.create.mockResolvedValue(mockUserRecord);

      // Act
      const result = await service.create(mockUserDto);

      // Assert
      expect(hashSpy).toHaveBeenCalledWith(mockUserDto.password, 10);
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

  // --- FIND ALL ---
  describe('findAll', () => {
    it('should return an array of UserEntities', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([mockUserRecord]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[0].email).toEqual(mockUserRecord.email);
    });
  });

  // --- FIND ONE ---
  describe('findOne', () => {
    it('should return a user if found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);

      // Act
      const result = await service.findOne(mockUserId);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // --- UPDATE ---
  describe('update', () => {
    it('should hash password if provided and update user', async () => {
      // Arrange
      const updateUserDto = { password: 'newPassword' };
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed_new_password'));

      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUserRecord,
        password: 'hashed_new_password',
      });

      // Act
      const result = await service.update(mockUserId, updateUserDto);

      // Assert
      expect(hashSpy).toHaveBeenCalledWith('newPassword', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { password: 'hashed_new_password' },
      });
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should not hash password if not provided', async () => {
      // Arrange
      // FIX: Changed 'name' to 'fullName' to match DTO
      const updateUserDto = { fullName: 'Updated Name' };
      const hashSpy = jest.spyOn(bcrypt, 'hash');

      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUserRecord, fullName: 'Updated Name' });

      // Act
      await service.update(mockUserId, updateUserDto);

      // Assert
      expect(hashSpy).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateUserDto,
      });
    });

    it('should fail if user to update does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(mockUserId, {})).rejects.toThrow(NotFoundException);
    });
  });

  // --- REMOVE ---
  describe('remove', () => {
    it('should remove the user if they exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserRecord);
      mockPrismaService.user.delete.mockResolvedValue(mockUserRecord);

      // Act
      const result = await service.remove(mockUserId);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: mockUserId } });
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should fail if user to remove does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(mockUserId)).rejects.toThrow(NotFoundException);
    });
  });
});
