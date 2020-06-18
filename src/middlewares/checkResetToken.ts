import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../util/secrets'
import { UnauthorizedError } from '../helpers/apiError'

export default function checkResetToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.params.resetToken
  try {
    const decode = jwt.verify(token, JWT_SECRET)
    req.body.resetToken = decode
    next()
  } catch (err) {
    throw new UnauthorizedError('Token is invalid/expired')
  }
}
