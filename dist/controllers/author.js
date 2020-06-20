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
const Author_1 = __importDefault(require("../models/Author"));
const author_1 = __importDefault(require("../services/author"));
const apiError_1 = require("../helpers/apiError");
//POST /author
exports.addAuthor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, dateOfBirth, nationality, books } = req.body;
        const author = new Author_1.default({
            name,
            dateOfBirth,
            nationality,
            books,
        });
        yield author_1.default.add(author);
        res.json(author);
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            next(new apiError_1.BadRequestError('Invalid Request', error));
        }
        else {
            next(new apiError_1.InternalServerError('Internal Server Error', error));
        }
    }
});
// PUT /author/:authorId
exports.updateAuthor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = req.body;
        const AuthorId = req.params.authorId;
        console.log(AuthorId);
        const updatedAuthor = yield author_1.default.updateAuthor(AuthorId, update);
        res.json(updatedAuthor);
    }
    catch (error) {
        next(new apiError_1.NotFoundError('Author not found', error));
    }
});
// DELETE /author/:authorId
exports.deleteAuthor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield author_1.default.deleteAuthor(req.params.authorId);
        res.json({ message: 'Author deleted successfully' });
    }
    catch (error) {
        if (error.statusCode === 500) {
            next(new apiError_1.InternalServerError(error.message, error));
        }
        else {
            next(new apiError_1.NotFoundError(error.message, error));
        }
    }
});
//# sourceMappingURL=author.js.map