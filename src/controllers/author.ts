import { Request, Response, NextFunction } from 'express'

import Author from '../models/Author'
import AuthorService from '../services/author'
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../helpers/apiError'

//POST /author
export const addAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, dateOfBirth, nationality, books } = req.body

    const author = new Author({
      name,
      dateOfBirth,
      nationality,
      books,
    })
    await AuthorService.add(author)
    res.json(author)
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(new InternalServerError('Internal Server Error', error))
    }
  }
}

// PUT /author/:authorId
export const updateAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body
    const AuthorId = req.params.authorId
    console.log(AuthorId)
    const updatedAuthor = await AuthorService.updateAuthor(AuthorId, update)
    res.json(updatedAuthor)
  } catch (error) {
    next(new NotFoundError('Author not found', error))
  }
}

// DELETE /author/:authorId
export const deleteAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await AuthorService.deleteAuthor(req.params.authorId)
    res.json({ message: 'Author deleted successfully' })
  } catch (error) {
    if (error.statusCode === 500) {
      next(new InternalServerError(error.message, error))
    } else {
      next(new NotFoundError(error.message, error))
    }
  }
}
