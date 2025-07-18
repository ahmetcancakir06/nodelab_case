const express = require('express');
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    checkToken,
    getOnlineUsers,
    getOnlineUserCount,
    getUserOnlineStatus
} = require('../controllers/usersController');
const { tokenCheck } = require("../middlewares/auth");
const { body, param } = require("express-validator");
const { validateRequest } = require("../middlewares/validation");
const router = express.Router();

/**
 * @swagger
 * /token:
 *   get:
 *     summary: Check if a token is valid
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Unauthorized or invalid token
 */
router.get('/token', tokenCheck, checkToken);

/**
 * @swagger
 * /users/online:
 *   get:
 *     summary: Get all online users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of online users
 *       401:
 *         description: Unauthorized
 */
router.get('/users/online', tokenCheck, getOnlineUsers);

/**
 * @swagger
 * /users/online/count:
 *   get:
 *     summary: Get count of online users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Number of online users
 *       401:
 *         description: Unauthorized
 */
router.get('/users/online/count', tokenCheck, getOnlineUserCount);

/**
 * @swagger
 * /users/{id}/status:
 *   get:
 *     summary: Get online status of a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User online status
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 */
router.get('/users/:id/status', tokenCheck, param("id").isMongoId(), validateRequest, getUserOnlineStatus);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get('/users', tokenCheck, getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/users/:id',
    tokenCheck,
    param("id").isMongoId().withMessage("Invalid user ID"),
    validateRequest,
    getUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 pattern: '^[a-zA-Z0-9]+$'
 *                 description: Username (alphanumeric, min 3 chars)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid input or ID format
 *       401:
 *         description: Unauthorized
 */
router.put(
    '/users/:id',
    tokenCheck,
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("username").optional().isAlphanumeric().isLength({ min: 3 }).withMessage("Username must be at least 3 characters and alphanumeric"),
    body("email").optional().isEmail().withMessage("Must be a valid email"),
    validateRequest,
    updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 */
router.delete(
    '/users/:id',
    tokenCheck,
    param("id").isMongoId().withMessage("Invalid user ID"),
    validateRequest,
    deleteUser
);

module.exports = router;