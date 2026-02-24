import React, { useState, Fragment } from 'react';
import axios from 'axios';
import './Search.css';

const BusSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [stopsData, setStopsData] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            alert('Please enter a bus name or number');
            return;
        }

        setLoading(true);
        try {
            // Search for buses by name or number
            const response = await axios.get(
                `http://localhost:3002/api/bus/search?query=${encodeURIComponent(searchQuery)}`
            );
            
            console.log('Bus search results:', response.data);
            setSearchResults(response.data);
            setExpandedId(null); // Reset expanded state
            setStopsData({}); // Reset stops data
        } catch (error) {
            console.error('Bus search error:', error);
            alert('Failed to search buses. Please try again.');
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
            <h1>🔍 Bus Search</h1>
            <p className="section-description">
                Search for a specific bus by name or number
            </p>

            {/* Search Form */}
            <div className="search-form-card">
                <form onSubmit={handleSearch}>
                    <div className="form-group">
                        <label>Bus Name or Number</label>
                        <input
                            type="text"
                            placeholder="Enter bus name (e.g., Eske Buses) or number (e.g., KL-07-A-1234)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            required
                        />
                        <br />
                    </div>
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? '🔍 Searching...' : '🔍 Search Bus'}
                    </button>
                </form>
            </div>

            {/* Search Results */}
            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Searching for buses...</p>
                </div>
            )}

            {!loading && searchResults.length === 0 && searchQuery && (
                <div className="no-results">
                    <div className="no-results-icon">🚌</div>
                    <h3>No Buses Found</h3>
                    <p>No buses found matching "<strong>{searchQuery}</strong>".</p>
                    <p>Try searching with a different name or number.</p>
                </div>
            )}

            {!loading && searchResults.length > 0 && (
                <div className="results-section">
                    <h2>Found {searchResults.length} Bus{searchResults.length > 1 ? 'es' : ''}</h2>
                    
                    <div className="results-table-container">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Bus Name</th>
                                    <th>Bus Number</th>
                                    <th>Driver</th>
                                    <th>Route</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((bus) => (
                                    <Fragment key={bus.id}>
                                        {/* Main Row */}
                                        <tr className="result-row">
                                            <td className="bus-name">{bus.name}</td>
                                            <td className="bus-number">{bus.number}</td>
                                            <td>{bus.driver || '—'}</td>
                                            <td className="route-name">
                                                {bus.route_name ? (
                                                    `${bus.start_place} → ${bus.end_place}`
                                                ) : (
                                                    <span className="no-route">No route</span>
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
                                                    onClick={() => toggleExpand(bus.id, bus.route_id)}
                                                >
                                                    {expandedId === bus.id ? '▲' : '▼'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Row */}
                                        {expandedId === bus.id && (
                                            <tr className="expanded-row">
                                                <td colSpan={6}>
                                                    <div className="expanded-content">
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
                                                                        <p>No stops added for this route yet</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
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

export default BusSearch;