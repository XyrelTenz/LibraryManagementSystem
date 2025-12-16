import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingService } from './borrowing.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

const mockTx = {
  book: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  loan: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockPrismaService = {
  $transaction: jest.fn((callback) => callback(mockTx)),
  loan: {
    findMany: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('BorrowingService', () => {
  let service: BorrowingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BorrowingService>(BorrowingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (Borrow)', () => {
    it('should borrow a book successfully', async () => {
      mockTx.book.findUnique.mockResolvedValue({ id: 1, availableCopies: 5 });
      mockTx.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockTx.loan.create.mockResolvedValue({ id: 1, status: 'BORROWED' });

      const dto = { bookId: 1, userId: 'user-1', dueDate: '2025-12-31' };
      const result = await service.create(dto);

      expect(result).toEqual({ id: 1, status: 'BORROWED' });
      expect(mockTx.book.update).toHaveBeenCalled();
    });

    // 👇 NEW TEST CASE FOR YOUR ISSUE
    it('should ensure bookId is treated as a number when querying', async () => {
      // Setup mocks
      mockTx.book.findUnique.mockResolvedValue({ id: 1, availableCopies: 5 });
      mockTx.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockTx.loan.create.mockResolvedValue({ id: 1, status: 'BORROWED' });

      // Simulate a payload where bookId is a STRING "1" (as any to bypass TS check)
      const dto = { bookId: '1' as any, userId: 'user-1', dueDate: '2025-12-31' };

      await service.create(dto);

      // The Critical Check:
      // Verify that Prisma was called with the NUMBER 1, not String "1"
      expect(mockTx.book.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 } // <--- Expecting Number here
        })
      );
    });

    it('should fail if no copies available', async () => {
      mockTx.book.findUnique.mockResolvedValue({ id: 1, availableCopies: 0 }); // 0 copies

      const dto = { bookId: 1, userId: 'user-1', dueDate: '2025-12-31' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('returnBook', () => {
    it('should return a book and calculate penalty', async () => {
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 5);

      mockTx.loan.findUnique.mockResolvedValue({
        id: 1,
        dueDate: pastDueDate,
        status: 'BORROWED',
        bookId: 10
      });

      mockTx.loan.update.mockResolvedValue({ id: 1, status: 'OVERDUE', penalty: 25 });

      const result = await service.returnBook(1);

      expect(result.status).toBe('OVERDUE');
      expect(mockTx.book.update).toHaveBeenCalled();
    });
  });
});
