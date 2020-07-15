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
import checkBorrowBook from '../middlewares/checkBorrowBook'

const router = express.Router()

router.get('/', findAll)
router.get('/Filtering', filtering)
router.get('/:ISBN', findByISBN)
router.put('/:ISBN', checkAuth, checkPermission, updateBook)
router.delete('/:ISBN', checkAuth, checkPermission, deleteBook)
router.post('/', checkAuth, checkPermission, createBook)
router.put('/:ISBN/borrowBook', checkAuth, checkBorrowBook, borrowBook)
router.put('/:ISBN/returnBook', checkAuth, returnBook)

export default router
