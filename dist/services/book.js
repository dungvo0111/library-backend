"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Book_1 = __importDefault(require("../models/Book"));
const apiError_1 = require("../helpers/apiError");
const ISBNRegex = /^(97(8|9))?\d{9}(\d|X)$/;
function findAll() {
    return Book_1.default.find().sort({ title: 1, publishedDate: -1 }).exec();
}
function create(book) {
    return book.save();
}
function filtering(filter) {
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
    return Book_1.default.find(myFilter)
        .sort({ title: 1, publishedDate: -1 })
        .then((book) => {
        if (book.length === 0) {
            throw new Error('Books not found');
        }
        return book;
    });
}
function findByISBN(ISBN) {
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
}
function updateBook(ISBN, update) {
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
}
function deleteBook(ISBN) {
    if (ISBN.match(ISBNRegex)) {
        return Book_1.default.findOneAndDelete({ ISBN })
            .exec()
            .then((book) => {
            if (!book) {
                throw new Error(`Book with ISBN ${ISBN} not found`);
            }
            return book;
        })
            .catch((err) => {
            throw new apiError_1.InternalServerError();
        });
    }
    else {
        throw new apiError_1.BadRequestError('Invalid ISBN');
    }
}
function borrowBook(ISBN, borrowInfo) {
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
}
function returnBook(ISBN, returnInfo) {
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