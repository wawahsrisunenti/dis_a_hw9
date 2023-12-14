const express = require("express");
const router = express.Router();
const pool = require("../dis_queries");
const { authorize } = require("./auth");

// Middleware otentikasi untuk seluruh rute dalam file movies.js (memerlukan otentikasi)
router.use(authorize);

// GET semua data movies
router.get("/", (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;
  pool.query(
    "SELECT * FROM movies OFFSET $1 LIMIT $2",
    [offset, limit],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results.rows);
    }
  );
});

// GET data movie berdasarkan ID
router.get("/:id", (req, res) => {
  const movieId = req.params.id;
  pool.query(
    "SELECT * FROM movies WHERE id = $1",
    [movieId],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.json(results.rows[0]);
    }
  );
});

// POST data movie baru (memerlukan otentikasi)
router.post("/", (req, res) => {
  const { title, genres, year } = req.body;

  // Ambil ID terakhir dari tabel
  pool.query("SELECT MAX(id) FROM movies", (error, results) => {
    if (error) {
      throw error;
    }

    // Hitung ID baru
    const newId = results.rows[0].max + 1;

    // Masukkan data baru dengan ID baru
    pool.query(
      "INSERT INTO movies (id, title, genres, year) VALUES ($1, $2, $3, $4)",
      [newId, title, genres, year],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.json({
          message:
            "New movie data has been successfully added with ID " + newId,
        });
      }
    );
  });
});

// PUT (update) data movie berdasarkan ID (memerlukan otentikasi)
router.put("/:id", (req, res) => {
  const movieId = req.params.id;
  const { title, genres, year } = req.body;
  pool.query(
    "UPDATE movies SET title = $1, genres = $2, year = $3 WHERE id = $4",
    [title, genres, year, movieId],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.json({
        message: "Movie data updated successfully",
      });
    }
  );
});

// DELETE data movie berdasarkan ID (memerlukan otentikasi)
router.delete("/:id", (req, res) => {
  const movieId = req.params.id;
  pool.query(
    "DELETE FROM movies WHERE id = $1",
    [movieId],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.json({
        message: "Movie data has been successfully deleted",
      });
    }
  );
});

module.exports = router;
