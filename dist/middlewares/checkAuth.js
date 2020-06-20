"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../util/secrets");
const apiError_1 = require("../helpers/apiError");
function checkAuth(req, res, next) {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
    if (token === undefined) {
        throw new apiError_1.UnauthorizedError('You need to sign in (require a token)');
    }
    try {
        const decode = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        req.body.authData = decode;
        next();
    }
    catch (err) {
        throw new apiError_1.UnauthorizedError('Token is invalid/expired');
    }
}
exports.default = checkAuth;
//# sourceMappingURL=checkAuth.js.map