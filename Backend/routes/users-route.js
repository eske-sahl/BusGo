const express = require("express");
const router = express.Router();
const db = require("../db");

/*
  GET /api/users/by-license/:licenseNumber
  Owner looks up a driver by their driving license number.
  The license_number field must exist in the users table.
*/
router.get("/by-license/:licenseNumber", (req, res) => {
    const sql = `
        SELECT id, fullname, email, phone, place, license_number
        FROM users
        WHERE role = 'driver' AND license_number = ?
        LIMIT 1
    `;
    db.query(sql, [req.params.licenseNumber], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || null);
    });
});

module.exports = router;