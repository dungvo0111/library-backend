"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../util/secrets");
const apiError_1 = require("../helpers/apiError");
function checkResetToken(req, res, next) {
    const token = req.params.resetToken;
    try {
        const decode = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        req.body.resetToken = decode;
        next();
    }
    catch (err) {
        throw new apiError_1.UnauthorizedError('Token is invalid/expired');
    }
}
exports.default = checkResetToken;
//# sourceMappingURL=checkResetToken.js.map