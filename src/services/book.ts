import Book, { BookDocument } from '../models/Book'
import { BadRequestError, InternalServerError } from '../helpers/apiError'

type FilterPayload = {
  title?: string;
  status?: string;
  author?: {};
  genres?: {};
}

type BorrowBookPayload = {
  authData: {
    email: string;
    userId: string;
  };
  returnedDate: Date;
}

type ReturnBookPayload = {
  authData: {
    email: string;
    userId: string;
  };
  returnedDate: Date;
}

const ISBNRegex = /^(97(8|9))?\d{9}(\d|X)$/

function findAll(): Promise<BookDocument[]> {
  return Book.find().sort({ title: 1, publishedDate: -1 }).exec()
}

function create(book: BookDocument): Promise<BookDocument> {
  return book.save()
}

function filtering(filter: FilterPayload): Promise<BookDocument[]> {
  const myFilter: FilterPayload = {}

  if (filter.title) {
    myFilter.title = filter.title
  }

  if (filter.status) {
    myFilter.status = filter.status
  }
  if (filter.author) {
    myFilter.author = { $in: filter.author }
  }
  if (filter.genres) {
    myFilter.genres = { $in: filter.genres }
  }

  return Book.find(myFilter)
    .sort({ title: 1, publishedDate: -1 })
    .then((book) => {
      if (book.length === 0) {
        throw new Error('Books not found')
      }

      return book
    })
}

function findByISBN(ISBN: string): Promise<BookDocument> {
  if (ISBN.match(ISBNRegex)) {
    return Book.findOne({ ISBN })
      .exec()
      .then((book) => {
        if (!book) {
          throw new Error(`Book with ISBN ${ISBN} not found`)
        }
        return book
      })
  } else {
    throw new BadRequestError('Invalid ISBN')
  }
}

function updateBook(
  ISBN: string,
  update: Partial<BookDocument>
): Promise<BookDocument> {
  if (ISBN.match(ISBNRegex)) {
    return findByISBN(ISBN).then((book) => {
      if (!book) {
        throw new Error(`Book with ISBN ${ISBN} not found`)
      }
      if (update.title) {
        book.title = update.title
      }
      if (update.description) {
        book.description = update.description
      }
      if (update.publisher) {
        book.publisher = update.publisher
      }
      if (update.author) {
        book.author = update.author
      }
      if (update.status) {
        book.status = update.status
      }
      if (update.genres) {
        book.genres = update.genres
      }
      if (update.borrowerId) {
        book.borrowerId = update.borrowerId
      }
      if (update.publishedDate) {
        book.publishedDate = update.publishedDate
      }
      if (update.borrowedDate) {
        book.borrowedDate = update.borrowedDate
      }
      if (update.returnedDate) {
        book.returnedDate = update.returnedDate
      }
      return book.save()
    })
  } else {
    throw new BadRequestError('Invalid ISBN')
  }
}

function deleteBook(ISBN: string): Promise<BookDocument | null> {
  if (ISBN.match(ISBNRegex)) {
    return Book.findOneAndDelete({ ISBN })
      .exec()
      .then((book) => {
        if (!book) {
          throw new Error(`Book with ISBN ${ISBN} not found`)
        }
        return book
      })
  } else {
    throw new BadRequestError('Invalid ISBN')
  }
}

function borrowBook(
  ISBN: string,
  borrowInfo: BorrowBookPayload
): Promise<BookDocument> {
  if (ISBN.match(ISBNRegex)) {
    return findByISBN(ISBN).then((book) => {
      if (!book) {
        throw new Error(`Book with ISBN ${ISBN} not found`)
      }
      if (book.status === 'borrowed') {
        throw new BadRequestError(`Book with ISBN ${ISBN} has been borrowed`)
      } else {
        book.status = 'borrowed'
        book.borrowerId = borrowInfo.authData.userId
        book.borrowedDate = new Date()
        if (new Date(book.borrowedDate) > new Date(borrowInfo.returnedDate)) {
          throw new BadRequestError('Return date must be after today')
        }
        book.returnedDate = borrowInfo.returnedDate
        return book.save()
      }
    })
  } else {
    throw new BadRequestError('Invalid ISBN')
  }
}

function returnBook(
  ISBN: string,
  returnInfo: ReturnBookPayload
): Promise<BookDocument> {
  if (ISBN.match(ISBNRegex)) {
    return findByISBN(ISBN).then((book) => {
      if (!book) {
        throw new Error(`Book with ISBN ${ISBN} not found`)
      }
      if (book.borrowerId !== returnInfo.authData.userId) {
        throw new Error(
          `User with ID ${returnInfo.authData.userId} is not the borrower of this book`
        )
      } else {
        book.status = 'available'
        book.borrowerId = undefined
        book.borrowedDate = undefined
        //TO DO: handle penalty for late returned Date
        book.returnedDate = undefined
        return book.save()
      }
    })
  } else {
    throw new BadRequestError('Invalid ISBN')
  }
}

export default {
  create,
  findAll,
  findByISBN,
  filtering,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
}
