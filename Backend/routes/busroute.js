const express = require("express");
const router = express.Router();
const db = require("../db");

/*
 ADD NEW BUS - FIXED
*/
router.post("/add", (req, res) => {
  const {
    name,
    number,
    capacity,
    driver,
    status,
    ownerId
  } = req.body;

  const busSQL = `
    INSERT INTO buses (name, number, capacity, driver, status, owner)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    busSQL,
    [name, number, capacity, driver || null, status, ownerId],
    (err, result) => {
      if (err) {
        console.error("Bus insert error:", err);
        return res.status(500).json({ error: "Bus insert failed" });
      }

      const busId = result.insertId;
      
      res.json({ 
        success: true,
        message: "Bus added successfully ✅",
        id: busId,
        busId: busId
      });
    }
  );
});

// UPDATE BUS - FIXED
router.put("/:busId", (req, res) => {
  const { busId } = req.params;
  const {
    name,
    number,
    capacity,
    driver,
    status,
    ownerId
  } = req.body;

  const sql = `
    UPDATE buses 
    SET name = ?, number = ?, capacity = ?, driver = ?, status = ?, owner = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, number, capacity, driver || null, status, ownerId, busId],
    (err) => {
      if (err) {
        console.error("Bus update error:", err);
        return res.status(500).json({ error: "Bus update failed" });
      }
      res.json({ 
        success: true,
        message: "Bus updated successfully" 
      });
    }
  );
});

// GET buses by owner - FIXED to include route_id
router.get("/owner/:ownerId", (req, res) => {
  const ownerId = req.params.ownerId;
  
  const SQL = `
    SELECT 
      b.id,
      b.name,
      b.number,
      b.driver,
      b.status,
      b.capacity,
      r.id as route_id,
      r.route_name,
      r.start_place,
      r.end_place,
      r.start_time,
      r.end_time,
      r.distance,
      r.duration
    FROM buses b
    LEFT JOIN routes r ON b.id = r.bus_id
    WHERE b.owner = ?
  `;
  
  db.query(SQL, [ownerId], (err, results) => {
    if (err) {
      console.error("Get buses error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// SEARCH buses by name or number
router.get("/search", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const SQL = `
    SELECT 
      b.id,
      b.name,
      b.number,
      b.driver,
      b.status,
      b.capacity,
      r.id as route_id,
      r.route_name,
      r.start_place,
      r.end_place,
      r.start_time,
      r.end_time,
      r.distance,
      r.duration
    FROM buses b
    LEFT JOIN routes r ON b.id = r.bus_id
    WHERE b.name LIKE ? OR b.number LIKE ?
  `;

  const wildcard = `%${query}%`;

  db.query(SQL, [wildcard, wildcard], (err, results) => {
    if (err) {
      console.error("Bus search error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

router.get("/driver/:driverName", (req, res) => {
  const SQL = `
    SELECT b.*, r.id as route_id, r.start_place, r.end_place,
           r.start_time, r.end_time, r.distance, r.duration
    FROM buses b
    LEFT JOIN routes r ON b.id = r.bus_id
    WHERE b.driver = ?
    LIMIT 1
  `;
  db.query(SQL, [req.params.driverName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || null);
  });
});

// GET single bus with full details - NEW
router.get("/:busId", (req, res) => {
  const { busId } = req.params;
  
  const busSQL = `
    SELECT 
      b.*,
      r.id as route_id,
      r.route_name,
      r.start_place,
      r.end_place,
      r.start_time,
      r.end_time,
      r.distance,
      r.duration
    FROM buses b
    LEFT JOIN routes r ON b.id = r.bus_id
    WHERE b.id = ?
  `;
  
  db.query(busSQL, [busId], (err, busResult) => {
    if (err) {
      console.error("Get bus error:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (busResult.length === 0) {
      return res.status(404).json({ error: "Bus not found" });
    }
    
    const bus = busResult[0];
    
    // If there's a route, get its stops
    if (bus.route_id) {
      const stopsSQL = `
        SELECT * FROM stops
        WHERE route_id = ?
        ORDER BY stop_order ASC
      `;
      
      db.query(stopsSQL, [bus.route_id], (stopsErr, stops) => {
        if (stopsErr) {
          console.error("Get stops error:", stopsErr);
          return res.json({ bus, route: bus, stops: [] });
        }
        
        res.json({
          id: bus.id,
          bus: {
            id: bus.id,
            name: bus.name,
            number: bus.number,
            driver: bus.driver,
            capacity: bus.capacity,
            status: bus.status
          },
          route: {
            id: bus.route_id,
            route_name: bus.route_name,
            start_place: bus.start_place,
            end_place: bus.end_place,
            start_time: bus.start_time,
            end_time: bus.end_time,
            distance: bus.distance,
            duration: bus.duration
          },
          stops: stops
        });
      });
    } else {
      res.json({
        id: bus.id,
        bus: {
          id: bus.id,
          name: bus.name,
          number: bus.number,
          driver: bus.driver,
          capacity: bus.capacity,
          status: bus.status
        },
        route: null,
        stops: []
      });
    }
  });
});

// UPDATE bus status
router.put("/:busId/status", (req, res) => {
  const { status } = req.body;
  const busId = req.params.busId;
  
  const sql = "UPDATE buses SET status = ? WHERE id = ?";
  
  db.query(sql, [status, busId], (err) => {
    if (err) {
      console.error("Update status error:", err);
      return res.status(500).json({ error: "Update failed" });
    }
    res.json({ success: true, message: "Status updated" });
  });
});

// DELETE BUS
router.delete("/:busId", (req, res) => {
  const { busId } = req.params;

  // First, delete related stops
  const deleteStopsSQL = `
    DELETE FROM stops 
    WHERE route_id IN (SELECT id FROM routes WHERE bus_id = ?)
  `;
  
  db.query(deleteStopsSQL, [busId], (stopsErr) => {
    if (stopsErr) {
      console.error("Delete stops error:", stopsErr);
      return res.status(500).json({ error: "Failed to delete stops" });
    }
    
    // Then delete routes
    const deleteRoutesSQL = "DELETE FROM routes WHERE bus_id = ?";
    
    db.query(deleteRoutesSQL, [busId], (routesErr) => {
      if (routesErr) {
        console.error("Delete routes error:", routesErr);
        return res.status(500).json({ error: "Failed to delete routes" });
      }
      
      // Finally delete the bus
      const deleteBusSQL = "DELETE FROM buses WHERE id = ?";
      
      db.query(deleteBusSQL, [busId], (busErr) => {
        if (busErr) {
          console.error("Delete bus error:", busErr);
          return res.status(500).json({ error: "Delete failed" });
        }
        res.json({ 
          success: true,
          message: "Bus deleted successfully" 
        });
      });
    });
  });
});

module.exports = router;