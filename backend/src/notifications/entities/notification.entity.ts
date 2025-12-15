import { Notification } from '@prisma/client';

export class NotificationEntity implements Notification {
  id: number;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data: string | null;
  createdAt: Date;
}
