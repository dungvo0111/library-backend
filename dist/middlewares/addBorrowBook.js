"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const apiError_1 = require("../helpers/apiError");
function addBorrowBook(req, res, next) {
    User_1.default.findById(req.body.authData.userId).exec().then((user) => {
        if (!user) {
            throw new apiError_1.BadRequestError('No user found');
        }
        const a = user.borrowingBooks.some(item => item.ISBN === req.params.ISBN);
        if (a) {
            req.body.isBorrowed = true;
        }
        next();
    });
}
exports.default = addBorrowBook;
//# sourceMappingURL=addBorrowBook.js.map