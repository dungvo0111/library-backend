"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const book_1 = require("../controllers/book");
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const checkPermission_1 = __importDefault(require("../middlewares/checkPermission"));
const router = express_1.default.Router();
router.get('/', book_1.findAll);
router.get('/Filtering', book_1.filtering);
router.get('/:ISBN', book_1.findByISBN);
router.put('/:ISBN', checkAuth_1.default, checkPermission_1.default, book_1.updateBook);
router.delete('/:ISBN', checkAuth_1.default, checkPermission_1.default, book_1.deleteBook);
router.post('/', checkAuth_1.default, checkPermission_1.default, book_1.createBook);
router.put('/:ISBN/borrowBook', checkAuth_1.default, book_1.borrowBook);
router.put('/:ISBN/returnBook', checkAuth_1.default, book_1.returnBook);
exports.default = router;
//# sourceMappingURL=book.js.map