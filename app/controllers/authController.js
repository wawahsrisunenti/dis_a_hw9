const jwt = require("jsonwebtoken");
const authModel = require("../models/authModels"); // Sesuaikan dengan lokasi file model Anda
const { TokenExpiredError } = require("jsonwebtoken"); // Import error TokenExpiredError (opsional)

/**
 * Fungsi untuk menangani login user.
 */
const loginUser = (req, res) => {
  const { email, password } = req.body;

  authModel.getUserByEmail(email, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
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
          res.status(401).json({ message: "Gagal login" });
        }
      } else {
        res.status(401).json({ message: "Gagal login" });
      }
    }
  });
};

/**
 * Fungsi untuk menangani registrasi user baru.
 */
const registerUser = (req, res) => {
  const { email, password, gender, role } = req.body;

  authModel.getUserByEmail(email, (error, results) => {
    if (error) {
      res.status(500).json(error);
    } else {
      if (results.rows.length > 0) {
        res.status(400).json({ message: "Email sudah terdaftar" });
      } else {
        authModel.createUser(
          email,
          password,
          gender,
          role,
          (error, results) => {
            if (error) {
              res.status(500).json(error);
            } else {
              const user = {
                email: email,
                id: results.rows[0].id,
              };
              const token = jwt.sign(user, "jumintenParkinson", {
                expiresIn: "1h",
              });
              res.json({
                message: "Its a piece of cake! Register Sucessfully",
                token,
              });
            }
          }
        );
      }
    }
  });
};

/**
 * Fungsi middleware untuk mengotorisasi pengguna.
 */
const authorizeUser = (req, res, next) => {
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
};

module.exports = {
  loginUser,
  registerUser,
  authorizeUser,
};
