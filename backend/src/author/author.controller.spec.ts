import { Test, TestingModule } from '@nestjs/testing';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';

describe('AuthorController', () => {
  let controller: AuthorController;

  const mockAuthorService = {
    create: jest.fn((dto) => {
      return { id: Date.now(), ...dto };
    }),
    findAll: jest.fn(() => []),
    findOne: jest.fn((id) => ({ id, name: 'Test Author' })),
    update: jest.fn((id, dto) => ({ id, ...dto })),
    remove: jest.fn((id) => ({ id, deleted: true })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [
        {
          provide: AuthorService,
          useValue: mockAuthorService,
        },
      ],
    }).compile();

    controller = module.get<AuthorController>(AuthorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an author', async () => {
    const dto = { name: 'New Author' };
    expect(await controller.create(dto)).toEqual(
      expect.objectContaining({ name: 'New Author' }),
    );
  });

  it('should find all authors', async () => {
    expect(await controller.findAll()).toEqual([]);
  });

  it('should find one author', async () => {
    expect(await controller.findOne(1)).toEqual(
      expect.objectContaining({ id: 1 }),
    );
  });
});
