"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Author_1 = __importDefault(require("../models/Author"));
const apiError_1 = require("../helpers/apiError");
function add(author) {
    return author.save();
}
function updateAuthor(authorId, update) {
    return Author_1.default.findById(authorId).then((author) => {
        if (!author) {
            throw new Error('Author not found');
        }
        if (update.name) {
            author.name = update.name;
        }
        if (update.dateOfBirth) {
            author.dateOfBirth = update.dateOfBirth;
        }
        if (update.nationality) {
            author.nationality = update.nationality;
        }
        if (update.books) {
            author.books = update.books;
        }
        return author.save();
    });
}
function deleteAuthor(authorId) {
    return Author_1.default.findByIdAndDelete(authorId)
        .exec()
        .then((author) => {
        if (!author) {
            throw new Error('Author not found');
        }
        return author;
    })
        .catch((err) => {
        throw new apiError_1.InternalServerError();
    });
}
exports.default = { add, updateAuthor, deleteAuthor };
//# sourceMappingURL=author.js.map