import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BorrowingModule } from './borrowing/borrowing.module';
import { NotificationsModule } from './notifications/notifications.module';

// Core/Shared Modules
import { PrismaModule } from '.././prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,

    AuthModule,
    UsersModule,
    BorrowingModule,
    NotificationsModule,

    // RouterModule.register([
    //   {
    //     path: 'library', 
    //     module: BookModules,
    //   },
    // ]),
  ],
})
export class AppModule { }
