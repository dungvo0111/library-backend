import { Request, Response, NextFunction } from 'express'

import Book, { BookDocument } from '../models/Book'
import BookService from '../services/book'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../helpers/apiError'

//GET /books with pagination
export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    res.json(await BookService.findAll({ page, limit }))
  } catch (error) {
    throw new InternalServerError()
  }
}

//POST /books
export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await BookService.create(req.body)
    res.json({
      message: 'New book added successfully!',
      book,
    })
  } catch (error) {
    if (error.statusCode === 500) {
      next(new InternalServerError('Internal Server Error', error))
    } else {
      next(new BadRequestError(error.message, error))
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
    const result = await BookService.filtering(req.query)
    res.json(result)
  } catch (error) {
    throw new InternalServerError()
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
    } else {
      next(new NotFoundError(error.message, error))
    }
  }
}

//PUT /:ISBN/borrowBook
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

//PUT /:ISBN/returnBook
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
