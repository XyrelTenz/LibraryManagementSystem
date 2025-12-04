import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModules } from './books/books.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    BookModules,
    RouterModule.register([
      {
        path: "book",
        module: BookModules
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

