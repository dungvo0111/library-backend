import { Request, Response, NextFunction } from 'express'

import { ForbiddenError } from '../helpers/apiError'

export default function checkResetToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isAdmin = req.body.authData.isAdmin
  if (isAdmin) {
    next()
  } else {
    throw new ForbiddenError('Require to have admin right')
  }
}
