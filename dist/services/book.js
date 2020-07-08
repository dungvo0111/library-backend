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
const apiError_1 = require("../helpers/apiError");
const ISBNRegex = /^(97(8|9))?\d{9}(\d|X)$/;
function findAll({ page, limit, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = { results: [] };
        if (endIndex < (yield Book_1.default.countDocuments().exec())) {
            results.next = {
                page: page + 1,
                limit: limit,
            };
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit,
            };
        }
        results.results = yield Book_1.default.find()
            .limit(limit)
            .skip(startIndex)
            .sort({ title: 1, publishedDate: -1 })
            .exec();
        return results;
    });
}
function create(book) {
    return book.save();
}
function filtering(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = parseInt(filter.page);
        const limit = parseInt(filter.limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = { results: [] };
        if (endIndex < (yield Book_1.default.countDocuments().exec())) {
            results.next = {
                page: page + 1,
                limit: limit,
            };
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit,
            };
        }
        const myFilter = {};
        if (filter.title) {
            myFilter.title = filter.title;
        }
        if (filter.status) {
            myFilter.status = filter.status;
        }
        if (filter.author) {
            myFilter.author = { $in: filter.author };
        }
        if (filter.genres) {
            myFilter.genres = { $in: filter.genres };
        }
        results.results = yield Book_1.default.find(myFilter)
            .limit(limit)
            .skip(startIndex)
            .sort({ title: 1, publishedDate: -1 })
            .exec();
        return results;
    });
}
function findByISBN(ISBN) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ISBN.match(ISBNRegex)) {
            return Book_1.default.findOne({ ISBN })
                .exec()
                .then((book) => {
                if (!book) {
                    throw new Error(`Book with ISBN ${ISBN} not found`);
                }
                return book;
            });
        }
        else {
            throw new apiError_1.BadRequestError('Invalid ISBN');
        }
    });
}
function updateBook(ISBN, update) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ISBN.match(ISBNRegex)) {
            return findByISBN(ISBN).then((book) => {
                if (!book) {
                    throw new Error(`Book with ISBN ${ISBN} not found`);
                }
                if (update.title) {
                    book.title = update.title;
                }
                if (update.description) {
                    book.description = update.description;
                }
                if (update.publisher) {
                    book.publisher = update.publisher;
                }
                if (update.author) {
                    book.author = update.author;
                }
                if (update.status) {
                    book.status = update.status;
                }
                if (update.genres) {
                    book.genres = update.genres;
                }
                if (update.borrowerId) {
                    book.borrowerId = update.borrowerId;
                }
                if (update.publishedDate) {
                    book.publishedDate = update.publishedDate;
                }
                if (update.borrowedDate) {
                    book.borrowedDate = update.borrowedDate;
                }
                if (update.returnedDate) {
                    book.returnedDate = update.returnedDate;
                }
                return book.save();
            });
        }
        else {
            throw new apiError_1.BadRequestError('Invalid ISBN');
        }
    });
}
function deleteBook(ISBN) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ISBN.match(ISBNRegex)) {
            return Book_1.default.findOneAndDelete({ ISBN })
                .exec()
                .then((book) => {
                if (!book) {
                    throw new Error(`Book with ISBN ${ISBN} not found`);
                }
                return book;
            });
        }
        else {
            throw new apiError_1.BadRequestError('Invalid ISBN');
        }
    });
}
function borrowBook(ISBN, borrowInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ISBN.match(ISBNRegex)) {
            return findByISBN(ISBN).then((book) => {
                if (!book) {
                    throw new Error(`Book with ISBN ${ISBN} not found`);
                }
                if (book.status === 'borrowed') {
                    throw new apiError_1.BadRequestError(`Book with ISBN ${ISBN} has been borrowed`);
                }
                else {
                    book.status = 'borrowed';
                    book.borrowerId = borrowInfo.authData.userId;
                    book.borrowedDate = new Date();
                    if (new Date(book.borrowedDate) > new Date(borrowInfo.returnedDate)) {
                        throw new apiError_1.BadRequestError('Return date must be after today');
                    }
                    book.returnedDate = borrowInfo.returnedDate;
                    return book.save();
                }
            });
        }
        else {
            throw new apiError_1.BadRequestError('Invalid ISBN');
        }
    });
}
function returnBook(ISBN, returnInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ISBN.match(ISBNRegex)) {
            return findByISBN(ISBN).then((book) => {
                if (!book) {
                    throw new Error(`Book with ISBN ${ISBN} not found`);
                }
                if (book.borrowerId !== returnInfo.authData.userId) {
                    throw new Error(`User with ID ${returnInfo.authData.userId} is not the borrower of this book`);
                }
                else {
                    book.status = 'available';
                    book.borrowerId = undefined;
                    book.borrowedDate = undefined;
                    //TO DO: handle penalty for late returned Date
                    book.returnedDate = undefined;
                    return book.save();
                }
            });
        }
        else {
            throw new apiError_1.BadRequestError('Invalid ISBN');
        }
    });
}
exports.default = {
    create,
    findAll,
    findByISBN,
    filtering,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
};
//# sourceMappingURL=book.js.map