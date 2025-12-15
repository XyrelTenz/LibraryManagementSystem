import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';

@Controller()
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) { }

  @Post()
  create(@Body() createBorrowingDto: CreateBorrowingDto) {
    return this.borrowingService.create(createBorrowingDto);
  }

  @Get()
  findAll() {
    return this.borrowingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.borrowingService.findOne(id);
  }

  // Specific Endpoint to Return a Book
  @Patch(':id/return')
  returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.borrowingService.returnBook(id);
  }

  // General Update (For Admin Corrections)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBorrowingDto: UpdateBorrowingDto) {
    return this.borrowingService.update(id, updateBorrowingDto);
  }
}
