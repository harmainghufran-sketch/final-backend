const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- MySQL Connection ----------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "freelancehub" // ✅ keep SAME name everywhere
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// ---------- ROOT ROUTE ----------
app.get("/", (req, res) => {
  const jobsSql = "SELECT id, title, description FROM jobs ORDER BY id ASC";
  const usersSql = "SELECT id, name, email FROM users ORDER BY id ASC";

  db.query(jobsSql, (errJobs, jobs) => {
    if (errJobs) return res.status(500).json(errJobs);

    db.query(usersSql, (errUsers, users) => {
      if (errUsers) return res.status(500).json(errUsers);

      res.json({ success: true, jobs, users });
    });
  });
});

// ---------- GET JOBS ----------
app.get("/jobs", (req, res) => {
  const sql = "SELECT id, title, description FROM jobs ORDER BY id ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ---------- REGISTER ----------
app.post("/register", (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const insertSql =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertSql, [name, email, password], (err2) => {
      if (err2) return res.status(500).json(err2);

      res.json({
        success: true,
        message: "Registration successful",
        user: { name, email }
      });
    });
  });
});

// ---------- LOGIN ----------
app.post("/login", (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email & password required" });
  }

  const sql = "SELECT id, name, email FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(400).json({ success: false, message: "Invalid email or password" });
    }
  });
});

// ---------- POST JOB ----------
app.post("/jobs", (req, res) => {
  const title = req.body.title?.trim();
  const description = req.body.description?.trim();

  if (!title || !description) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const sql = "INSERT INTO jobs (title, description) VALUES (?, ?)";
  db.query(sql, [title, description], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ success: true, message: "Job posted successfully" });
  });
});

// ---------- START SERVER ----------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
