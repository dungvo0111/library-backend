import express from 'express'

import {
  findByISBN,
  findAll,
  filtering,
  updateBook,
  createBook,
  deleteBook,
  borrowBook,
  returnBook,
} from '../controllers/book'

import checkAuth from '../middlewares/checkAuth'
import checkPermission from '../middlewares/checkPermission'

const router = express.Router()

router.get('/', findAll)
router.get('/Filtering', filtering)
router.get('/:ISBN', findByISBN)
router.put('/:ISBN', checkAuth, checkPermission, updateBook)
router.delete('/:ISBN', checkAuth, checkPermission, deleteBook)
router.post('/', checkAuth, checkPermission, createBook)
router.patch('/:ISBN/borrowBook', checkAuth, borrowBook)
router.patch('/:ISBN/returnBook', checkAuth, returnBook)

export default router
