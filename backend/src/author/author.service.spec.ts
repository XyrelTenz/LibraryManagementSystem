import { Test, TestingModule } from '@nestjs/testing';
import { AuthorService } from './author.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  author: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AuthorService', () => {
  let service: AuthorService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthorService>(AuthorService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an author', async () => {
      const dto = { name: 'Test Author' };
      prisma.author.create.mockResolvedValue({ id: 1, ...dto });

      expect(await service.create(dto)).toEqual({ id: 1, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      const result = [{ id: 1, name: 'Test' }];
      prisma.author.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single author', async () => {
      const result = { id: 1, name: 'Test' };
      prisma.author.findUnique.mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });

    it('should throw NotFoundException if author not found', async () => {
      prisma.author.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
