import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  book: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('BookService', () => {
  let service: BookService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const dto = { title: 'Test Book', isbn: '123', totalCopies: 5, authorIds: [], categoryId: 1 };
      const result = { id: 1, ...dto, availableCopies: 5 };

      prisma.book.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const result = [{ id: 1, title: 'Book 1' }];
      prisma.book.findMany.mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const result = { id: 1, title: 'Book 1' };
      prisma.book.findUnique.mockResolvedValue(result);

      expect(await service.findOne(1)).toEqual(result);
    });

    it('should throw NotFoundException if book not found', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });
});
