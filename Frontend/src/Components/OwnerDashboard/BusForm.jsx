import { useState } from "react";
import axios from "axios";
import './BusForm.css';

const BusForm = ({ bus = null, onClose }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [busData, setBusData] = useState(
    bus?.bus || {
      name: "",
      number: "",
      driver: "",
      capacity: "",
      status: "active",
    }
  );

  const [routeData, setRouteData] = useState(
    bus?.route || {
      route_name: "",
      start_place: "",
      end_place: "",
      start_time: "",
      end_time: "",
      distance: "",
      duration: "",
    }
  );

  const [stops, setStops] = useState(bus?.stops || []);

  const addStop = () => {
    setStops([...stops, { stop_name: "", arrival_time: "" }]);
  };

  const removeStop = (index) => {
    const copy = [...stops];
    copy.splice(index, 1);
    setStops(copy);
  };

  const handleSave = async () => {
    try {
      let busId = bus?.id;

      // 1️⃣ CREATE or UPDATE BUS
      if (busId) {
        await axios.put(`http://localhost:3002/api/bus/${busId}`, {
          ...busData,
          ownerId: user.id,
        });
      } else {
        const busRes = await axios.post("http://localhost:3002/api/bus/add", {
          ...busData,
          ownerId: user.id,
        });
        busId = busRes.data.id;
      }

      // 2️⃣ CREATE or UPDATE ROUTE
      const routeRes = await axios.post("http://localhost:3002/api/routes", {
        ...routeData,
        bus_id: busId,
        owner_id: user.id,
      });

      const routeId = routeRes.data.routeId || routeRes.data.id;

      // 3️⃣ CLEAR OLD STOPS (important while editing)
      await axios.delete(`http://localhost:3002/api/stops/route/${routeId}`);

      // 4️⃣ ADD STOPS AGAIN
      for (let i = 0; i < stops.length; i++) {
        await axios.post("http://localhost:3002/api/stops/add", {
          route_id: routeId,
          stop_name: stops[i].stop_name,
          arrival_time: stops[i].arrival_time,
          stop_order: i + 1,
        });
      }

      alert("Bus saved successfully ✅");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save bus ❌");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this bus? This action cannot be undone.")) 
      return;
    
    try {
      await axios.delete(`http://localhost:3002/api/bus/${bus.bus.id}`);
      alert("Bus deleted successfully ✅");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete bus ❌");
    }
  };

  const updateStop = (index, field, value) => {
    const copy = [...stops];
    copy[index][field] = value;
    setStops(copy);
  };

  return (
    <div className="bus-form-overlay">
      <div className="bus-form-modal">
        {/* Header */}
        <div className="form-header">
          <h2>{bus ? "✏️ Edit Bus" : "➕ Add New Bus"}</h2>
          <button className="close-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-content">
          {/* Bus Information Section */}
          <section className="form-section">
            <h3 className="section-title">🚌 Bus Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Bus Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Kerala Express 1"
                  value={busData.name}
                  onChange={(e) => setBusData({ ...busData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Number *</label>
                <input
                  type="text"
                  placeholder="e.g., KL-07-A-1234"
                  value={busData.number}
                  onChange={(e) => setBusData({ ...busData, number: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Driver (Optional)</label>
                <input
                  type="text"
                  placeholder="Driver name"
                  value={busData.driver}
                  onChange={(e) => setBusData({ ...busData, driver: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Capacity (Seats) *</label>
                <input
                  type="number"
                  placeholder="e.g., 40"
                  value={busData.capacity}
                  onChange={(e) => setBusData({ ...busData, capacity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={busData.status}
                  onChange={(e) => setBusData({ ...busData, status: e.target.value })}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          {/* Route Information Section */}
          <section className="form-section">
            <h3 className="section-title">🗺️ Route Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Route Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Kochi to Bangalore Express"
                  value={routeData.route_name}
                  onChange={(e) => setRouteData({ ...routeData, route_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Place *</label>
                <input
                  type="text"
                  placeholder="e.g., Kochi"
                  value={routeData.start_place}
                  onChange={(e) => setRouteData({ ...routeData, start_place: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  value={routeData.start_time}
                  onChange={(e) => setRouteData({ ...routeData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Place *</label>
                <input
                  type="text"
                  placeholder="e.g., Bangalore"
                  value={routeData.end_place}
                  onChange={(e) => setRouteData({ ...routeData, end_place: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  value={routeData.end_time}
                  onChange={(e) => setRouteData({ ...routeData, end_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Distance (km) *</label>
                <input
                  type="number"
                  placeholder="e.g., 350"
                  value={routeData.distance}
                  onChange={(e) => setRouteData({ ...routeData, distance: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (hours) *</label>
                <input
                  type="text"
                  placeholder="e.g., 10 hrs"
                  value={routeData.duration}
                  onChange={(e) => setRouteData({ ...routeData, duration: e.target.value })}
                  required
                />
              </div>
            </div>
          </section>

          {/* Stops Section */}
          <section className="form-section">
            <div className="section-header-with-button">
              <h3 className="section-title">📍 Stops Timeline</h3>
              <button type="button" className="add-stop-btn" onClick={addStop}>
                ➕ Add Stop
              </button>
            </div>

            <div className="stops-container">
              {stops.length === 0 ? (
                <div className="no-stops">
                  <p>No stops added yet. Click "Add Stop" to add stops along the route.</p>
                </div>
              ) : (
                stops.map((stop, index) => (
                  <div key={index} className="stop-item">
                    <div className="stop-number">{index + 1}</div>
                    <div className="stop-inputs">
                      <input
                        type="text"
                        placeholder="Stop name (e.g., Thrissur)"
                        value={stop.stop_name}
                        onChange={(e) => updateStop(index, "stop_name", e.target.value)}
                      />
                      <input
                        type="time"
                        value={stop.arrival_time}
                        onChange={(e) => updateStop(index, "arrival_time", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="remove-stop-btn"
                      onClick={() => removeStop(index)}
                      title="Remove stop"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="form-footer">
          <div className="footer-left">
            {bus && (
              <button type="button" className="btn-delete" onClick={handleDelete}>
                🗑️ Delete Bus
              </button>
            )}
          </div>
          <div className="footer-right">
            <button type="button" className="btn-cancel" onClick={onClose}>
              ❌ Cancel
            </button>
            <button type="button" className="btn-save" onClick={handleSave}>
              💾 Save Bus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusForm;