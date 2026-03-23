const express = require("express");
const router = express.Router();
const db = require("../db");

/* POST /api/earnings/add — driver records earnings */
router.post("/add", (req, res) => {
    const { driver_id, bus_id, date, amount, passengers, notes } = req.body;
    if (!driver_id || !date || !amount)
        return res.status(400).json({ error: "driver_id, date, and amount are required" });

    const checkSQL = "SELECT id FROM earnings WHERE driver_id = ? AND DATE(date) = ?";
    db.query(checkSQL, [driver_id, date], (checkErr, checkResult) => {
        if (checkErr) return res.status(500).json({ error: checkErr.message });

        if (checkResult.length > 0) {
            db.query(
                `UPDATE earnings SET amount=?, passengers=?, notes=?, bus_id=? WHERE driver_id=? AND DATE(date)=?`,
                [amount, passengers || 0, notes || null, bus_id || null, driver_id, date],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, message: "Earnings updated" });
                }
            );
        } else {
            db.query(
                `INSERT INTO earnings (driver_id, bus_id, date, amount, passengers, notes) VALUES (?,?,?,?,?,?)`,
                [driver_id, bus_id || null, date, amount, passengers || 0, notes || null],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, id: result.insertId });
                }
            );
        }
    });
});

/* GET /api/earnings/driver/:driverId  — driver's own history, ?date= for single day */
router.get("/driver/:driverId", (req, res) => {
    const { driverId } = req.params;
    const { date } = req.query;

    let sql = `SELECT e.*, b.name as bus_name, b.number as bus_number
               FROM earnings e LEFT JOIN buses b ON e.bus_id = b.id
               WHERE e.driver_id = ?`;
    const params = [driverId];

    if (date) { sql += " AND DATE(e.date) = ?"; params.push(date); }
    sql += " ORDER BY e.date DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(date ? (results[0] || null) : results);
    });
});

/*
  GET /api/earnings/owner/:ownerId?date=YYYY-MM-DD
  Owner sees earnings of all their drivers for a specific date
*/
router.get("/owner/:ownerId", (req, res) => {
    const { ownerId } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const sql = `
        SELECT 
            e.*,
            u.fullname AS driver_name,
            b.name     AS bus_name,
            b.number   AS bus_number
        FROM earnings e
        LEFT JOIN buses b ON e.bus_id = b.id
        LEFT JOIN users u ON e.driver_id = u.id
        WHERE b.owner = ? AND DATE(e.date) = ?
        ORDER BY e.amount DESC
    `;
    db.query(sql, [ownerId, targetDate], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ===================================================
// ADD THIS ROUTE to your earnings router (backend)
// e.g., in routes/earnings.js or wherever your
// /api/earnings routes are defined
// ===================================================

// GET /api/earnings/owner/:ownerId/monthly?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/owner/:ownerId/monthly', async (req, res) => {
    const { ownerId } = req.params;
    const { start, end } = req.query;

    try {
        // Adjust table/column names to match your actual DB schema
        const [rows] = await db.query(
            `SELECT 
                SUM(e.amount) AS total,
                COUNT(*) AS records
             FROM earnings e
             JOIN driver_requests dr ON e.driver_id = dr.driver_id
             WHERE dr.owner_id = ?
               AND e.date >= ?
               AND e.date <= ?`,
            [ownerId, start, end]
        );
        res.json({ total: rows[0]?.total || 0, records: rows[0]?.records || 0 });
    } catch (err) {
        console.error("Monthly earnings error:", err);
        res.status(500).json({ error: "Failed to fetch monthly earnings" });
    }
});

// ===================================================
// ALTERNATIVE: If you don't want to add a new endpoint,
// you can also fetch all earnings for the month from
// the existing daily endpoint by looping — but the 
// dedicated endpoint above is far more efficient.
// ===================================================

module.exports = router;