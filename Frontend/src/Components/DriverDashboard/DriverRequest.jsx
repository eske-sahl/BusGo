import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DriverRequests = ({ ownerId }) => {
    const [requests, setRequests] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buses, setBuses] = useState([]);
    const [assigning, setAssigning] = useState({});
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    // ✅ FIX 1: Fetch pending requests filtered by ownerId
    // Previously used /api/driver-requests/pending (no filter) — owner A saw ALL pending
    // requests from every driver in the system, including requests meant for other owners.
    const fetchRequests = () => {
        setLoading(true);
        axios.get(`http://localhost:3002/api/driver-requests/pending/${ownerId}`)
            .then(res => { setRequests(res.data || []); setLoading(false); })
            .catch(() => { setRequests([]); setLoading(false); });
    };

    const fetchAcceptedDrivers = () => {
        axios.get(`http://localhost:3002/api/driver-requests/accepted/${ownerId}`)
            .then(res => setDrivers(res.data || []))
            .catch(() => setDrivers([]));
    };

    const fetchBuses = () => {
        axios.get(`http://localhost:3002/api/bus/owner/${ownerId}`)
            .then(res => setBuses(res.data || []))
            .catch(() => setBuses([]));
    };

    // ✅ FIX 2: Removed duplicate axios call — previously useEffect called
    // axios.get('/pending') directly AND fetchRequests() also called it,
    // resulting in two identical API calls on every mount.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRequests();
        fetchBuses();
        fetchAcceptedDrivers();
    }, [ownerId]);

    const handleAccept = async (request, busId) => {
        if (!busId) { setMessage('❌ Please select a bus to assign.'); return; }
        setMessage('');
        const selectedBus = buses.find(b => b.id === parseInt(busId));
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${request.id}/accept`, {
                owner_id: ownerId,
                bus_id: busId
            });
            await axios.put(`http://localhost:3002/api/bus/${busId}`, {
                name: selectedBus?.name,
                number: selectedBus?.number,
                capacity: selectedBus?.capacity,
                driver: request.driver_name,
                status: selectedBus?.status,
                ownerId: ownerId
            });
            setMessage(`✅ ${request.driver_name} accepted and assigned to bus!`);
            fetchRequests();
            fetchAcceptedDrivers();
            fetchBuses();
        } catch (err) {
            setMessage('❌ Failed to accept request. Try again.');
            console.error(err);
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Reject this driver request?')) return;
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${requestId}/reject`);
            setMessage('Request rejected.');
            fetchRequests();
        } catch {
            setMessage('❌ Failed to reject. Try again.');
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');

    return (
        <div className="section-container">
            <h1>👨‍✈️ Driver Management</h1>

            {message && (
                <div className={`form-message ${message.startsWith('✅') ? 'success' : message.startsWith('❌') ? 'error' : 'info'}`}
                    style={{
                        marginBottom: '1rem', padding: '0.8rem 1rem', borderRadius: '8px',
                        background: message.startsWith('✅') ? '#d1fae5' : message.startsWith('❌') ? '#fee2e2' : '#e0f2fe',
                        color: message.startsWith('✅') ? '#065f46' : message.startsWith('❌') ? '#991b1b' : '#0369a1'
                    }}>
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div className="driver-tabs">
                <button className={`driver-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}>
                    ⏳ Pending Requests
                    {pendingRequests.length > 0 && (
                        <span className="tab-badge">{pendingRequests.length}</span>
                    )}
                </button>
                <button className={`driver-tab ${activeTab === 'accepted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accepted')}>
                    ✅ My Drivers ({drivers.length})
                </button>
            </div>

            {/* PENDING REQUESTS */}
            {activeTab === 'pending' && (
                <>
                    {loading ? <p>Loading requests...</p> : pendingRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B5D52' }}>
                            <div style={{ fontSize: '3rem' }}>📭</div>
                            <h3>No Pending Requests</h3>
                            <p>No drivers have sent employment requests yet.</p>
                        </div>
                    ) : (
                        <div className="requests-list">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="request-card">
                                    <div className="request-header">
                                        <div className="request-driver-info">
                                            <span className="request-avatar">🧑‍✈️</span>
                                            <div>
                                                <h3>{req.driver_name}</h3>
                                                <p>{req.email}</p>
                                            </div>
                                        </div>
                                        <span className="status-badge pending-badge">⏳ Pending</span>
                                    </div>
                                    <div className="request-details-grid">
                                        <div className="req-detail">
                                            <strong>📋 License</strong>
                                            <span>{req.license_number}</span>
                                        </div>
                                        <div className="req-detail">
                                            <strong>📱 Mobile</strong>
                                            <span>{req.mobile}</span>
                                        </div>
                                        <div className="req-detail">
                                            <strong>🚌 Experience</strong>
                                            <span>{req.experience_years ? `${req.experience_years} years` : '—'}</span>
                                        </div>
                                        <div className="req-detail">
                                            <strong>🚐 Vehicles</strong>
                                            <span>{req.vehicle_types || '—'}</span>
                                        </div>
                                        <div className="req-detail">
                                            <strong>📍 Address</strong>
                                            <span>{req.address || '—'}</span>
                                        </div>
                                        <div className="req-detail">
                                            <strong>🆘 Emergency</strong>
                                            <span>{req.emergency_contact || '—'}</span>
                                        </div>
                                        {req.notes && (
                                            <div className="req-detail full-span">
                                                <strong>📝 Notes</strong>
                                                <span>{req.notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assign Bus + Actions */}
                                    <div className="request-actions">
                                        <select
                                            className="assign-bus-select"
                                            value={assigning[req.id] || ''}
                                            onChange={e => setAssigning(prev => ({ ...prev, [req.id]: e.target.value }))}>
                                            <option value="">-- Select Bus to Assign --</option>
                                            {/* ✅ Only show buses with no driver assigned */}
                                            {buses.filter(b => !b.driver || b.driver.trim() === '').map(bus => (
                                                <option key={bus.id} value={bus.id}>
                                                    {bus.name} ({bus.number})
                                                </option>
                                            ))}
                                        </select>
                                        <button className="accept-btn"
                                            onClick={() => handleAccept(req, assigning[req.id])}>
                                            ✅ Accept & Assign
                                        </button>
                                        <button className="reject-btn"
                                            onClick={() => handleReject(req.id)}>
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ACCEPTED / MY DRIVERS */}
            {activeTab === 'accepted' && (
                <>
                    {drivers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B5D52' }}>
                            <div style={{ fontSize: '3rem' }}>👥</div>
                            <h3>No Drivers Yet</h3>
                            <p>Accept driver requests to assign them to your buses.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Driver Name</th>
                                        <th>Mobile</th>
                                        <th>License</th>
                                        <th>Assigned Bus</th>
                                        <th>Today's Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map(d => (
                                        <tr key={d.id}>
                                            <td><strong>🧑‍✈️ {d.driver_name}</strong></td>
                                            <td>{d.mobile}</td>
                                            <td>{d.license_number}</td>
                                            <td>{d.bus_name ? `${d.bus_name} (${d.bus_number})` : '—'}</td>
                                            <td>{d.today_earnings
                                                ? `₹${parseFloat(d.today_earnings).toLocaleString()}`
                                                : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DriverRequests;