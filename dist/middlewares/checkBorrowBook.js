"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const apiError_1 = require("../helpers/apiError");
function checkBorrowBook(req, res, next) {
    User_1.default.findById(req.body.authData.userId)
        .exec()
        .then((user) => {
        if (!user) {
            throw new apiError_1.BadRequestError('No user found');
        }
        const isBorrowed = user.borrowingBooks.some((item) => item.ISBN === req.params.ISBN);
        if (isBorrowed) {
            next(new apiError_1.BadRequestError('You are currently borrowing this book'));
        }
    });
}
exports.default = checkBorrowBook;
//# sourceMappingURL=checkBorrowBook.js.map