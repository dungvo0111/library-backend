import User, { UserDocument } from '../models/User'
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '../helpers/apiError'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MailService } from '@sendgrid/mail'
import { JWT_SECRET, SENDGRID_API_KEY } from '../util/secrets'

type signInPayload = {
  email: string;
  password: string;
}
type googleSignInPayload = {
  email: string;
  firstName: string;
  lastName: string;
}
type authData = {
  email: string;
  userId: string;
}
type updateProfilePayload = {
  email: string;
  firstName: string;
  lastName: string;
  authData: authData;
}

type changePasswordPayload = {
  oldPassword: string;
  newPassword: string;
  authData: authData;
}

type resetPasswordRequestPayload = {
  email: string;
  url: string;
}

type resetPasswordPayload = {
  newPassword: string;
  resetToken: authData;
}

const isEmail = (email: string) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (email.match(regEx)) return true
  else return false
}

const isPassword = (password: string) => {
  const regEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  if (password.match(regEx)) return true
  else return false
}

function signUp(payload: UserDocument): Promise<UserDocument> {
  if (!isEmail(payload.email)) {
    throw new Error('Must be a valid email address')
  }
  if (!isPassword(payload.password)) {
    throw new Error(
      'Password must be from eight characters, at least one letter and one number'
    )
  }
  return User.find({ email: payload.email })
    .exec()
    .then((user) => {
      if (user.length > 0) {
        throw new Error('Email has already registered')
      } else {
        return bcrypt
          .hash(payload.password, 10)
          .then((hash) => {
            const user = new User({
              firstName: payload.firstName,
              lastName: payload.lastName,
              email: payload.email,
              password: hash,
            })
            return user.save()
          })
          .catch((err) => {
            throw new InternalServerError()
          })
      }
    })
}

function signIn(payload: signInPayload): Promise<string> {
  if (!isEmail(payload.email)) {
    throw new Error('Must be a valid email address')
  }
  if (!isPassword(payload.password)) {
    throw new Error(
      'Password must be from eight characters, at least one letter and one number'
    )
  }
  return User.findOne({ email: payload.email })
    .exec()
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Email has not been registered')
      }
      return bcrypt.compare(payload.password, user.password).then((res) => {
        if (res) {
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
              isAdmin: user.isAdmin,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            JWT_SECRET,
            {
              expiresIn: '1h',
            }
          )
          return token
        } else {
          throw new UnauthorizedError('Password does not match')
        }
      })
    })
}

function googleSignIn(payload: googleSignInPayload): Promise<string> {
  return User.findOne({ email: payload.email })
    .exec()
    .then((user) => {
      if (!user) {
        //Create new user in the database

        const newUser = new User({
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          password: bcrypt.hashSync('abcd1234', 10), //Create a default password
        })
        newUser.save()
        const token = jwt.sign(
          {
            email: newUser.email,
            userId: newUser._id,
            isAdmin: newUser.isAdmin,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            password: newUser.password, //put into token for frontend warning about changing password
          },
          JWT_SECRET,
          {
            expiresIn: '1h',
          }
        )
        return token
      } else {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            isAdmin: user.isAdmin,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          JWT_SECRET,
          {
            expiresIn: '1h',
          }
        )
        return token
      }
    })
}

function updateProfile(payload: updateProfilePayload): Promise<string> {
  return User.findOne({ email: payload.authData.email })
    .exec()
    .then((user) => {
      if (!user) {
        throw new Error('Email does not match')
      }
      if (payload.firstName) {
        user.firstName = payload.firstName
      }
      if (payload.lastName) {
        user.lastName = payload.lastName
      }
      if (payload.email) {
        if (!isEmail(payload.email)) {
          throw new Error('Must be a valid email address')
        }
        user.email = payload.email
      }
      user.save()
      //create new token since the old one has outdated data
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id,
          isAdmin: user.isAdmin,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        JWT_SECRET,
        {
          expiresIn: '1h',
        }
      )
      return token
    })
}

function changePassword(payload: changePasswordPayload): Promise<string> {
  return User.findOne({ email: payload.authData.email })
    .exec()
    .then((user) => {
      if (!user) {
        throw new Error('Email does not match')
      }
      return bcrypt.compare(payload.oldPassword, user.password).then((res) => {
        if (res) {
          if (!isPassword(payload.newPassword)) {
            throw new Error(
              'Password must be from eight characters, at least one letter and one number'
            )
          }
          return bcrypt.hash(payload.newPassword, 10).then((hash) => {

            user.password = hash
            user.save()
            const token = jwt.sign(
              {
                email: user.email,
                userId: user._id,
                isAdmin: user.isAdmin,
                firstName: user.firstName,
                lastName: user.lastName,
              },
              JWT_SECRET,
              {
                expiresIn: '1h',
              }
            )
            return token
          })
        } else {
          throw new Error('Old password does not match')
        }
      })
    })
}

function resetPasswordRequest(
  payload: resetPasswordRequestPayload
): Promise<string> {
  if (!isEmail(payload.email)) {
    throw new Error('Must be a valid email address')
  }
  return User.findOne({ email: payload.email })
    .exec()
    .then((user) => {
      if (!user) {
        throw new Error('Email has not been registered')
      }
      const resetToken = jwt.sign(
        {
          email: user.email,
          userId: user._id,
        },
        JWT_SECRET,
        {
          expiresIn: '1h',
        }
      )
      const sgMail = new MailService()
      sgMail.setApiKey(SENDGRID_API_KEY)
      const link = `${payload.url}/${resetToken}`
      const msg = {
        to: payload.email,
        from: 'dung.vo@integrify.io',
        subject: 'Link to reset password',
        html: `Link to reset your password: <strong><a href=${link}>link</a></strong>`,
      }
      return sgMail
        .send(msg)
        .then((res) => {
          return resetToken
        })
        .catch((error) => {
          throw new InternalServerError()
        })
    })
}

function resetPassword(payload: resetPasswordPayload): Promise<UserDocument> {
  if (!isPassword(payload.newPassword)) {
    throw new BadRequestError(
      'Password must be from eight characters, at least one letter and one number'
    )
  }
  return User.findOne({ email: payload.resetToken.email })
    .exec()
    .then((user) => {
      if (!user) {
        throw new InternalServerError()
      }
      return bcrypt.hash(payload.newPassword, 10).then((hash) => {
        console.log(hash)
        user.password = hash
        return user.save()
      })
    })
}

export default {
  signUp,
  signIn,
  googleSignIn,
  updateProfile,
  changePassword,
  resetPasswordRequest,
  resetPassword,
}
