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
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const CLIENT_ID = process.env['CLIENT_ID'];
const client = new google_auth_library_1.OAuth2Client(CLIENT_ID);
function verifyGoogleIdToken(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
        try {
            const ticket = yield client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const googlePayload = {
                email: payload === null || payload === void 0 ? void 0 : payload.email,
                firstName: payload === null || payload === void 0 ? void 0 : payload.given_name,
                lastName: payload === null || payload === void 0 ? void 0 : payload.family_name,
            };
            req.body.payload = googlePayload;
            next();
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = verifyGoogleIdToken;
//# sourceMappingURL=verifyGoogleIdToken.js.map