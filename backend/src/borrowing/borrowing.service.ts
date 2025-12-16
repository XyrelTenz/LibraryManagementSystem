import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';

@Injectable()
export class BorrowingService {
  constructor(private readonly prisma: PrismaService) { }

  // Borrow Book
  async create(dto: CreateBorrowingDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Check Book Availability
      const book = await tx.book.findUnique({ where: { id: dto.bookId } });
      if (!book) throw new NotFoundException('Book not found');
      if (book.availableCopies < 1) throw new BadRequestException('Book not available');

      // Check User
      const user = await tx.user.findUnique({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('User not found');

      // Decrement Stock
      await tx.book.update({
        where: { id: dto.bookId },
        data: { availableCopies: { decrement: 1 } },
      });

      // Create Loan
      return await tx.loan.create({
        data: {
          bookId: dto.bookId,
          userId: dto.userId,
          dueDate: new Date(dto.dueDate),
          status: 'BORROWED',
        },
      });
    });
  }

  // Return Book
  async returnBook(id: number) {
    return await this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id } });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.status === 'RETURNED') throw new BadRequestException('Already returned');

      const now = new Date();
      let penalty = 0.0;
      let status = 'RETURNED';

      // Penalty
      if (now > loan.dueDate) {
        const diffTime = Math.abs(now.getTime() - loan.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        penalty = diffDays * 5.0;
        status = 'OVERDUE';
      }

      // Update Loan
      const updatedLoan = await tx.loan.update({
        where: { id },
        data: {
          returnedAt: now,
          status: status,
          penalty: penalty,
        },
      });

      // Increment Stock
      await tx.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      });

      return updatedLoan;
    });
  }

  async findAll() {
    return this.prisma.loan.findMany({
      include: { book: true, user: true },
      orderBy: { borrowedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { book: true, user: true },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  // Admin Override Update
  async update(id: number, dto: UpdateBorrowingDto) {
    return this.prisma.loan.update({
      where: { id },
      data: dto,
    });
  }
}
