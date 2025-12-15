import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { UserRole } from '../shared/enums/role.enum';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let gateway: NotificationsGateway;

  // Mock Prisma Client
  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    loan: {
      findMany: jest.fn(),
    },
  };

  // Mock WebSocket Gateway
  const mockGateway = {
    sendToUser: jest.fn(),
    sendToRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should save to DB (stringify data) and emit to Gateway (raw data)', async () => {
      const dto = {
        userId: 'student_1',
        title: 'Test',
        body: 'Content',
        type: 'INFO',
        data: { route: '/home' },
      };

      const savedNotification = {
        id: 1,
        ...dto,
        data: JSON.stringify(dto.data), // DB stores string
      };

      mockPrismaService.notification.create.mockResolvedValue(savedNotification);

      await service.create(dto);

      // 1. Verify DB Storage (JSON.stringify)
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: dto.userId,
          title: dto.title,
          body: dto.body,
          type: dto.type,
          data: '{"route":"/home"}', // Expect stringified JSON
        },
      });

      // 2. Verify Gateway Emission (Raw Object)
      expect(gateway.sendToUser).toHaveBeenCalledWith(dto.userId, {
        ...savedNotification,
        data: dto.data, // Expect actual object
      });
    });
  });

  describe('findAll', () => {
    it('should return notifications with parsed JSON data', async () => {
      const dbNotifications = [
        { id: 1, title: 'A', data: '{"id":1}' },
        { id: 2, title: 'B', data: null },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(dbNotifications);

      const result = await service.findAll('user_1');

      expect(result).toEqual([
        { id: 1, title: 'A', data: { id: 1 } }, // Parsed
        { id: 2, title: 'B', data: null },      // Null handled
      ]);
    });
  });

  describe('handleOverdueLoans (Cron)', () => {
    it('should notify students and librarians about overdue loans', async () => {
      const overdueLoans = [
        {
          id: 101,
          userId: 'student_A',
          book: { title: 'NestJS Guide' },
        },
        {
          id: 102,
          userId: 'student_B',
          book: { title: 'Clean Code' },
        },
      ];

      // Mock finding overdue loans
      mockPrismaService.loan.findMany.mockResolvedValue(overdueLoans);

      // Spy on the create method to ensure it's called for each student
      const createSpy = jest.spyOn(service, 'create').mockResolvedValue({} as any);

      await service.handleOverdueLoans();

      // Check if students were notified
      expect(createSpy).toHaveBeenCalledTimes(2);
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'student_A',
        title: 'Book Overdue',
        data: { route: '/loans/details', loanId: 101 },
      }));

      // Check if Librarian was notified (Summary)
      expect(gateway.sendToRole).toHaveBeenCalledWith(
        UserRole.LIBRARIAN,
        expect.objectContaining({
          title: 'Overdue Report',
          body: '2 books are overdue today.',
        }),
      );
    });

    it('should NOT notify librarian if no books are overdue', async (): Promise<void> => {
      mockPrismaService.loan.findMany.mockResolvedValue([]);

      await service.handleOverdueLoans();

      expect(gateway.sendToRole).not.toHaveBeenCalled();
    });
  });
});
