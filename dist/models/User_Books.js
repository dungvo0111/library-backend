"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_BooksSchema = new mongoose_1.default.Schema({
    ISBN: {
        type: String,
        validate: /^(97(8|9))?\d{9}(\d|X)$/,
        index: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    publisher: {
        type: String,
        required: true,
    },
    author: {
        type: [String],
        required: true,
    },
    genres: {
        type: [String],
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'borrowed'],
        default: 'available',
    },
    borrowerId: {
        type: String,
    },
    publishedDate: {
        type: Date,
        required: true,
        min: 1900,
    },
    borrowedDate: {
        type: Date,
    },
    returnedDate: {
        type: Date,
    },
});
exports.default = mongoose_1.default.model('User_Books', user_BooksSchema);
//# sourceMappingURL=User_Books.js.map