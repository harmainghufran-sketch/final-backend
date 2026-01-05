const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Freelancehub"
});

// ---------- REGISTER ----------
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const insertSql =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertSql, [name, email, password], (err) => {
      if (err) return res.status(500).json({ message: "Register failed" });

      res.json({ success: true });
    });
  });
});

// ---------- LOGIN ----------
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length > 0) {
      res.json({
        success: true,
        user: {
          name: result[0].name,
          email: result[0].email
        }
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  });
});

module.exports = router;
