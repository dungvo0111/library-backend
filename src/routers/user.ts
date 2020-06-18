import express from 'express'

import {
  signUp,
  signIn,
  googleSignIn,
  updateProfile,
  changePassword,
  resetPasswordRequest,
  resetPassword,
} from '../controllers/user'

import checkAuth from '../middlewares/checkAuth'
import checkResetToken from '../middlewares/checkResetToken'
import verifyGoogleIdToken from '../middlewares/verifyGoogleIdToken'

const router = express.Router()

router.post('/', signUp)
router.post('/signIn', signIn)
router.post('/googleSignIn', verifyGoogleIdToken, googleSignIn)
router.put('/updateProfile', checkAuth, updateProfile)
router.put('/updatePassword', checkAuth, changePassword)
router.post('/resetPassword', resetPasswordRequest)
router.put('/resetPassword/:resetToken', checkResetToken, resetPassword)

export default router
