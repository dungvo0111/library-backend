"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Book_1 = __importDefault(require("../models/Book"));
const book_1 = __importDefault(require("../services/book"));
const apiError_1 = require("../helpers/apiError");
//GET /books with pagination
exports.findAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        res.json(yield book_1.default.findAll({ page, limit }));
    }
    catch (error) {
        throw new apiError_1.InternalServerError();
    }
});
//POST /books
exports.createBook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ISBN, title, description, publisher, author, genres, status, publishedDate, } = req.body;
        const book = new Book_1.default({
            ISBN,
            title,
            description,
            publisher,
            author,
            genres,
            status,
            publishedDate,
        });
        yield book_1.default.create(book);
        res.json(book);
    }
    catch (error) {
        if (error.name === 'ValidationError' || error.name === 'MongoError') {
            next(new apiError_1.BadRequestError('Invalid Request', error));
        }
        else {
            next(new apiError_1.InternalServerError('Internal Server Error', error));
        }
    }
});
//GET /books/Filtering
exports.filtering = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield book_1.default.filtering(req.query);
        res.json(result);
    }
    catch (error) {
        throw new apiError_1.InternalServerError();
    }
});
// GET /books/:ISBN
exports.findByISBN = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(yield book_1.default.findByISBN(req.params.ISBN));
    }
    catch (error) {
        if (error.statusCode === 400) {
            next(new apiError_1.BadRequestError(error.message, error));
        }
        else {
            next(new apiError_1.NotFoundError(error.message, error));
        }
    }
});
// PUT /books/:ISBN
exports.updateBook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = req.body;
        const ISBN = req.params.ISBN;
        const updatedBook = yield book_1.default.updateBook(ISBN, update);
        res.json(updatedBook);
    }
    catch (error) {
        if (error.statusCode === 400) {
            next(new apiError_1.BadRequestError(error.message, error));
        }
        else {
            next(new apiError_1.NotFoundError(error.message, error));
        }
    }
});
// DELETE /books/:ISBN
exports.deleteBook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield book_1.default.deleteBook(req.params.ISBN);
        res.json({ message: 'Book deleted successfully' });
    }
    catch (error) {
        if (error.statusCode === 400) {
            next(new apiError_1.BadRequestError(error.message, error));
        }
        else {
            next(new apiError_1.NotFoundError(error.message, error));
        }
    }
});
//PUT /:ISBN/borrowBook
exports.borrowBook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const borrowedBook = yield book_1.default.borrowBook(req.params.ISBN, req.body);
        res.json(borrowedBook);
    }
    catch (error) {
        if (error.statusCode === 400) {
            next(new apiError_1.BadRequestError(error.message, error));
        }
        else {
            next(new apiError_1.NotFoundError(error.message, error));
        }
    }
});
//PUT /:ISBN/returnBook
exports.returnBook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const returnedBook = yield book_1.default.returnBook(req.params.ISBN, req.body);
        res.json(returnedBook);
    }
    catch (error) {
        if (error.statusCode === 400) {
            next(new apiError_1.BadRequestError(error.message, error));
        }
        else {
            next(new apiError_1.NotFoundError(error.message, error));
        }
    }
});
//# sourceMappingURL=book.js.map