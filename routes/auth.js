const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../dis_queries");

// Middleware untuk otentikasi user (contoh)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Query ke basis data untuk mencari pengguna dengan email yang cocok
  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (error, results) => {
      if (error) {
        throw error;
      }

      if (results.rows.length === 1) {
        // Pengguna ditemukan berdasarkan email, sekarang periksa kata sandi
        const user = results.rows[0];
        if (user.password === password) {
          // Kata sandi cocok, buat token JWT dan kirimkan sebagai respons
          const token = jwt.sign(
            { email: email, id: user.id },
            "jumintenParkinson"
          );
          res.json({ token });
        } else {
          // Kata sandi tidak cocok
          res
            .status(401)
            .json({ message: "Flat as a pancake! Please try again" });
        }
      } else {
        // Pengguna tidak ditemukan berdasarkan email
        res
          .status(401)
          .json({ message: "Flat as a pancake! Please try again" });
      }
    }
  );
});

router.post("/register", (req, res) => {
  const { email, password, gender, role } = req.body;

  // Cek apakah email sudah terdaftar
  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (error, results) => {
      if (error) {
        throw error;
      }

      if (results.rows.length > 0) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // Jika email belum terdaftar, tambahkan pengguna baru
      pool.query(
        "INSERT INTO users (email, password, gender, role) VALUES ($1, $2, $3, $4) RETURNING id",
        [email, password, gender, role],
        (error, results) => {
          if (error) {
            throw error;
          }

          // Buat token otentikasi untuk pengguna yang baru mendaftar
          const user = {
            email: email,
            id: results.rows[0].id,
          };
          const token = jwt.sign(user, "jumintenParkinson");
          res.json({
            message: "Its a piece of cake! Register Sucessfully",
            token,
          });
        }
      );
    }
  );
});

function authorize(req, res, next) {
  // Periksa token otentikasi
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({
        message:
          "The door is closed! No token, no entry. Access denied. Tokens are not provided.",
      });

  try {
    const decoded = jwt.verify(token, "jumintenParkinson");
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: "Thats a bum steer! Invalid Token" });
  }
}

module.exports = { router, authorize };
