import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRole } from '../shared/enums/role.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) { }

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

    const payload = {
      ...notification,
      data: dto.data,
    };
    this.gateway.sendToUser(dto.userId, payload);

    return notification;
  }

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

  async update(id: number, dto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: dto.isRead },
    });
  }

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
      this.gateway.sendToRole(UserRole.LIBRARIAN, {
        title: 'Overdue Report',
        body: `${overdueLoans.length} books are overdue today.`,
      });
    }
  }
}
