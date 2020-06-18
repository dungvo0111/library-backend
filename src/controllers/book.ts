import { Request, Response, NextFunction } from 'express'

import Book from '../models/Book'
import BookService from '../services/book'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../helpers/apiError'

// GET /books
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await BookService.findAll())
  } catch (error) {
    next(new NotFoundError('Books not found', error))
  }
}

//POST /books
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      ISBN,
      title,
      description,
      publisher,
      author,
      genres,
      status,
      publishedDate,
    } = req.body

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
    await BookService.create(book)
    res.json(book)
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}

//GET /books/Filtering
export const filtering = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter = req.query
    const result = await BookService.filtering(filter)
    res.json(result)
  } catch (error) {
    next(new NotFoundError('Books not found', error))
  }
}

// GET /books/:ISBN
export const findByISBN = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await BookService.findByISBN(req.params.ISBN))
  } catch (error) {
    if (error.statusCode === 400) {
      next(new BadRequestError(error.message, error))
    } else {
      next(new NotFoundError(error.message, error))
    }
  }
}

// PUT /books/:ISBN
export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const ISBN = req.params.ISBN
    const updatedBook = await BookService.updateBook(ISBN, update)
    res.json(updatedBook)
  } catch (error) {
    if (error.statusCode === 400) {
      next(new BadRequestError(error.message, error))
    } else {
      next(new NotFoundError(error.message, error))
    }
  }
}

// DELETE /books/:ISBN
export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await BookService.deleteBook(req.params.ISBN)
    res.json({ message: 'Book deleted successfully' })
  } catch (error) {
    if (error.statusCode === 400) {
      next(new BadRequestError(error.message, error))
    } else if (error.statusCode === 500) {
      next(new InternalServerError(error.message, error))
    } else {
      next(new NotFoundError(error.message, error))
    }
  }
}

//PATCH /:ISBN/borrowBook
export const borrowBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const borrowedBook = await BookService.borrowBook(req.params.ISBN, req.body)
    res.json(borrowedBook)
  } catch (error) {
    if (error.statusCode === 400) {
      next(new BadRequestError(error.message, error))
    } else {
      next(new NotFoundError(error.message, error))
    }
  }
}

//PATCH /:ISBN/returnBook
export const returnBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const returnedBook = await BookService.returnBook(req.params.ISBN, req.body)
    res.json(returnedBook)
  } catch (error) {
    if (error.statusCode === 400) {
      next(new BadRequestError(error.message, error))
    } else {
      next(new NotFoundError(error.message, error))
    }
  }
}
