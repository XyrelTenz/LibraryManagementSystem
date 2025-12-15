import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserRole } from '../shared/enums/role.enum';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  // Mock the Service methods
  const mockNotificationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the dto', async () => {
      const dto: CreateNotificationDto = {
        userId: 'student_1',
        title: 'Test',
        body: 'Body',
        type: 'INFO',
      };

      const expectedResult = { id: 1, ...dto, data: null };
      mockNotificationsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should retrieve notifications for the logged-in user', async () => {
      const mockRequest = { user: { userId: 'user_123', role: UserRole.STUDENT } };
      const expectedResult = [{ id: 1, title: 'Test' }];

      mockNotificationsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('user_123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a notification status', async () => {
      const dto: UpdateNotificationDto = { isRead: true };
      const id = '1';
      const expectedResult = { id: 1, isRead: true };

      mockNotificationsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
