const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies

// ---------- MySQL Connection ----------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",       // XAMPP default
  database: "freelancehub"
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// ---------- ROOT ROUTE ----------
// Returns all jobs and all registered users
app.get("/", (req, res) => {
  const jobsSql = "SELECT id, title, description FROM jobs ORDER BY id ASC";
  const usersSql = "SELECT id, name, email FROM users ORDER BY id ASC";

  db.query(jobsSql, (errJobs, jobs) => {
    if (errJobs) return res.status(500).json({ success: false, message: errJobs });

    db.query(usersSql, (errUsers, users) => {
      if (errUsers) return res.status(500).json({ success: false, message: errUsers });

      res.json({ success: true, jobs, users });
    });
  });
});

// ---------- GET /jobs ----------
app.get("/jobs", (req, res) => {
  const sql = "SELECT id, title, description FROM jobs ORDER BY id ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err });
    res.json(results);
  });
});

// ---------- Register User ----------
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err });
    if (results.length > 0) return res.json({ success: false, message: "User already exists" });

    const insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertSql, [name, email, password], (err2, result) => {
      if (err2) return res.status(500).json({ success: false, message: err2 });
      res.json({ success: true, message: "User registered successfully", user: { name, email } });
    });
  });
});

// ---------- Login User ----------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err });
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// ---------- Post a new job ----------
app.post("/jobs", (req, res) => {
  const { title, description } = req.body;
  const sql = "INSERT INTO jobs (title, description) VALUES (?, ?)";
  db.query(sql, [title, description], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err });
    res.json({ success: true, message: "Job posted successfully" });
  });
});

// ---------- Start Server ----------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
