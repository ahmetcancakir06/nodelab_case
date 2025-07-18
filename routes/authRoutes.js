const router = require("express").Router();
const {
    login,
    register,
    logout,
    me
} = require("../controllers/authController");
const {loginValidation, registerValidation} = require("../middlewares/validation");
const {refreshToken, tokenCheck} = require("../middlewares/auth");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login succesful
 */
router.post("/auth/login", loginValidation,login);
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User Registration
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/auth/register",registerValidation, register);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT Token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post("/auth/refresh", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/auth/logout", tokenCheck, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get("/auth/me", tokenCheck, me);

module.exports = router;