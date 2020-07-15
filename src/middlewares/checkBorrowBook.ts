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
      const a = user.borrowingBooks.some(
        (item) => item.ISBN === req.params.ISBN
      )
      if (a) {
        req.body.isBorrowed = true
      }
      next()
    })
}
