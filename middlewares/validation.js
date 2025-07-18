const { body, validationResult } = require("express-validator");

const registerValidation = [
    body("username")
        .isAlphanumeric()
        .isLength({ min: 3 })
        .withMessage("Please enter a valid username (at least 3 characters, alphanumeric only)."),
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email address."),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long."),
    validateRequest
];

const loginValidation = [
    body("username")
        .isAlphanumeric()
        .isLength({ min: 3 })
        .withMessage("Please enter a valid username."),
    body("password")
        .notEmpty()
        .withMessage("Password field cannot be empty."),
    validateRequest
];

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
}

module.exports = {
    registerValidation,
    loginValidation,
    validateRequest
};