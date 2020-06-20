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
const user_1 = __importDefault(require("../services/user"));
const apiError_1 = require("../helpers/apiError");
//POST /user
exports.signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.signUp(req.body);
        res.json({
            message: 'Sign up successful',
            user,
        });
    }
    catch (error) {
        if (error.statusCode === 500) {
            next(new apiError_1.InternalServerError('Internal Server Error', error));
        }
        else {
            next(new apiError_1.BadRequestError(error.message, error));
        }
    }
});
//POST /user/signIn
exports.signIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield user_1.default.signIn(req.body);
        res.json({
            message: 'Sign in successful',
            token: token,
        });
    }
    catch (error) {
        if (error.statusCode === 401) {
            next(new apiError_1.UnauthorizedError(error.message, error));
        }
        else {
            next(new apiError_1.BadRequestError(error.message, error));
        }
    }
});
//POST /user/googleSignIn
exports.googleSignIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield user_1.default.googleSignIn(req.body.payload);
        res.json({
            message: 'Sign in successful',
            token: token,
        });
    }
    catch (error) {
        if (error.statusCode === 401) {
            next(new apiError_1.UnauthorizedError(error.message, error));
        }
        else {
            next(new apiError_1.BadRequestError(error.message, error));
        }
    }
});
// PUT /user/updateProfile
exports.updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const token = yield user_1.default.updateProfile(payload);
        res.json({
            message: 'Profile updated successfully',
            token: token,
        });
    }
    catch (error) {
        next(new apiError_1.BadRequestError(error.message, error));
    }
});
// PUT /user/updatePassword
exports.changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const token = yield user_1.default.changePassword(payload);
        res.json({
            message: 'Password updated successfully',
            token: token
        });
    }
    catch (error) {
        next(new apiError_1.BadRequestError(error.message, error));
    }
});
// PUT /user/resetPassword
exports.resetPasswordRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const resetToken = yield user_1.default.resetPasswordRequest(payload);
        res.json({
            message: 'Email sent successful',
        });
    }
    catch (error) {
        if (error.statusCode === 500) {
            next(new apiError_1.InternalServerError(error));
        }
        else {
            next(new apiError_1.BadRequestError(error.message, error));
        }
    }
});
// PUT /user/resetPassword/:resetToken
exports.resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const user = yield user_1.default.resetPassword(payload);
        res.json({
            message: 'Reset password successful',
            user,
        });
    }
    catch (error) {
        if (error.statusCode === 500) {
            next(new apiError_1.InternalServerError(error));
        }
        else {
            next(new apiError_1.BadRequestError(error.message, error));
        }
    }
});
//# sourceMappingURL=user.js.map