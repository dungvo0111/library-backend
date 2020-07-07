import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import UserService from '../services/user'
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '../helpers/apiError'

import { JWT_SECRET } from '../util/secrets'

//POST /user
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserService.signUp(req.body)
    res.json({
      message: 'Sign up successful!',
      user,
    })
  } catch (error) {
    if (error.statusCode === 500) {
      next(new InternalServerError('Internal Server Error', error))
    } else {
      next(new BadRequestError(error.message, error))
    }
  }
}

//POST /user/signIn
export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await UserService.signIn(req.body)
    res.json({
      message: 'Sign in successful!',
      token: token,
    })
  } catch (error) {
    if (error.statusCode === 401) {
      next(new UnauthorizedError(error.message, error))
    } else {
      next(new BadRequestError(error.message, error))
    }
  }
}

//POST /user/googleSignIn
export const googleSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await UserService.googleSignIn(req.body.payload)
    res.json({
      message: 'Sign in successful!',
      token: token,
    })
  } catch (error) {
    next(new InternalServerError())
  }
}

// PUT /user/updateProfile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body
    const token = await UserService.updateProfile(payload)
    res.json({
      message: 'Profile updated successfully!',
      token: token,
    })
  } catch (error) {
    next(new BadRequestError(error.message, error))
  }
}

// PUT /user/updatePassword
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body
    const token = await UserService.changePassword(payload)
    res.json({
      message: 'Password updated successfully!',
      token: token,
    })
  } catch (error) {
    next(new BadRequestError(error.message, error))
  }
}

// POST /user/resetPassword
export const resetPasswordRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body
    const resetToken = await UserService.resetPasswordRequest(payload)
    res.json({
      message: 'Email sent successful, check your email!',
      resetToken,
    })
  } catch (error) {
    if (error.statusCode === 500) {
      next(new InternalServerError(error))
    } else {
      next(new BadRequestError(error.message, error))
    }
  }
}

// PUT /user/resetPassword/:resetToken
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body
    const user = await UserService.resetPassword(payload)
    res.json({
      message: 'Password reset successfully!',
      user,
    })
  } catch (error) {
    if (error.statusCode === 500) {
      next(new InternalServerError(error))
    } else {
      next(new BadRequestError(error.message, error))
    }
  }
}
