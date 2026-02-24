import React, { useState, Fragment } from 'react';
import axios from 'axios';
import './Search.css';

const RouteSearch = () => {
    const [fromStop, setFromStop] = useState('');
    const [toStop, setToStop] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [stopsData, setStopsData] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!fromStop.trim() || !toStop.trim()) {
            alert('Please enter both From and To locations');
            return;
        }

        setLoading(true);
        try {
            // Search for routes that contain both stops in order
            const response = await axios.get(
                `http://localhost:3002/api/routes/search?from=${encodeURIComponent(fromStop)}&to=${encodeURIComponent(toStop)}`
            );
            
            console.log('Route search results:', response.data);
            setSearchResults(response.data);
            setExpandedId(null); // Reset expanded state
            setStopsData({}); // Reset stops data
        } catch (error) {
            console.error('Route search error:', error);
            alert('Failed to search routes. Please try again.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStops = async (routeId, busId) => {
        if (!routeId) return;
        
        try {
            const res = await axios.get(
                `http://localhost:3002/api/stops/route/${routeId}`
            );
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

    const toggleExpand = (busId, routeId) => {
        if (expandedId === busId) {
            setExpandedId(null);
        } else {
            setExpandedId(busId);
            if (routeId && !stopsData[busId]) {
                fetchStops(routeId, busId);
            }
        }
    };

    return (
        <div className="section-container">
            <h1>🗺️ Route Search</h1>
            <p className="section-description">
                Find buses traveling between two locations
            </p>

            {/* Search Form */}
            <div className="search-form-card">
                <form onSubmit={handleSearch}>
                    <div className="search-inputs-row">
                        <div className="form-group">
                            <label>From Stop</label>
                            <input
                                type="text"
                                placeholder="Enter starting location (e.g., Kochi)"
                                value={fromStop}
                                onChange={(e) => setFromStop(e.target.value)}
                                required
                            />
                        </div>
                        <div className="arrow-icon">→</div>
                        <div className="form-group">
                            <label>To Stop</label>
                            <input
                                type="text"
                                placeholder="Enter destination (e.g., Bangalore)"
                                value={toStop}
                                onChange={(e) => setToStop(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? '🔍 Searching...' : '🔍 Search Routes'}
                    </button>
                </form>
            </div>

            {/* Search Results */}
            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Searching for routes...</p>
                </div>
            )}

            {!loading && searchResults.length === 0 && (fromStop || toStop) && (
                <div className="no-results">
                    <div className="no-results-icon">🚌</div>
                    <h3>No Routes Found</h3>
                    <p>No buses found traveling from <strong>{fromStop}</strong> to <strong>{toStop}</strong>.</p>
                    <p>Try different locations or check the spelling.</p>
                </div>
            )}

            {!loading && searchResults.length > 0 && (
                <div className="results-section">
                    <h2>Found {searchResults.length} Route{searchResults.length > 1 ? 's' : ''}</h2>
                    
                    <div className="results-table-container">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Bus Name</th>
                                    <th>Bus Number</th>
                                    <th>Route</th>
                                    <th>Timing</th>
                                    <th>Duration</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((result) => (
                                    <Fragment key={result.bus_id}>
                                        {/* Main Row */}
                                        <tr className="result-row">
                                            <td className="bus-name">{result.bus_name}</td>
                                            <td className="bus-number">{result.bus_number}</td>
                                            <td className="route-name">
                                                {result.start_place} → {result.end_place}
                                            </td>
                                            <td>{result.start_time} - {result.end_time}</td>
                                            <td>{result.duration}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="expand-btn"
                                                    onClick={() => toggleExpand(result.bus_id, result.route_id)}
                                                >
                                                    {expandedId === result.bus_id ? '▲' : '▼'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Row */}
                                        {expandedId === result.bus_id && (
                                            <tr className="expanded-row">
                                                <td colSpan={6}>
                                                    <div className="expanded-content">
                                                        <div className="details-grid">
                                                            <div className="detail-item">
                                                                <strong>Capacity:</strong>
                                                                <span>{result.capacity} seats</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Driver:</strong>
                                                                <span>{result.driver || 'Not assigned'}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Distance:</strong>
                                                                <span>{result.distance} km</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Status:</strong>
                                                                <span className={`status-badge ${result.status?.toLowerCase()}`}>
                                                                    {result.status}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Stops Timeline */}
                                                        <div className="stops-timeline-section">
                                                            <h4 className="stops-title">📍 All Stops</h4>
                                                            {stopsData[result.bus_id] === undefined ? (
                                                                <div className="stops-loading">Loading stops...</div>
                                                            ) : stopsData[result.bus_id]?.length > 0 ? (
                                                                <div className="stops-timeline">
                                                                    {stopsData[result.bus_id].map((stop, index) => (
                                                                        <div key={stop.id} className="timeline-stop">
                                                                            <div className="timeline-marker">
                                                                                <div className="stop-dot">{index + 1}</div>
                                                                                {index < stopsData[result.bus_id].length - 1 && (
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
                                                                    <p>No intermediate stops available</p>
                                                                </div>
                                                            )}
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
                </div>
            )}
        </div>
    );
};

export default RouteSearch;