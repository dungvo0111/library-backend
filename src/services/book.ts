import Book, { BookDocument } from '../models/Book'
import { BadRequestError, InternalServerError } from '../helpers/apiError'

type FilterPayload = {
  title?: string;
  status?: string;
  author?: {};
  genres?: {};
  page: string;
  limit: string;
}

type Filter = {
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

type PaginationPayload = {
  page: number;
  limit: number;
}

type PaginationResults = {
  results: BookDocument[];
  next?: {
    page: number;
    limit: number;
  };
  previous?: {
    page: number;
    limit: number;
  };
  pages: number;
}

const ISBNRegex = /^(97(8|9))?\d{9}(\d|X)$/

async function findAll({
  page,
  limit,
}: PaginationPayload): Promise<PaginationResults> {
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results: PaginationResults = { results: [], pages: 0 }
  const resultCount = await Book.countDocuments().exec()
  results.pages =
    resultCount % limit === 0
      ? resultCount / limit
      : Math.floor(resultCount / limit + 1)
  if (endIndex < resultCount) {
    results.next = {
      page: page + 1,
      limit: limit,
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    }
  }
  results.results = await Book.find()
    .limit(limit)
    .skip(startIndex)
    .sort({ title: 1, publishedDate: -1 })
    .exec()
  return results
}

async function create(payload: BookDocument): Promise<BookDocument> {
  const {
    ISBN,
    title,
    description,
    publisher,
    author,
    genres,
    status,
    publishedDate,
  } = payload
  const checkISBN = await Book.findOne({ ISBN: ISBN })
    .exec()
    .then((book) => {
      if (book) {
        return true
      } else {
        return false
      }
    })
  if (checkISBN) {
    throw new BadRequestError('Book with the same ISBN has already added')
  }
  const checkTitle = await Book.findOne({ title: title })
    .exec()
    .then((book) => {
      if (book) {
        return true
      } else {
        return false
      }
    })
  if (checkTitle) {
    throw new BadRequestError('Book with the same title has already added')
  }
  const book = new Book({
    ISBN,
    title,
    description,
    publisher,
    author,
    genres,
    status,
    publishedDate,
  })
  return book.save()
}

async function filtering(filter: FilterPayload): Promise<PaginationResults> {
  const page = parseInt(filter.page)
  const limit = parseInt(filter.limit)

  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results: PaginationResults = { results: [], pages: 0 }
  const myFilter: Filter = {}

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
  const resultCount = await Book.find(myFilter).countDocuments().exec()
  results.pages =
    resultCount % limit === 0
      ? resultCount / limit
      : Math.floor(resultCount / limit + 1)

  if (endIndex < resultCount) {
    results.next = {
      page: page + 1,
      limit: limit,
    }
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    }
  }

  results.results = await Book.find(myFilter)
    .limit(limit)
    .skip(startIndex)
    .sort({ title: 1, publishedDate: -1 })
    .exec()

  return results
}

async function findByISBN(ISBN: string): Promise<BookDocument> {
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

async function updateBook(
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

async function deleteBook(ISBN: string): Promise<BookDocument | null> {
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

async function borrowBook(
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

async function returnBook(
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
