import { Injectable } from "@nestjs/common";

@Injectable()
export class BookService {
  getBooks(): string {
    return "Book Service";
  }

  getBooksID(id: number) {
    return `You are looking for Book ID: ${id}`;
  }
}
