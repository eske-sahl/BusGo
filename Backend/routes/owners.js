const express = require("express");
const router = express.Router();
const db = require("../db");

/*
  GET /api/owners/search?query=...
  Search users with role='owner' by name or designation
  Used by drivers to find which owner to send their request to
*/
router.get("/search", (req, res) => {
    const { query } = req.query;

    if (!query || !query.trim()) {
        return res.status(400).json({ error: "query is required" });
    }

    const sql = `
        SELECT id, fullname, email, phone, place, designation
        FROM users
        WHERE role = 'owner'
          AND (fullname LIKE ? OR designation LIKE ? OR place LIKE ?)
        LIMIT 10
    `;
    const wildcard = `%${query.trim()}%`;

    db.query(sql, [wildcard, wildcard, wildcard], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;