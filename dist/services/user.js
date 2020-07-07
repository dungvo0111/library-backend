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
const User_1 = __importDefault(require("../models/User"));
const apiError_1 = require("../helpers/apiError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mail_1 = require("@sendgrid/mail");
const secrets_1 = require("../util/secrets");
const emailContent_1 = require("../helpers/emailContent");
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx))
        return true;
    else
        return false;
};
const isPassword = (password) => {
    const regEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (password.match(regEx))
        return true;
    else
        return false;
};
function signUp(payload) {
    if (!isEmail(payload.email)) {
        throw new Error('Must be a valid email address');
    }
    if (!isPassword(payload.password)) {
        throw new Error('Password must be from eight characters, at least one letter and one number');
    }
    return User_1.default.find({ email: payload.email })
        .exec()
        .then((user) => {
        if (user.length > 0) {
            throw new Error('Email has already registered');
        }
        else {
            return bcryptjs_1.default
                .hash(payload.password, 10)
                .then((hash) => {
                const user = new User_1.default({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    password: hash,
                });
                return user.save();
            })
                .catch((err) => {
                throw new apiError_1.InternalServerError();
            });
        }
    });
}
function signIn(payload) {
    if (!isEmail(payload.email)) {
        throw new Error('Must be a valid email address');
    }
    if (!isPassword(payload.password)) {
        throw new Error('Password must be from eight characters, at least one letter and one number');
    }
    return User_1.default.findOne({ email: payload.email })
        .exec()
        .then((user) => {
        if (!user) {
            throw new apiError_1.UnauthorizedError('Email has not been registered');
        }
        return bcryptjs_1.default.compare(payload.password, user.password).then((res) => {
            if (res) {
                const token = jsonwebtoken_1.default.sign({
                    email: user.email,
                    userId: user._id,
                    isAdmin: user.isAdmin,
                    firstName: user.firstName,
                    lastName: user.lastName,
                }, secrets_1.JWT_SECRET, {
                    expiresIn: '1h',
                });
                return token;
            }
            else {
                throw new apiError_1.UnauthorizedError('Password does not match');
            }
        });
    });
}
function googleSignIn(payload) {
    return User_1.default.findOne({ email: payload.email })
        .exec()
        .then((user) => {
        if (!user) {
            //Create new user in the database
            const newUser = new User_1.default({
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                password: bcryptjs_1.default.hashSync('abcd1234', 10),
            });
            return newUser.save().then((newUser) => {
                const token = jsonwebtoken_1.default.sign({
                    email: newUser.email,
                    userId: newUser._id,
                    isAdmin: newUser.isAdmin,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    password: newUser.password,
                }, secrets_1.JWT_SECRET, {
                    expiresIn: '1h',
                });
                return token;
            });
        }
        else {
            const token = jsonwebtoken_1.default.sign({
                email: user.email,
                userId: user._id,
                isAdmin: user.isAdmin,
                firstName: user.firstName,
                lastName: user.lastName,
            }, secrets_1.JWT_SECRET, {
                expiresIn: '1h',
            });
            return token;
        }
    });
}
function updateProfile(payload) {
    return User_1.default.findOne({ email: payload.authData.email })
        .exec()
        .then((user) => __awaiter(this, void 0, void 0, function* () {
        if (!user) {
            throw new apiError_1.InternalServerError();
        }
        if (payload.firstName) {
            user.firstName = payload.firstName;
        }
        if (payload.lastName) {
            user.lastName = payload.lastName;
        }
        if (payload.email) {
            if (!isEmail(payload.email)) {
                throw new apiError_1.BadRequestError('Must be a valid email address');
            }
            if (payload.email !== user.email) {
                //check if the provided email in the payload is taken or not
                const result = yield User_1.default.findOne({ email: payload.email })
                    .exec()
                    .then((user) => {
                    if (user) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (result) {
                    throw new apiError_1.BadRequestError('This email is already taken');
                }
                user.email = payload.email;
            }
        }
        return user.save().then((user) => {
            //create new token since the old one has outdated data
            const token = jsonwebtoken_1.default.sign({
                email: user.email,
                userId: user._id,
                isAdmin: user.isAdmin,
                firstName: user.firstName,
                lastName: user.lastName,
            }, secrets_1.JWT_SECRET, {
                expiresIn: '1h',
            });
            return token;
        });
    }))
        .catch((err) => {
        throw new Error(err.message);
    });
}
function changePassword(payload) {
    return User_1.default.findOne({ email: payload.authData.email })
        .exec()
        .then((user) => {
        if (!user) {
            throw new apiError_1.InternalServerError();
        }
        return bcryptjs_1.default.compare(payload.oldPassword, user.password).then((res) => {
            if (res) {
                if (!isPassword(payload.newPassword)) {
                    throw new Error('Password must be from eight characters, at least one letter and one number');
                }
                return bcryptjs_1.default.hash(payload.newPassword, 10).then((hash) => {
                    user.password = hash;
                    return user.save().then((user) => {
                        const token = jsonwebtoken_1.default.sign({
                            email: user.email,
                            userId: user._id,
                            isAdmin: user.isAdmin,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        }, secrets_1.JWT_SECRET, {
                            expiresIn: '1h',
                        });
                        return token;
                    });
                });
            }
            else {
                throw new Error('Old password does not match');
            }
        });
    });
}
function resetPasswordRequest(payload) {
    if (!isEmail(payload.email)) {
        throw new Error('Must be a valid email address');
    }
    return User_1.default.findOne({ email: payload.email })
        .exec()
        .then((user) => {
        if (!user) {
            throw new Error('Email has not been registered');
        }
        const resetToken = jsonwebtoken_1.default.sign({
            email: user.email,
            userId: user._id,
        }, secrets_1.JWT_SECRET, {
            expiresIn: '1h',
        });
        const sgMail = new mail_1.MailService();
        sgMail.setApiKey(secrets_1.SENDGRID_API_KEY);
        const link = `${payload.url}/${resetToken}`;
        const msg = {
            to: payload.email,
            from: 'dung.vo@integrify.io',
            subject: 'Link to reset password',
            html: emailContent_1.emailContent(user.firstName, link),
        };
        return sgMail
            .send(msg)
            .then((res) => {
            return resetToken;
        })
            .catch((error) => {
            throw new apiError_1.InternalServerError();
        });
    });
}
function resetPassword(payload) {
    if (!isPassword(payload.newPassword)) {
        throw new apiError_1.BadRequestError('Password must be from eight characters, at least one letter and one number');
    }
    return User_1.default.findOne({ email: payload.resetToken.email })
        .exec()
        .then((user) => {
        if (!user) {
            throw new apiError_1.InternalServerError();
        }
        return bcryptjs_1.default.hash(payload.newPassword, 10).then((hash) => {
            user.password = hash;
            return user.save();
        });
    });
}
exports.default = {
    signUp,
    signIn,
    googleSignIn,
    updateProfile,
    changePassword,
    resetPasswordRequest,
    resetPassword,
};
//# sourceMappingURL=user.js.map