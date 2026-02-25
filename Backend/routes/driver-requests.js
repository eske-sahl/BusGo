const express = require("express");
const router = express.Router();
const db = require("../db");

/*
  POST /api/driver-requests/invite
  Owner sends invite to a specific driver by their license number
  Bus is pre-selected — status = 'pending' until driver accepts
*/
router.post("/invite", (req, res) => {
    const { owner_id, driver_id, driver_name, email, license_number,
            mobile, bus_id, notes } = req.body;

    if (!owner_id || !driver_id || !license_number || !bus_id) {
        return res.status(400).json({ error: "owner_id, driver_id, license_number, and bus_id are required" });
    }

    // Check if driver already has a pending invite from this owner
    const checkSQL = `SELECT id FROM driver_requests 
                      WHERE driver_id = ? AND owner_id = ? AND status IN ('pending','accepted')`;
    db.query(checkSQL, [driver_id, owner_id], (checkErr, checkResult) => {
        if (checkErr) return res.status(500).json({ error: checkErr.message });
        if (checkResult.length > 0)
            return res.status(409).json({ error: "You already have an active invite or this driver is already in your team" });

        const sql = `
            INSERT INTO driver_requests
            (owner_id, driver_id, driver_name, email, license_number, mobile,
             assigned_bus_id, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        db.query(sql,
            [owner_id, driver_id, driver_name, email || null, license_number,
             mobile || null, bus_id, notes || null],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: result.insertId });
            }
        );
    });
});

/*
  GET /api/driver-requests/invites/:driverId
  Driver sees pending invitations sent to them by owners
*/
router.get("/invites/:driverId", (req, res) => {
    const sql = `
        SELECT 
            dr.*,
            u.fullname  AS owner_name,
            u.place     AS owner_place,
            b.name      AS bus_name,
            b.number    AS bus_number,
            b.capacity  AS capacity,
            b.status    AS bus_status,
            r.start_place, r.end_place, r.start_time, r.end_time,
            r.distance, r.duration
        FROM driver_requests dr
        LEFT JOIN users u  ON dr.owner_id = u.id
        LEFT JOIN buses b  ON dr.assigned_bus_id = b.id
        LEFT JOIN routes r ON b.id = r.bus_id
        WHERE dr.driver_id = ? AND dr.status = 'pending'
        ORDER BY dr.created_at DESC
    `;
    db.query(sql, [req.params.driverId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

/*
  PUT /api/driver-requests/:id/accept-invite
  Driver accepts the invitation — marks accepted, assigns bus driver field
*/
router.put("/:id/accept-invite", (req, res) => {
    // First get the invite to know driver_name and bus_id
    db.query("SELECT * FROM driver_requests WHERE id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ error: "Invite not found" });

        const invite = rows[0];

        // Mark as accepted
        db.query(
            "UPDATE driver_requests SET status='accepted', updated_at=NOW() WHERE id=?",
            [req.params.id],
            (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });

                // Update bus driver field
                if (invite.assigned_bus_id) {
                    db.query(
                        "UPDATE buses SET driver = ? WHERE id = ?",
                        [invite.driver_name, invite.assigned_bus_id],
                        () => {} // fire and forget
                    );
                }
                res.json({ success: true });
            }
        );
    });
});

/*
  PUT /api/driver-requests/:id/decline-invite
  Driver declines the invitation
*/
router.put("/:id/decline-invite", (req, res) => {
    db.query(
        "UPDATE driver_requests SET status='declined', updated_at=NOW() WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

/*
  PUT /api/driver-requests/:id/cancel
  Owner cancels a pending invitation
*/
router.put("/:id/cancel", (req, res) => {
    db.query(
        "UPDATE driver_requests SET status='cancelled', updated_at=NOW() WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

/*
  PUT /api/driver-requests/:id/remove
  Owner removes an accepted driver
*/
router.put("/:id/remove", (req, res) => {
    db.query(
        "UPDATE driver_requests SET status='removed', updated_at=NOW() WHERE id=?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

/*
  PUT /api/driver-requests/:id/reassign
  Owner reassigns driver to a different bus
*/
router.put("/:id/reassign", (req, res) => {
    const { bus_id, owner_id } = req.body;
    db.query(
        "UPDATE driver_requests SET assigned_bus_id=?, updated_at=NOW() WHERE id=?",
        [bus_id, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

/*
  GET /api/driver-requests/owner/:ownerId
  All requests for a specific owner (pending + accepted), with bus + earnings
*/
router.get("/owner/:ownerId", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const sql = `
        SELECT 
            dr.*,
            b.name      AS bus_name,
            b.number    AS bus_number,
            e.amount    AS today_earnings
        FROM driver_requests dr
        LEFT JOIN buses b  ON dr.assigned_bus_id = b.id
        LEFT JOIN earnings e ON e.driver_id = dr.driver_id AND DATE(e.date) = ?
        WHERE dr.owner_id = ? AND dr.status IN ('pending','accepted')
        ORDER BY dr.created_at DESC
    `;
    db.query(sql, [today, req.params.ownerId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;