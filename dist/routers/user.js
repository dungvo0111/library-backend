"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const checkResetToken_1 = __importDefault(require("../middlewares/checkResetToken"));
const verifyGoogleIdToken_1 = __importDefault(require("../middlewares/verifyGoogleIdToken"));
const router = express_1.default.Router();
router.post('/', user_1.signUp);
router.post('/signIn', user_1.signIn);
router.post('/googleSignIn', verifyGoogleIdToken_1.default, user_1.googleSignIn);
router.put('/updateProfile', checkAuth_1.default, user_1.updateProfile);
router.put('/updatePassword', checkAuth_1.default, user_1.changePassword);
router.post('/resetPassword', user_1.resetPasswordRequest);
router.put('/resetPassword/:resetToken', checkResetToken_1.default, user_1.resetPassword);
exports.default = router;
//# sourceMappingURL=user.js.map