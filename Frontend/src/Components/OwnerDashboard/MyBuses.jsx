import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import BusForm from "./BusForm";
import './MyBuses.css';

const MyBuses = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [buses, setBuses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stopsData, setStopsData] = useState({}); // Store stops for each bus

  const fetchBuses = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3002/api/bus/owner/${user.id}`
      );
      console.log("Fetched buses:", res.data);
      setBuses(res.data);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
      alert("Failed to load buses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stops when a bus is expanded
  const fetchStops = async (routeId, busId) => {
    if (!routeId) return;
    
    try {
      const res = await axios.get(
        `http://localhost:3002/api/stops/route/${routeId}`
      );
      console.log("Fetched stops for route", routeId, ":", res.data);
      setStopsData(prev => ({
        ...prev,
        [busId]: res.data
      }));
    } catch (err) {
      console.error("Failed to fetch stops:", err);
      setStopsData(prev => ({
        ...prev,
        [busId]: []
      }));
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [user?.id]);

  const openAdd = () => {
    setSelectedBus(null);
    setShowForm(true);
  };

  const openEdit = async (busId) => {
    try {
      const res = await axios.get(`http://localhost:3002/api/bus/${busId}`);
      console.log("Bus details for edit:", res.data);
      setSelectedBus(res.data);
      setShowForm(true);
    } catch (err) {
      console.error("Failed to fetch bus details:", err);
      alert("Failed to load bus details");
    }
  };

  const toggleMore = (id, routeId) => {
    if (expandedId === id) {
      // Collapse
      setExpandedId(null);
    } else {
      // Expand and fetch stops
      setExpandedId(id);
      if (routeId && !stopsData[id]) {
        fetchStops(routeId, id);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedBus(null);
    fetchBuses();
  };

  if (loading) {
    return (
      <div className="section-container">
        <h1>My Buses</h1>
        <p>Loading buses...</p>
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-header">
        <h1>🚌 My Buses</h1>
        <button className="add-btn" onClick={openAdd}>
          ➕ Add New Bus
        </button>
      </div>

      {buses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚌</div>
          <h3>No Buses Yet</h3>
          <p>You haven't added any buses yet. Click the button above to add your first bus.</p>
        </div>
      ) : (
        <div className="buses-table-container">
          <table className="buses-table">
            <thead>
              <tr>
                <th>Bus Name</th>
                <th>Driver</th>
                <th>Vehicle No</th>
                <th>Route</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {buses.map((bus) => (
                <Fragment key={bus.id}>
                  {/* MAIN ROW */}
                  <tr className="bus-row">
                    <td className="bus-name">{bus.name}</td>
                    <td>{bus.driver || "—"}</td>
                    <td className="bus-number">{bus.number}</td>
                    <td>
                      {bus.route_name ? (
                        <span className="route-name">{bus.route_name}</span>
                      ) : (
                        <span className="no-route">No route assigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${bus.status?.toLowerCase()}`}>
                        {bus.status || 'Active'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="expand-btn"
                        onClick={() => toggleMore(bus.id, bus.route_id)}
                        title={expandedId === bus.id ? "Show less" : "Show more"}
                      >
                        {expandedId === bus.id ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED DETAILS */}
                  {expandedId === bus.id && (
                    <tr className="expanded-row">
                      <td colSpan={6}>
                        <div className="expanded-content">
                          {/* Bus Details */}
                          <div className="details-grid">
                            <div className="detail-item">
                              <strong>Capacity:</strong>
                              <span>{bus.capacity} seats</span>
                            </div>
                            <div className="detail-item">
                              <strong>Status:</strong>
                              <span>{bus.status || 'Active'}</span>
                            </div>
                            {bus.start_place && bus.end_place && (
                              <>
                                <div className="detail-item">
                                  <strong>Route:</strong>
                                  <span>{bus.start_place} → {bus.end_place}</span>
                                </div>
                                <div className="detail-item">
                                  <strong>Distance:</strong>
                                  <span>{bus.distance} km</span>
                                </div>
                                <div className="detail-item">
                                  <strong>Duration:</strong>
                                  <span>{bus.duration}</span>
                                </div>
                                <div className="detail-item">
                                  <strong>Timing:</strong>
                                  <span>{bus.start_time} - {bus.end_time}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Stops Timeline */}
                          {bus.route_id && (
                            <div className="stops-timeline-section">
                              <h4 className="stops-title">📍 Stops Timeline</h4>
                              {stopsData[bus.id] === undefined ? (
                                <div className="stops-loading">Loading stops...</div>
                              ) : stopsData[bus.id]?.length > 0 ? (
                                <div className="stops-timeline">
                                  {stopsData[bus.id].map((stop, index) => (
                                    <div key={stop.id} className="timeline-stop">
                                      <div className="timeline-marker">
                                        <div className="stop-dot">{index + 1}</div>
                                        {index < stopsData[bus.id].length - 1 && (
                                          <div className="stop-line"></div>
                                        )}
                                      </div>
                                      <div className="timeline-content">
                                        <div className="stop-name">{stop.stop_name}</div>
                                        <div className="stop-time">⏰ {stop.arrival_time}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="no-stops-message">
                                  <p>No stops added for this route yet.</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="expanded-actions">
                            <button 
                              className="edit-btn" 
                              onClick={() => openEdit(bus.id)}
                            >
                              ✏️ Edit Bus & Route
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bus Form Modal */}
      {showForm && (
        <BusForm
          bus={selectedBus}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default MyBuses;