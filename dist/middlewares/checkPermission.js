"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = require("../helpers/apiError");
function checkResetToken(req, res, next) {
    const isAdmin = req.body.authData.isAdmin;
    if (isAdmin) {
        next();
    }
    else {
        throw new apiError_1.ForbiddenError('Require to have admin right');
    }
}
exports.default = checkResetToken;
//# sourceMappingURL=checkPermission.js.map