import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../util/secrets'
import { UnauthorizedError } from '../helpers/apiError'

export default function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header('Authorization')?.split('Bearer ')[1]
  if (token === undefined) {
    throw new UnauthorizedError('You need to sign in (require a token)')
  }
  try {
    const decode = jwt.verify(token, JWT_SECRET)
    req.body.authData = decode
    next()
  } catch (err) {
    throw new UnauthorizedError('Token is invalid/expired')
  }
}
