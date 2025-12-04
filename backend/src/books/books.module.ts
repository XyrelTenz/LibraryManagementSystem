
import { Module } from '@nestjs/common';
import { BookService } from './books.service';
import { BookController } from './books.controller';

@Module({
  imports: [],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModules { }
