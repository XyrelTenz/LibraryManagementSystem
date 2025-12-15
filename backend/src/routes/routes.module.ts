import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { BorrowingModule } from '../borrowing/borrowing.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BorrowingModule,
    NotificationsModule,

    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
      },
      {
        path: 'users',
        module: UsersModule,
      },
      {
        path: 'borrowing',
        module: BorrowingModule,
      },
      {
        path: 'notifications',
        module: NotificationsModule,
      },
    ]),
  ],
})
export class RoutesModule { }
