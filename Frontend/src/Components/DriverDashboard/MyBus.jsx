import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyBus = ({ user, assignedBus, loadingBus }) => {
    const [stops, setStops] = useState([]);
    const [currentStopIdx, setCurrentStopIdx] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null);
    const [loadingRequest, setLoadingRequest] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Owner search
    const [ownerQuery, setOwnerQuery] = useState('');
    const [ownerResults, setOwnerResults] = useState([]);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [searching, setSearching] = useState(false);

    const [form, setForm] = useState({
        license_number: '',
        mobile: '',
        experience_years: '',
        vehicle_types: '',
        address: '',
        emergency_contact: '',
        notes: ''
    });

    useEffect(() => {
        axios.get(`http://localhost:3002/api/driver-requests/driver/${user.id}`)
            .then(res => { setRequestStatus(res.data?.status || null); setLoadingRequest(false); })
            .catch(() => setLoadingRequest(false));
    }, [user.id]);

    useEffect(() => {
        if (assignedBus?.route_id) {
            axios.get(`http://localhost:3002/api/stops/route/${assignedBus.route_id}`)
                .then(res => setStops(res.data || []))
                .catch(() => setStops([]));
        }
    }, [assignedBus]);

    const handleOwnerSearch = () => {
        if (!ownerQuery.trim()) return;
        setSearching(true);
        axios.get(`http://localhost:3002/api/owners/search?query=${encodeURIComponent(ownerQuery)}`)
            .then(res => { setOwnerResults(res.data || []); setSearching(false); })
            .catch(() => { setOwnerResults([]); setSearching(false); });
    };

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!form.license_number || !form.mobile) {
            setMessage('❌ License number and mobile are required.'); return;
        }
        if (!selectedOwner) {
            setMessage('❌ Please search and select a bus owner to send the request to.'); return;
        }
        setSubmitting(true); setMessage('');
        try {
            await axios.post('http://localhost:3002/api/driver-requests/add', {
                driver_id: user.id,
                driver_name: user.fullname,
                email: user.email,
                owner_id: selectedOwner.id,
                ...form
            });
            setMessage(`✅ Request sent to ${selectedOwner.fullname}! You'll be notified once accepted.`);
            setRequestStatus('pending');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to submit request.';
            setMessage(`❌ ${msg}`);
        } finally { setSubmitting(false); }
    };

    const markStop = (idx) => setCurrentStopIdx(idx);

    // ── LOADING ──────────────────────────────────────────
    if (loadingBus || loadingRequest) return (
        <div className="section-container">
            <div className="driver-loading">
                <div className="loading-spinner-large">🚌</div>
                <p>Loading your bus details...</p>
            </div>
        </div>
    );

    // ── HAS ASSIGNED BUS ─────────────────────────────────
    if (assignedBus) return (
        <div className="section-container">
            <h1>🚌 My Bus</h1>

            <div className="driver-bus-hero">
                <div className="bus-hero-left">
                    <div className="bus-hero-icon">🚌</div>
                    <div>
                        <h2>{assignedBus.name}</h2>
                        <p className="bus-hero-number">{assignedBus.number}</p>
                        <span className={`status-badge ${assignedBus.status?.toLowerCase()}`}>{assignedBus.status}</span>
                    </div>
                </div>
                <div className="bus-hero-stats">
                    <div className="bus-hero-stat">
                        <span className="bhs-icon">💺</span>
                        <strong>{assignedBus.capacity}</strong><small>Seats</small>
                    </div>
                    <div className="bus-hero-stat">
                        <span className="bhs-icon">📏</span>
                        <strong>{assignedBus.distance || '—'}</strong><small>km</small>
                    </div>
                    <div className="bus-hero-stat">
                        <span className="bhs-icon">⏱️</span>
                        <strong>{assignedBus.duration || '—'}</strong><small>Duration</small>
                    </div>
                </div>
            </div>

            <div className="route-info">
                <h3>🗺️ Route Details</h3>
                <div className="route-details">
                    <p>📍 <strong>From:</strong> {assignedBus.start_place || '—'}</p>
                    <p>🏁 <strong>To:</strong> {assignedBus.end_place || '—'}</p>
                    <p>🕐 <strong>Timing:</strong> {assignedBus.start_time || '—'} → {assignedBus.end_time || '—'}</p>
                </div>
            </div>

            <div className="route-stops-section">
                <h3>📍 Stops — Mark Current Location</h3>
                {stops.length === 0 ? (
                    <p className="no-stops-msg">No stops added for this route yet.</p>
                ) : (
                    <div className="driver-stops-list">
                        {stops.map((stop, idx) => (
                            <div key={stop.id} className={`driver-stop-item 
                                ${idx === currentStopIdx ? 'current-stop' : ''}
                                ${currentStopIdx !== null && idx < currentStopIdx ? 'passed-stop' : ''}
                                ${currentStopIdx !== null && idx === currentStopIdx + 1 ? 'next-stop' : ''}`}>
                                <div className="stop-marker">
                                    <div className="stop-dot-num">{stop.stop_order}</div>
                                    {idx < stops.length - 1 && <div className="stop-connector" />}
                                </div>
                                <div className="stop-details">
                                    <div className="stop-name-row">
                                        <span className="stop-name">{stop.stop_name}</span>
                                        {idx === currentStopIdx && <span className="here-badge">📍 HERE</span>}
                                        {currentStopIdx !== null && idx === currentStopIdx + 1 && <span className="next-badge">⏭️ NEXT</span>}
                                    </div>
                                    <span className="stop-time">⏰ {stop.arrival_time}</span>
                                </div>
                                <button className={`mark-stop-btn ${idx === currentStopIdx ? 'marked' : ''}`} onClick={() => markStop(idx)}>
                                    {idx === currentStopIdx ? '✅ Current' : 'Mark Here'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // ── PENDING REQUEST ──────────────────────────────────
    if (requestStatus === 'pending') return (
        <div className="section-container">
            <h1>🚌 My Bus</h1>
            <div className="request-status-card pending">
                <div className="rs-icon">⏳</div>
                <h2>Request Pending</h2>
                <p>Your employment request has been sent. Please wait while the owner reviews it.</p>
                <p className="rs-note">You will be assigned a bus once the owner accepts your request.</p>
            </div>
        </div>
    );

    if (requestStatus === 'rejected') return (
        <div className="section-container">
            <h1>🚌 My Bus</h1>
            <div className="request-status-card rejected">
                <div className="rs-icon">❌</div>
                <h2>Request Not Accepted</h2>
                <p>Your request was not accepted. You can send a new request below.</p>
            </div>
            <RequestForm
                form={form} handleChange={handleChange} handleSubmit={handleRequestSubmit}
                submitting={submitting} message={message}
                ownerQuery={ownerQuery} setOwnerQuery={setOwnerQuery}
                ownerResults={ownerResults} setOwnerResults={setOwnerResults}
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner} handleOwnerSearch={handleOwnerSearch}
                searching={searching}
            />
        </div>
    );

    // ── NO BUS → Show Form ───────────────────────────────
    return (
        <div className="section-container">
            <h1>🚌 My Bus</h1>
            <div className="no-bus-banner">
                <div className="no-bus-icon">🚌</div>
                <h2>No Bus Assigned Yet</h2>
                <p>You are not currently assigned to any bus. Fill the form below to send an employment request to a bus owner.</p>
            </div>
            <RequestForm
                form={form} handleChange={handleChange} handleSubmit={handleRequestSubmit}
                submitting={submitting} message={message}
                ownerQuery={ownerQuery} setOwnerQuery={setOwnerQuery}
                ownerResults={ownerResults} setOwnerResults={setOwnerResults}
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner} handleOwnerSearch={handleOwnerSearch}
                searching={searching}
            />
        </div>
    );
};

/* ─── REQUEST FORM ──────────────────────────────────── */
const RequestForm = ({
    form, handleChange, handleSubmit, submitting, message,
    ownerQuery, setOwnerQuery, ownerResults, setOwnerResults, selectedOwner,
    setSelectedOwner, handleOwnerSearch, searching
}) => (
    <div className="driver-request-form">
        <h3>📋 Driver Employment Request</h3>
        <p className="form-subtitle">Search for a bus owner and fill in your details to send a request.</p>

        {message && (
            <div className={`form-message-box ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</div>
        )}

        {/* Owner Search */}
        <div className="owner-search-section">
            <h4>🔍 Find Bus Owner</h4>
            <div className="owner-search-row">
                <input
                    type="text"
                    placeholder="Search by owner name or company name..."
                    value={ownerQuery}
                    onChange={e => setOwnerQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleOwnerSearch()}
                    className="owner-search-input"
                />
                <button type="button" className="owner-search-btn" onClick={handleOwnerSearch} disabled={searching}>
                    {searching ? '🔍 Searching...' : '🔍 Search'}
                </button>
            </div>

            {/* Search Results */}
            {ownerResults.length > 0 && !selectedOwner && (
                <div className="owner-results-list">
                    {ownerResults.map(owner => (
                        <div key={owner.id} className="owner-result-item" onClick={() => { setSelectedOwner(owner); setOwnerQuery(''); }}>
                            <span className="owner-result-icon">🏢</span>
                            <div>
                                <strong>{owner.fullname}</strong>
                                <p>{owner.designation || 'Bus Owner'} · {owner.place || ''}</p>
                            </div>
                            <button className="select-owner-btn">Select →</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Owner */}
            {selectedOwner && (
                <div className="selected-owner-card">
                    <span className="owner-result-icon">✅</span>
                    <div>
                        <strong>Sending to: {selectedOwner.fullname}</strong>
                        <p>{selectedOwner.place || ''}</p>
                    </div>
                    <button type="button" className="change-owner-btn" onClick={() => { setSelectedOwner(null); setOwnerResults([]); }}>
                        ✕ Change
                    </button>
                </div>
            )}

            {ownerResults.length === 0 && ownerQuery && !searching && (
                <p className="no-owner-found">No owners found. Try a different name.</p>
            )}
        </div>

        {/* Driver Details Form */}
        <form onSubmit={handleSubmit}>
            <div className="request-form-grid">
                <div className="form-group">
                    <label>Driving License Number *</label>
                    <input name="license_number" value={form.license_number} onChange={handleChange}
                        placeholder="e.g. KL0720230001" required />
                </div>
                <div className="form-group">
                    <label>Mobile Number *</label>
                    <input name="mobile" type="tel" value={form.mobile} onChange={handleChange}
                        placeholder="e.g. +91 9876543210" required />
                </div>
                <div className="form-group">
                    <label>Years of Experience</label>
                    <input name="experience_years" type="number" value={form.experience_years}
                        onChange={handleChange} placeholder="e.g. 5" min="0" />
                </div>
                <div className="form-group">
                    <label>Vehicle Types You Can Drive</label>
                    <input name="vehicle_types" value={form.vehicle_types} onChange={handleChange}
                        placeholder="e.g. Heavy Bus, Mini Bus, AC Sleeper" />
                </div>
                <div className="form-group">
                    <label>Emergency Contact Number</label>
                    <input name="emergency_contact" value={form.emergency_contact} onChange={handleChange}
                        placeholder="Emergency contact phone" />
                </div>
                <div className="form-group">
                    <label>Current Address</label>
                    <input name="address" value={form.address} onChange={handleChange}
                        placeholder="Your current address" />
                </div>
                <div className="form-group full-width">
                    <label>Additional Notes for Owner</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                        placeholder="Preferred routes, availability, other info..." />
                </div>
            </div>
            <button type="submit" className="submit-request-btn" disabled={submitting}>
                {submitting ? '📤 Sending Request...' : '📤 Send Employment Request'}
            </button>
        </form>
    </div>
);

export default MyBus;