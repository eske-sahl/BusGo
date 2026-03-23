import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyBus = ({ user, assignedBus, loadingBus, onBusAssigned }) => {
    const [stops, setStops] = useState([]);
    const [currentStopIdx, setCurrentStopIdx] = useState(null);
    const [invites, setInvites] = useState([]);
    const [loadingInvites, setLoadingInvites] = useState(true);
    const [responding, setResponding] = useState(null);
    // const [marking, setMarking] = useState(false);

    // Stop editing state
    const [showStopForm, setShowStopForm] = useState(false);
    const [newStop, setNewStop] = useState({ stop_name: '', arrival_time: '', stop_order: '' });
    const [savingStop, setSavingStop] = useState(false);
    const [stopMsg, setStopMsg] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:3002/api/driver-requests/invites/${user.id}`)
            .then(res => { setInvites(res.data || []); setLoadingInvites(false); })
            .catch(() => setLoadingInvites(false));
    }, [user.id]);

    useEffect(() => {
        if (assignedBus?.route_id) {
            fetchStops();
            fetchCurrentStop();
        }
    }, [assignedBus]);

    const fetchStops = () => {
        axios.get(`http://localhost:3002/api/stops/route/${assignedBus.route_id}`)
            .then(res => setStops(res.data || []))
            .catch(() => setStops([]));
    };

    const fetchCurrentStop = () => {
        axios.get(`http://localhost:3002/api/bus/${assignedBus.id}/current-stop`)
            .then(res => {
                if (res.data?.current_stop_id) {
                    const order = res.data.current_stop_order;
                    setCurrentStopIdx(order != null ? order - 1 : null);
                }
            })
            .catch(() => {});
    };

    // ── ADD STOP ─────────────────────────────────────────
    const handleAddStop = async (e) => {
        e.preventDefault();
        if (!newStop.stop_name) { setStopMsg('❌ Stop name is required.'); return; }
        setSavingStop(true); setStopMsg('');
        try {
            await axios.post('http://localhost:3002/api/stops/add', {
                route_id: assignedBus.route_id,
                stop_name: newStop.stop_name,
                arrival_time: newStop.arrival_time,
                stop_order: newStop.stop_order || stops.length + 1
            });
            setStopMsg('✅ Stop added!');
            setNewStop({ stop_name: '', arrival_time: '', stop_order: '' });
            fetchStops();
            setTimeout(() => setStopMsg(''), 2000);
        } catch { setStopMsg('❌ Failed to add stop.'); }
        finally { setSavingStop(false); }
    };

    // ── DELETE STOP ──────────────────────────────────────
    const handleDeleteStop = async (stopId) => {
        if (!window.confirm('Remove this stop?')) return;
        try {
            await axios.delete(`http://localhost:3002/api/stops/${stopId}`);
            fetchStops();
        } catch { alert('Failed to remove stop.'); }
    };

    // ── INVITE HANDLERS ──────────────────────────────────
    const handleAcceptInvite = async (invite) => {
        setResponding(invite.id);
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${invite.id}/accept-invite`);
            setInvites([]);
            if (onBusAssigned) onBusAssigned();
        } catch { alert('Failed to accept. Please try again.'); }
        finally { setResponding(null); }
    };

    const handleDeclineInvite = async (invite) => {
        if (!window.confirm('Decline this invitation?')) return;
        setResponding(invite.id);
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${invite.id}/decline-invite`);
            setInvites(prev => prev.filter(i => i.id !== invite.id));
        } catch { alert('Failed to decline. Please try again.'); }
        finally { setResponding(null); }
    };

    // ── LOADING ──────────────────────────────────────────
    if (loadingBus || loadingInvites) return (
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
                        <h2 className="bus-hero-name">{assignedBus.name}</h2>
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

            {/* Stops Section */}
            <div className="route-stops-section">
                <div className="stops-section-header">
                    <h3>📍 Stops</h3>
                    <button className="add-stop-inline-btn" onClick={() => setShowStopForm(!showStopForm)}>
                        {showStopForm ? '✕ Cancel' : '➕ Add Stop'}
                    </button>
                </div>

                {/* Add Stop Form */}
                {showStopForm && (
                    <div className="add-stop-form">
                        {stopMsg && <div className={`form-message-box ${stopMsg.startsWith('✅') ? 'success' : 'error'}`}>{stopMsg}</div>}
                        <form onSubmit={handleAddStop}>
                            <div className="stop-form-row">
                                <div className="form-group">
                                    <label>Stop Name *</label>
                                    <input value={newStop.stop_name}
                                        onChange={e => setNewStop(p => ({...p, stop_name: e.target.value}))}
                                        placeholder="e.g. Kozhikode Town" required />
                                </div>
                                <div className="form-group">
                                    <label>Arrival Time</label>
                                    <input type="time" value={newStop.arrival_time}
                                        onChange={e => setNewStop(p => ({...p, arrival_time: e.target.value}))} />
                                </div>
                                <div className="form-group">
                                    <label>Order</label>
                                    <input type="number" value={newStop.stop_order} min="1"
                                        onChange={e => setNewStop(p => ({...p, stop_order: e.target.value}))}
                                        placeholder={stops.length + 1} />
                                </div>
                            </div>
                            <button type="submit" className="submit-request-btn" disabled={savingStop}>
                                {savingStop ? '⏳ Saving...' : '💾 Save Stop'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Stops List */}
                {stops.length === 0 ? (
                    <p className="no-stops-msg">No stops added yet. Use the button above to add stops.</p>
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
                                    <span className="stop-time">⏰ {stop.arrival_time || '—'}</span>
                                </div>
                                <div className="stop-actions-row">
                                    {/* <button
                                        className={`mark-stop-btn ${idx === currentStopIdx ? 'marked' : ''}`}
                                        onClick={() => handleMarkStop(idx)}
                                        disabled={marking}>
                                        {idx === currentStopIdx ? '✅ Current' : 'Mark Here'}
                                    </button> */}
                                    <button className="stop-delete-btn" onClick={() => handleDeleteStop(stop.id)} title="Remove stop">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // ── HAS PENDING INVITES ──────────────────────────────
    if (invites.length > 0) return (
        <div className="section-container">
            <h1>🚌 My Bus</h1>
            <div className="invites-header">
                <div className="invites-icon">📨</div>
                <h2>You have {invites.length} invitation{invites.length > 1 ? 's' : ''}!</h2>
                <p>A bus owner wants to hire you. Review the details and accept or decline.</p>
            </div>
            <div className="invites-list">
                {invites.map(invite => (
                    <div key={invite.id} className="invite-card">
                        <div className="invite-card-header">
                            <span className="invite-owner-icon">🏢</span>
                            <div className="invite-owner-info">
                                <h3>{invite.owner_name}</h3>
                                <p>{invite.owner_place || 'Bus Owner'}</p>
                            </div>
                            <span className="invite-badge">📨 Invite</span>
                        </div>
                        <div className="invite-bus-details">
                            <div className="invite-detail-row">
                                <span className="idr-icon">🚌</span>
                                <div><strong>{invite.bus_name}</strong><small>{invite.bus_number}</small></div>
                            </div>
                            {invite.start_place && (
                                <div className="invite-detail-row">
                                    <span className="idr-icon">🗺️</span>
                                    <div><strong>{invite.start_place} → {invite.end_place}</strong><small>{invite.start_time} – {invite.end_time}</small></div>
                                </div>
                            )}
                            <div className="invite-detail-row">
                                <span className="idr-icon">💺</span>
                                <div><strong>{invite.capacity} seats</strong><small>{invite.distance ? `${invite.distance} km` : ''}</small></div>
                            </div>
                        </div>
                        {invite.notes && <div className="invite-notes">📝 {invite.notes}</div>}
                        <div className="invite-actions">
                            <button className="accept-invite-btn" disabled={responding === invite.id}
                                onClick={() => handleAcceptInvite(invite)}>
                                {responding === invite.id ? '⏳ Processing...' : '✅ Accept & Join'}
                            </button>
                            <button className="decline-invite-btn" disabled={responding === invite.id}
                                onClick={() => handleDeclineInvite(invite)}>❌ Decline</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ── NO BUS, NO INVITE ────────────────────────────────
    return (
        <div className="section-container">
            <h1>🚌 My Bus</h1>
            <div className="no-bus-banner">
                <div className="no-bus-icon">🚌</div>
                <h2>No Bus Assigned Yet</h2>
                <p>You haven't been assigned to a bus. A bus owner will send you an invitation using your driving license number.</p>
                <div className="no-bus-hint">
                    <strong>💡 Make sure your driving license number is saved in your profile</strong>
                    <p>Owners search for drivers using the license number. Keep it updated.</p>
                </div>
            </div>
        </div>
    );
};

export default MyBus;