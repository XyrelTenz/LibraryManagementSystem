import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createBookDto: CreateBookDto) {
    const { authorIds, categoryId, ...data } = createBookDto;

    return this.prisma.book.create({
      data: {
        ...data,
        availableCopies: data.totalCopies,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        authors: authorIds
          ? { connect: authorIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { authors: true, category: true },
    });
  }

  async findAll(query?: string) {
    return this.prisma.book.findMany({
      where: query
        ? {
          OR: [
            { title: { contains: query } },
            { isbn: { contains: query } },
          ],
        }
        : undefined,
      include: { authors: true, category: true },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { authors: true, category: true, loans: true },
    });
    if (!book) throw new NotFoundException(`Book with ID ${id} not found`);
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const { authorIds, categoryId, ...data } = updateBookDto;

    return this.prisma.book.update({
      where: { id },
      data: {
        ...data,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        authors: authorIds
          ? { set: authorIds.map((id) => ({ id })) } // 'set' replaces existing authors
          : undefined,
      },
      include: { authors: true, category: true },
    });
  }

  async remove(id: number) {
    // Check if book exists first
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}
