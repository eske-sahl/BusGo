const express = require("express");
const router = express.Router();
const db = require("../db");

/*
 ➕ Add a stop to a route
*/
router.post("/add", (req, res) => {
  const {
    route_id,
    stop_name,
    stop_order,
    arrival_time,
  } = req.body;

  const sql = `
    INSERT INTO stops
    (route_id, stop_name, stop_order, arrival_time)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [route_id, stop_name, stop_order, arrival_time],
    (err, result) => {
      if (err) {
        console.error("Stop insert error:", err);
        return res.status(500).json({ error: "Failed to add stop" });
      }

      res.json({ success: true, stopId: result.insertId });
    }
  );
});

/*
 📥 Get all stops of a route (ordered)
*/
router.get("/route/:routeId", (req, res) => {
  const routeId = req.params.routeId;

  const sql = `
    SELECT * FROM stops
    WHERE route_id = ?
    ORDER BY stop_order ASC
  `;

  db.query(sql, [routeId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json(results);
  });
});

/*
 🗑️ DELETE all stops of a route - MOVED FROM busroute.js
*/
router.delete("/route/:routeId", (req, res) => {
  const { routeId } = req.params;

  db.query(
    "DELETE FROM stops WHERE route_id = ?",
    [routeId],
    (err) => {
      if (err) {
        console.error("Delete stops error:", err);
        return res.status(500).json({ error: "Failed to delete stops" });
      }
      res.json({ success: true, message: "Stops cleared" });
    }
  );
});

module.exports = router;