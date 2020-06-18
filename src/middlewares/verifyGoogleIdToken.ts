import { OAuth2Client } from 'google-auth-library'
import { Request, Response, NextFunction } from 'express'

const CLIENT_ID = process.env['CLIENT_ID'] as string
const client = new OAuth2Client(CLIENT_ID)

export default async function verifyGoogleIdToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header('Authorization')?.split('Bearer ')[1] as string
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const googlePayload = {
      email: payload?.email,
      firstName: payload?.given_name,
      lastName: payload?.family_name,
    }
    req.body.payload = googlePayload
    next()
  } catch (err) {
    console.log(err)
  }
}
