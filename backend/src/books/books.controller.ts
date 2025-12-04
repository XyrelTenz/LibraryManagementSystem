import { Controller, Get, ParseIntPipe, Param } from "@nestjs/common";
import { BookService } from "./books.service";

@Controller()
export class BookController {

  constructor(private readonly bookService: BookService) { }

  @Get()
  findAll() {
    return this.bookService.getBooks();
  }

  @Get(":id")
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getBooksID(id);
  }

}
