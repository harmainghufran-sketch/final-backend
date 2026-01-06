const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// ---------- MySQL Connection ----------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Freelancehub"
});

// ---------- REGISTER ----------
router.post("/register", (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const insertSql =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertSql, [name, email, password], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Registration failed" });
      }

      res.json({ success: true, message: "Registration successful" });
    });
  });
});

// ---------- LOGIN ----------
router.post("/login", (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length > 0) {
      res.json({
        success: true,
        user: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email
        }
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  });
});

module.exports = router;
