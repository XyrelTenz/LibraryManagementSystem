import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    create: jest.fn((dto) => ({ id: 1, ...dto })),
    findAll: jest.fn(() => []),
    findOne: jest.fn((id) => ({ id, name: 'Test' })),
    update: jest.fn((id, dto) => ({ id, ...dto })),
    remove: jest.fn((id) => ({ id, deleted: true })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a category', async () => {
    expect(await controller.create({ name: 'Fiction' })).toEqual({
      id: 1,
      name: 'Fiction',
    });
  });

  it('should find all categories', async () => {
    expect(await controller.findAll()).toEqual([]);
  });

  it('should find one category', async () => {
    expect(await controller.findOne(1)).toEqual(
      expect.objectContaining({ id: 1 }),
    );
  });
});
