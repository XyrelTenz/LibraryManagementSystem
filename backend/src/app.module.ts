import { Module } from '@nestjs/common';
import { BookModules } from './books/books.module';
import { RouterModule } from '@nestjs/core';
import { BorrowingModule } from './borrowing/borrowing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    BookModules,
    RouterModule.register([
      {
        path: "book",
        module: BookModules
      }
    ]),
    BorrowingModule,
    NotificationsModule,
    AuthModule,
    BookModule,
    UsersModule
  ],
})
export class AppModule { }

