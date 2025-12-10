import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingController } from './borrowing.controller';
import { BorrowingService } from './borrowing.service';

const mockBorrowingService = {
  create: jest.fn((dto) => ({ id: 1, status: 'BORROWED', ...dto })),
  findAll: jest.fn(() => []),
  findOne: jest.fn((id) => ({ id, status: 'BORROWED' })),
  returnBook: jest.fn((id) => ({ id, status: 'RETURNED', returnedAt: new Date() })),
};

describe('BorrowingController', () => {
  let controller: BorrowingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowingController],
      providers: [{ provide: BorrowingService, useValue: mockBorrowingService }],
    }).compile();

    controller = module.get<BorrowingController>(BorrowingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a loan', async () => {
    const dto = { bookId: 1, userId: 'uuid', dueDate: '2025-12-31' };
    expect(await controller.create(dto)).toHaveProperty('status', 'BORROWED');
  });

  it('should return a book', async () => {
    expect(await controller.returnBook(1)).toHaveProperty('status', 'RETURNED');
  });
});
