import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) { }

  // 1. Create & Send
  async create(dto: CreateNotificationDto) {
    // Save to DB
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        data: dto.data ? JSON.stringify(dto.data) : null,
      },
    });

    // Send Real-time
    const payload = {
      ...notification,
      data: dto.data, // Send parsed object to client
    };
    this.gateway.sendToUser(dto.userId, payload);

    return notification;
  }

  // 2. Find All for User
  async findAll(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    }));
  }

  // 3. Mark as Read
  async update(id: number, dto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: dto.isRead },
    });
  }

  // 4. CRON JOB: Check Overdue Loans
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleOverdueLoans() {
    this.logger.log('Running daily overdue check...');

    const now = new Date();
    const overdueLoans = await this.prisma.loan.findMany({
      where: {
        dueDate: { lt: now },
        returnedAt: null,
        status: 'BORROWED',
      },
      include: { book: true },
    });

    for (const loan of overdueLoans) {
      await this.create({
        userId: loan.userId,
        title: 'Book Overdue',
        body: `Please return "${loan.book.title}" immediately.`,
        type: 'ALERT',
        data: { route: '/loans/details', loanId: loan.id },
      });
    }

    if (overdueLoans.length > 0) {
      this.gateway.sendToRole('LIBRARIAN', {
        title: 'Overdue Report',
        body: `${overdueLoans.length} books are overdue today.`,
      });
    }
  }
}
