import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  notification: {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 1, ...dto.data })),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
  },
  loan: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

const mockGateway = {
  sendToUser: jest.fn(),
  sendToRole: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let gateway: NotificationsGateway;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should save to DB and emit socket event', async () => {
      const dto = {
        userId: 'student_1',
        title: 'Test',
        body: 'Body',
        data: { route: '/home' },
      };

      await service.create(dto);

      // Verify DB save
      expect(prisma.notification.create).toHaveBeenCalled();

      // Verify Socket emit
      expect(gateway.sendToUser).toHaveBeenCalledWith(
        'student_1',
        expect.objectContaining({
          title: 'Test',
          data: { route: '/home' },
        }),
      );
    });
  });

  describe('handleOverdueLoans', () => {
    it('should check for overdue loans and notify', async () => {
      // Mock finding one overdue loan
      const overdueLoan = {
        id: 10,
        userId: 'student_1',
        dueDate: new Date(),
        book: { title: 'NestJS Basics' },
      };

      jest.spyOn(prisma.loan, 'findMany').mockResolvedValue([overdueLoan] as any);

      await service.handleOverdueLoans();

      // Should verify that create() was called effectively
      expect(gateway.sendToUser).toHaveBeenCalledWith(
        'student_1',
        expect.objectContaining({
          title: 'Book Overdue',
          body: expect.stringContaining('NestJS Basics'),
        }),
      );
    });
  });
});
