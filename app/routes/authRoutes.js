const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Import controller

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user by providing email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: User has been authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post("/login", authController.loginUser);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       200:
 *         description: Its a piece of cake! Register Sucessfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post("/register", authController.registerUser);

/**
 * @swagger
 * /auth/authorize:
 *   get:
 *     summary: Authorize user
 *     description: Authorize a user to access protected routes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User has been authorized.
 *       401:
 *         description: The door is closed! No token, no entry. Access denied. Tokens are not provided.
 */

router.get("/authorize", authController.authorizeUser, (req, res) => {
  res.status(200).json({ message: "User has been authorized." });
});

module.exports = router;
