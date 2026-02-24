const express = require("express");
const router = express.Router();
const db = require("../db");

// Get route by bus id
router.get("/bus/:busId", (req, res) => {
  const sql = "SELECT * FROM routes WHERE bus_id = ?";
  db.query(sql, [req.params.busId], (err, result) => {
    if (err) {
      console.error("Get route error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0] || null);
  });
});

// Get routes by owner id
router.get("/owner/:ownerId", (req, res) => {
  const { ownerId } = req.params;

  const sql = `
    SELECT *
    FROM routes
    WHERE owner_id = ?
  `;

  db.query(sql, [ownerId], (err, results) => {
    if (err) {
      console.error("Get routes by owner error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Insert or update route - COMPLETELY FIXED
router.post("/", (req, res) => {
  const {
    bus_id,
    route_name,
    start_place,
    end_place,
    start_time,
    end_time,
    distance,
    duration,
    owner_id,
    status
  } = req.body;

  // Log received data for debugging
  console.log("Route POST received:", {
    bus_id,
    route_name,
    start_place,
    end_place,
    start_time,
    end_time,
    distance,
    duration,
    owner_id,
    status
  });

  // Validate required fields
  if (!bus_id || !owner_id) {
    return res.status(400).json({ 
      error: "bus_id and owner_id are required" 
    });
  }

  // Check if route already exists for this bus
  const checkSQL = "SELECT id FROM routes WHERE bus_id = ?";
  
  db.query(checkSQL, [bus_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Route check error:", checkErr);
      return res.status(500).json({ 
        error: "Database check failed",
        details: checkErr.message 
      });
    }

    if (checkResult && checkResult.length > 0) {
      // UPDATE existing route
      const routeId = checkResult[0].id;
      const updateSQL = `
        UPDATE routes SET
          route_name = ?,
          start_place = ?,
          end_place = ?,
          start_time = ?,
          end_time = ?,
          distance = ?,
          duration = ?,
          status = ?
        WHERE id = ?
      `;

      const updateValues = [
        route_name || null,
        start_place || null,
        end_place || null,
        start_time || null,
        end_time || null,
        distance || null,
        duration || null,
        status || 'active',
        routeId
      ];

      console.log("Updating route:", routeId, updateValues);

      db.query(updateSQL, updateValues, (updateErr) => {
        if (updateErr) {
          console.error("Route update error:", updateErr);
          return res.status(500).json({ 
            error: "Route update failed",
            details: updateErr.message 
          });
        }

        console.log("Route updated successfully:", routeId);
        res.json({
          success: true,
          message: "Route updated",
          routeId: routeId,
          id: routeId
        });
      });
    } else {
      // INSERT new route
      const insertSQL = `
        INSERT INTO routes
        (bus_id, owner_id, route_name, start_place, end_place, start_time, end_time, distance, duration, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertValues = [
        bus_id,
        owner_id,
        route_name || null,
        start_place || null,
        end_place || null,
        start_time || null,
        end_time || null,
        distance || null,
        duration || null,
        status || 'active'
      ];

      console.log("Inserting new route:", insertValues);

      db.query(insertSQL, insertValues, (insertErr, result) => {
        if (insertErr) {
          console.error("Route insert error:", insertErr);
          return res.status(500).json({ 
            error: "Route insert failed",
            details: insertErr.message,
            sqlState: insertErr.sqlState,
            code: insertErr.code
          });
        }

        console.log("Route created successfully:", result.insertId);
        res.json({
          success: true,
          message: "Route created",
          routeId: result.insertId,
          id: result.insertId
        });
      });
    }
  });
});


// SEARCH routes by from/to stop names
router.get("/search", (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }

  const SQL = `
    SELECT 
      b.id as bus_id,
      b.name as bus_name,
      b.number as bus_number,
      b.driver,
      b.capacity,
      b.status,
      r.id as route_id,
      r.route_name,
      r.start_place,
      r.end_place,
      r.start_time,
      r.end_time,
      r.distance,
      r.duration
    FROM routes r
    JOIN buses b ON r.bus_id = b.id
    WHERE 
      r.id IN (
        SELECT s1.route_id FROM stops s1
        WHERE s1.stop_name LIKE ?
      )
      AND r.id IN (
        SELECT s2.route_id FROM stops s2
        WHERE s2.stop_name LIKE ?
        AND s2.stop_order > (
          SELECT s3.stop_order FROM stops s3
          WHERE s3.route_id = s2.route_id AND s3.stop_name LIKE ? LIMIT 1
        )
      )
  `;

  const fromWild = `%${from}%`;
  const toWild = `%${to}%`;

  db.query(SQL, [fromWild, toWild, fromWild], (err, results) => {
    if (err) {
      console.error("Route search error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;