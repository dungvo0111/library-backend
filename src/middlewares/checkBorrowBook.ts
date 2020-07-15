import { Request, Response, NextFunction } from 'express'
import User from '../models/User'
import { BadRequestError, InternalServerError } from '../helpers/apiError'

export default function checkBorrowBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  User.findById(req.body.authData.userId)
    .exec()
    .then((user) => {
      if (!user) {
        throw new BadRequestError('No user found')
      }
      const isBorrowed = user.borrowingBooks.some(
        (item) => item.ISBN === req.params.ISBN
      )
      if (isBorrowed) {
        next(new BadRequestError('You are currently borrowing this book'))
      }
      next()
    })
}
