const express = require('express');
const router = express.Router();

// GET all jobs
router.get('/jobs', async (req, res) => {
    const pool = req.app.locals.pool;
    try {
        const [rows] = await pool.query('SELECT id, title, description FROM jobs ORDER BY id');
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST a new job
router.post('/jobs', async (req, res) => {
    const { title, description } = req.body;
    const pool = req.app.locals.pool;
    try {
        const [result] = await pool.query(
            'INSERT INTO jobs (title, description) VALUES (?, ?)',
            [title, description]
        );
        // Return the inserted job with generated ID
        res.json({
            id: result.insertId,
            title,
            description
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
