const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

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

router.put("/:id", (req, res) => {
    const userId = req.params.id;
    const {
        fullname,
        email,
        phone,
        place,
        dob,
        gender,
        designation,
        username
    } = req.body;

    const SQL = `
        UPDATE users 
        SET fullname=?, email=?, phone=?, place=?, dob=?, gender=?, designation=?, username=?
        WHERE id=?
    `;

    db.query(
        SQL,
        [fullname, email, phone, place, dob, gender, designation, username, userId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Update failed" });
            }

            res.json({ message: "Profile updated successfully" });
        }
    );
});

router.put("/:id/change-password", async (req, res) => {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    const SQL = "SELECT password FROM users WHERE id=?";

    db.query(SQL, [userId], async (err, result) => {
        if (err) return res.status(500).json({ message: "Error" });

        const user = result[0];

        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        const updateSQL = "UPDATE users SET password=? WHERE id=?";

        db.query(updateSQL, [hashed, userId], (err) => {
            if (err) return res.status(500).json({ message: "Error updating password" });

            res.json({ message: "Password updated" });
        });
    });
});

router.delete("/:id", (req, res) => {
    const userId = req.params.id;

    const SQL = "DELETE FROM users WHERE id = ?";

    db.query(SQL, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to delete account" });
        }

        res.json({ message: "Account deleted successfully" });
    });
});

module.exports = router;