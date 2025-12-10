import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';

const mockBookService = {
  create: jest.fn((dto) => ({ id: 1, ...dto })),
  findAll: jest.fn(() => [{ id: 1, title: 'Test Book' }]),
  findOne: jest.fn((id) => ({ id, title: 'Test Book' })),
  update: jest.fn((id, dto) => ({ id, ...dto })),
  remove: jest.fn((id) => ({ id, title: 'Deleted Book' })),
};

describe('BookController', () => {
  let controller: BookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [{ provide: BookService, useValue: mockBookService }],
    }).compile();

    controller = module.get<BookController>(BookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a book', async () => {
    const dto = { title: 'New Book', isbn: '111', totalCopies: 1, authorIds: [] };
    expect(await controller.create(dto)).toEqual({ id: 1, ...dto });
  });

  it('should get all books', async () => {
    expect(await controller.findAll()).toHaveLength(1);
  });

  it('should get one book', async () => {
    expect(await controller.findOne(1)).toEqual({ id: 1, title: 'Test Book' });
  });
});
