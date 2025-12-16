import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Tech' };
      prisma.category.create.mockResolvedValue({ id: 1, ...dto });

      expect(await service.create(dto)).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return array of categories', async () => {
      prisma.category.findMany.mockResolvedValue([{ id: 1, name: 'Tech' }]);
      expect(await service.findAll()).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a category', async () => {
      prisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Tech' });
      expect(await service.findOne(1)).toEqual({ id: 1, name: 'Tech' });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
