import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { BorrowingModule } from '../borrowing/borrowing.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookModule } from '../book/book.module';
import { AuthorModule } from '../author/author.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BorrowingModule,
    NotificationsModule,
    BookModule,
    AuthorModule,
    CategoriesModule,

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
      {
        path: 'books',
        module: BookModule
      },
      {
        path: "authors",
        module: AuthorModule
      },
      {
        path: "categories",
        module: CategoriesModule
      }
    ]),
  ],
})
export class RoutesModule { }
