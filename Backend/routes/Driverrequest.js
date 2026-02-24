const express = require("express");
const router = express.Router();
const db = require("../db");

/*
  POST /api/driver-requests/add
  Driver sends request to a specific owner
*/
router.post("/add", (req, res) => {
    const { driver_id, driver_name, email, owner_id, license_number,
            mobile, experience_years, vehicle_types, address, emergency_contact, notes } = req.body;

    if (!driver_id || !driver_name || !license_number || !mobile || !owner_id) {
        return res.status(400).json({ error: "driver_id, driver_name, owner_id, license_number, and mobile are required" });
    }

    // Check for existing pending request to same owner
    const checkSQL = "SELECT id FROM driver_requests WHERE driver_id = ? AND owner_id = ? AND status = 'pending'";
    db.query(checkSQL, [driver_id, owner_id], (checkErr, checkResult) => {
        if (checkErr) return res.status(500).json({ error: checkErr.message });
        if (checkResult.length > 0)
            return res.status(409).json({ error: "You already have a pending request to this owner" });

        const sql = `
            INSERT INTO driver_requests
            (driver_id, driver_name, email, owner_id, license_number, mobile,
             experience_years, vehicle_types, address, emergency_contact, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        db.query(sql,
            [driver_id, driver_name, email || null, owner_id, license_number, mobile,
             experience_years || null, vehicle_types || null, address || null,
             emergency_contact || null, notes || null],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: result.insertId });
            }
        );
    });
});

/*
  POST /api/driver-requests/owner-add
  Owner directly adds a driver (already agreed, no pending step)
*/
router.post("/owner-add", (req, res) => {
    const { driver_name, email, owner_id, license_number, mobile,
            experience_years, vehicle_types, address, emergency_contact, notes } = req.body;

    if (!driver_name || !license_number || !mobile || !owner_id) {
        return res.status(400).json({ error: "driver_name, owner_id, license_number, and mobile are required" });
    }

    const sql = `
        INSERT INTO driver_requests
        (driver_id, driver_name, email, owner_id, license_number, mobile,
         experience_years, vehicle_types, address, emergency_contact, notes, status)
        VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'accepted')
    `;
    db.query(sql,
        [driver_name, email || null, owner_id, license_number, mobile,
         experience_years || null, vehicle_types || null, address || null,
         emergency_contact || null, notes || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

/*
  GET /api/driver-requests/driver/:driverId
  Latest request status for a specific driver
*/
router.get("/driver/:driverId", (req, res) => {
    const sql = `SELECT * FROM driver_requests WHERE driver_id = ? ORDER BY created_at DESC LIMIT 1`;
    db.query(sql, [req.params.driverId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || null);
    });
});

/*
  GET /api/driver-requests/owner/:ownerId
  All requests (pending + accepted) for a specific owner, with bus details
*/
router.get("/owner/:ownerId", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const sql = `
        SELECT 
            dr.*,
            b.id   AS bus_id_real,
            b.name AS bus_name,
            b.number AS bus_number,
            e.amount AS today_earnings
        FROM driver_requests dr
        LEFT JOIN buses b ON dr.assigned_bus_id = b.id
        LEFT JOIN earnings e ON e.driver_id = dr.driver_id AND DATE(e.date) = ?
        WHERE dr.owner_id = ?
        ORDER BY dr.created_at DESC
    `;
    db.query(sql, [today, req.params.ownerId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

/*
  PUT /api/driver-requests/:id/accept
*/
router.put("/:id/accept", (req, res) => {
    const { owner_id, bus_id } = req.body;
    const sql = `UPDATE driver_requests SET status='accepted', owner_id=?, assigned_bus_id=?, updated_at=NOW() WHERE id=?`;
    db.query(sql, [owner_id, bus_id, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

/*
  PUT /api/driver-requests/:id/reject
*/
router.put("/:id/reject", (req, res) => {
    const sql = `UPDATE driver_requests SET status='rejected', updated_at=NOW() WHERE id=?`;
    db.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;