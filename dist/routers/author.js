"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const author_1 = require("../controllers/author");
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const checkPermission_1 = __importDefault(require("../middlewares/checkPermission"));
const router = express_1.default.Router();
router.post('/', checkAuth_1.default, checkPermission_1.default, author_1.addAuthor);
router.put('/:authorId', checkAuth_1.default, checkPermission_1.default, author_1.updateAuthor);
router.delete('/:authorId', checkAuth_1.default, checkPermission_1.default, author_1.deleteAuthor);
exports.default = router;
//# sourceMappingURL=author.js.map