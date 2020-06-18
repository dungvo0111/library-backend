import express from 'express'

import { addAuthor, updateAuthor, deleteAuthor } from '../controllers/author'

import checkAuth from '../middlewares/checkAuth'
import checkPermission from '../middlewares/checkPermission'

const router = express.Router()

router.post('/', checkAuth, checkPermission, addAuthor)
router.put('/:authorId', checkAuth, checkPermission, updateAuthor)
router.delete('/:authorId', checkAuth, checkPermission, deleteAuthor)

export default router
