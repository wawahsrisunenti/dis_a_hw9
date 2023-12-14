const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../dis_queries");
const { TokenExpiredError } = require("jsonwebtoken");

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

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (error, results) => {
      if (error) {
        throw error;
      }

      if (results.rows.length === 1) {
        const user = results.rows[0];
        if (user.password === password) {
          const token = jwt.sign(
            { email: email, id: user.id },
            "jumintenParkinson",
            { expiresIn: "1h" }
          );

          res.json({ token });
        } else {
          res
            .status(401)
            .json({ message: "Flat as a pancake! Please try again" });
        }
      } else {
        res
          .status(401)
          .json({ message: "Flat as a pancake! Please try again" });
      }
    }
  );
});

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
 *         description: User registration successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */

router.post("/register", (req, res) => {
  const { email, password, gender, role } = req.body;

  pool.query("SELECT MAX(id) AS max_id FROM users", (error, results) => {
    if (error) {
      throw error;
    }

    const maxId = results.rows[0].max_id || 0;
    const newId = maxId + 1;

    pool.query(
      "INSERT INTO users (id, email, password, gender, role) VALUES ($1, $2, $3, $4, $5)",
      [newId, email, password, gender, role],
      (error, results) => {
        if (error) {
          throw error;
        }

        const user = {
          email: email,
          id: newId,
        };
        const token = jwt.sign(user, "jumintenParkinson", { expiresIn: "1h" });
        res.json({
          message: "Its a piece of cake! Register Sucessfully",
          token,
        });
      }
    );
  });
});

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
 *         description: Unauthorized, token is missing or invalid.
 */

function authorize(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({
      message:
        "The door is closed! No token, no entry. Access denied. Tokens are not provided.",
    });

  try {
    const decoded = jwt.verify(token, "jumintenParkinson");
    req.user = decoded;
    next();
  } catch (ex) {
    if (ex instanceof TokenExpiredError) {
      res.status(401).json({ message: "The jig is up! Token has expired" });
    } else {
      res.status(400).json({ message: "Thats a bum steer! Invalid Token" });
    }
  }
}

module.exports = { router, authorize };
