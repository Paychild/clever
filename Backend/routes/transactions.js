const express = require('express');
const router = express.Router();
const { pool: db } = require('../database');

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all transactions with category info
router.get('/transactions', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.id, t.title, t.amount, t.date, t.category_id, 
                   c.name AS category_name, c.type AS category_type 
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new transaction
router.post('/transactions', async (req, res) => {
    try {
        const { title, amount, category_id, date } = req.body;

        if (!title || !amount || !category_id) {
            return res.status(400).json({ error: 'Title, amount, and category_id are required' });
        }

        const [result] = await db.query(
            'INSERT INTO transactions (title, amount, category_id, date) VALUES (?, ?, ?, ?)',
            [title, amount, category_id, date || new Date()]
        );

        res.status(201).json({ id: result.insertId, title, amount, category_id, date });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;