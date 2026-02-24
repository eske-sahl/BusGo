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

module.exports = router;