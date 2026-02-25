import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Drivers = ({ ownerId }) => {
    const [activeTab, setActiveTab] = useState('my-drivers');
    const [pendingInvites, setPendingInvites] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    // Add Driver form state
    const [licenseInput, setLicenseInput] = useState('');
    const [foundDriver, setFoundDriver] = useState(null);
    const [lookingUp, setLookingUp] = useState(false);
    const [lookupMsg, setLookupMsg] = useState('');
    const [selectedBusId, setSelectedBusId] = useState('');
    const [inviteNotes, setInviteNotes] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);

    const fetchAll = () => {
        axios.get(`http://localhost:3002/api/driver-requests/owner/${ownerId}`)
            .then(res => {
                const all = res.data || [];
                setPendingInvites(all.filter(r => r.status === 'pending'));
                setDrivers(all.filter(r => r.status === 'accepted'));
                setLoading(false);
            })
            .catch(() => setLoading(false));

        axios.get(`http://localhost:3002/api/bus/owner/${ownerId}`)
            .then(res => setBuses(res.data || []))
            .catch(() => setBuses([]));
    };

    useEffect(() => {
        axios.get(`http://localhost:3002/api/driver-requests/owner/${ownerId}`)
            .then(res => {
                const all = res.data || [];
                setPendingInvites(all.filter(r => r.status === 'pending'));
                setDrivers(all.filter(r => r.status === 'accepted'));
                setLoading(false);
            })
            .catch(() => setLoading(false));

        axios.get(`http://localhost:3002/api/bus/owner/${ownerId}`)
            .then(res => setBuses(res.data || []))
            .catch(() => setBuses([]));
    }, [ownerId]);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    // ── LOOK UP DRIVER BY LICENSE ────────────────────────
    const handleLicenseLookup = () => {
        if (!licenseInput.trim()) return;
        setLookingUp(true);
        setFoundDriver(null);
        setLookupMsg('');
        axios.get(`http://localhost:3002/api/users/by-license/${encodeURIComponent(licenseInput.trim())}`)
            .then(res => {
                if (res.data) { setFoundDriver(res.data); setLookupMsg(''); }
                else setLookupMsg('❌ No driver found with this license number.');
                setLookingUp(false);
            })
            .catch(() => { setLookupMsg('❌ No driver found with this license number.'); setLookingUp(false); });
    };

    // ── SEND INVITE ──────────────────────────────────────
    const handleSendInvite = async () => {
        if (!foundDriver) { showMsg('❌ Please look up a driver first.', 'error'); return; }
        if (!selectedBusId) { showMsg('❌ Please select a bus to assign.', 'error'); return; }
        setSendingInvite(true);
        try {
            await axios.post('http://localhost:3002/api/driver-requests/invite', {
                owner_id: ownerId,
                driver_id: foundDriver.id,
                driver_name: foundDriver.fullname,
                email: foundDriver.email,
                license_number: foundDriver.license_number,
                mobile: foundDriver.phone,
                bus_id: selectedBusId,
                notes: inviteNotes
            });
            showMsg(`✅ Invitation sent to ${foundDriver.fullname}!`);
            // Reset form
            setLicenseInput(''); setFoundDriver(null); setSelectedBusId('');
            setInviteNotes(''); setShowAddForm(false);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to send invite.';
            showMsg(`❌ ${msg}`, 'error');
        } finally { setSendingInvite(false); }
    };

    // ── REMOVE DRIVER ────────────────────────────────────
    const handleRemoveDriver = async (d) => {
        if (!window.confirm(`Remove ${d.driver_name} from your team?`)) return;
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${d.id}/remove`);
            if (d.assigned_bus_id) {
                const bus = buses.find(b => b.id === d.assigned_bus_id);
                await axios.put(`http://localhost:3002/api/bus/${d.assigned_bus_id}`, {
                    name: bus?.name, number: bus?.number, capacity: bus?.capacity,
                    driver: '', status: bus?.status, ownerId
                });
            }
            showMsg(`${d.driver_name} removed.`, 'info');
            fetchAll();
        } catch { showMsg('❌ Failed to remove driver.', 'error'); }
    };

    // ── REASSIGN BUS ─────────────────────────────────────
    const handleReassign = async (d, newBusId) => {
        if (!newBusId) return;
        const bus = buses.find(b => b.id === parseInt(newBusId));
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${d.id}/reassign`, {
                bus_id: newBusId, owner_id: ownerId
            });
            await axios.put(`http://localhost:3002/api/bus/${newBusId}`, {
                name: bus?.name, number: bus?.number, capacity: bus?.capacity,
                driver: d.driver_name, status: bus?.status, ownerId
            });
            showMsg(`✅ ${d.driver_name} reassigned to ${bus?.name}!`);
            fetchAll();
        } catch { showMsg('❌ Reassignment failed.', 'error'); }
    };

    // ── CANCEL PENDING INVITE ────────────────────────────
    const handleCancelInvite = async (id) => {
        if (!window.confirm('Cancel this invitation?')) return;
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${id}/cancel`);
            showMsg('Invitation cancelled.', 'info');
            fetchAll();
        } catch { showMsg('❌ Failed to cancel.', 'error'); }
    };

    const unassignedBuses = buses.filter(b => !b.driver || b.driver.trim() === '');

    return (
        <div className="section-container">
            <div className="section-header">
                <h1>👨‍✈️ Driver Management</h1>
                <button className="add-btn" onClick={() => { setShowAddForm(!showAddForm); setFoundDriver(null); setLicenseInput(''); setLookupMsg(''); }}>
                    {showAddForm ? '✕ Cancel' : '➕ Add New Driver'}
                </button>
            </div>

            {message.text && (
                <div className={`owner-msg-box ${message.type}`}>{message.text}</div>
            )}

            {/* ── ADD DRIVER FORM ── */}
            {showAddForm && (
                <div className="add-driver-form-card">
                    <h3>➕ Invite a Driver</h3>
                    <p className="form-subtitle">
                        Enter the driver's <strong>Driving License Number</strong> to find and invite them.
                        The driver must have a registered account with their license number saved in their profile.
                    </p>

                    {/* Step 1: License lookup */}
                    <div className="invite-step">
                        <div className="invite-step-num">1</div>
                        <div className="invite-step-content">
                            <label>Driver's License Number</label>
                            <div className="license-lookup-row">
                                <input
                                    type="text"
                                    value={licenseInput}
                                    onChange={e => { setLicenseInput(e.target.value); setFoundDriver(null); setLookupMsg(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLicenseLookup()}
                                    placeholder="e.g. KL0720230001"
                                    className="license-input"
                                />
                                <button type="button" className="lookup-btn"
                                    onClick={handleLicenseLookup} disabled={lookingUp || !licenseInput.trim()}>
                                    {lookingUp ? '🔍 Searching...' : '🔍 Find Driver'}
                                </button>
                            </div>
                            {lookupMsg && <p className="lookup-msg error">{lookupMsg}</p>}

                            {/* Found driver card */}
                            {foundDriver && (
                                <div className="found-driver-card">
                                    <span className="found-driver-icon">🧑‍✈️</span>
                                    <div className="found-driver-info">
                                        <strong>{foundDriver.fullname}</strong>
                                        <span>{foundDriver.email}</span>
                                        <span>{foundDriver.phone}</span>
                                    </div>
                                    <span className="found-driver-check">✅ Found</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Select bus — only shows after driver is found */}
                    {foundDriver && (
                        <>
                            <div className="invite-step">
                                <div className="invite-step-num">2</div>
                                <div className="invite-step-content">
                                    <label>Assign a Bus</label>
                                    <p style={{fontSize:'0.75rem',color:'#999',margin:'0 0 4px'}}>
                                        Debug: ownerId={ownerId} | total buses={buses.length} | unassigned={unassignedBuses.length}
                                    </p>
                                    <select
                                        className="assign-bus-select full-select"
                                        value={selectedBusId}
                                        onChange={e => setSelectedBusId(e.target.value)}>
                                        <option value="">-- Select a bus to assign --</option>
                                        {unassignedBuses.map(b => (
                                            <option key={b.id} value={b.id}>{b.name} ({b.number})</option>
                                        ))}
                                    </select>
                                    {unassignedBuses.length === 0 && (
                                        <p className="lookup-msg error">⚠️ All buses are already assigned. Remove a driver first.</p>
                                    )}
                                </div>
                            </div>

                            <div className="invite-step">
                                <div className="invite-step-num">3</div>
                                <div className="invite-step-content">
                                    <label>Note to Driver <span className="optional">(optional)</span></label>
                                    <textarea
                                        value={inviteNotes}
                                        onChange={e => setInviteNotes(e.target.value)}
                                        rows={2}
                                        placeholder="e.g. Shift timings, route info, expectations..."
                                        className="invite-notes-input"
                                    />
                                </div>
                            </div>

                            <button
                                className="send-invite-btn"
                                onClick={handleSendInvite}
                                disabled={sendingInvite || !selectedBusId}>
                                {sendingInvite ? '📨 Sending...' : '📨 Send Invitation to Driver'}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ── TABS ── */}
            <div className="driver-tabs">
                <button className={`driver-tab ${activeTab === 'my-drivers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-drivers')}>
                    ✅ My Drivers <span className="tab-badge">{drivers.length}</span>
                </button>
                <button className={`driver-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}>
                    ⏳ Sent Invitations {pendingInvites.length > 0 && <span className="tab-badge">{pendingInvites.length}</span>}
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Loading...</div>
            ) : (
                <>
                    {/* ── MY DRIVERS TAB ── */}
                    {activeTab === 'my-drivers' && (
                        drivers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">👥</div>
                                <h3>No Drivers Yet</h3>
                                <p>Use the "Add New Driver" button to invite a driver by their license number.</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Driver</th>
                                            <th>Mobile</th>
                                            <th>License</th>
                                            <th>Assigned Bus</th>
                                            <th>Reassign</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drivers.map(d => (
                                            <tr key={d.id}>
                                                <td>
                                                    <div className="driver-name-cell">
                                                        <span className="driver-avatar-sm">🧑‍✈️</span>
                                                        <div>
                                                            <strong>{d.driver_name}</strong>
                                                            <small style={{ display: 'block', color: 'var(--text-light)' }}>{d.email || ''}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{d.mobile || '—'}</td>
                                                <td><code style={{fontSize:'0.82rem'}}>{d.license_number}</code></td>
                                                <td>
                                                    {d.bus_name
                                                        ? <span className="assigned-bus-tag">🚌 {d.bus_name} ({d.bus_number})</span>
                                                        : <span style={{ color: 'var(--text-light)' }}>Not assigned</span>}
                                                </td>
                                                <td>
                                                    <select className="assign-bus-select"
                                                        defaultValue=""
                                                        onChange={e => { if (e.target.value) handleReassign(d, e.target.value); e.target.value = ''; }}>
                                                        <option value="">Change bus...</option>
                                                        {unassignedBuses.map(b => (
                                                            <option key={b.id} value={b.id}>{b.name} ({b.number})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <button className="delete-btn-sm" onClick={() => handleRemoveDriver(d)}>
                                                        🗑️ Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                    {/* ── PENDING INVITATIONS TAB ── */}
                    {activeTab === 'pending' && (
                        pendingInvites.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No Pending Invitations</h3>
                                <p>Invitations you send will appear here until the driver accepts or declines.</p>
                            </div>
                        ) : (
                            <div className="pending-invites-list">
                                {pendingInvites.map(inv => (
                                    <div key={inv.id} className="pending-invite-row">
                                        <span className="pi-icon">🧑‍✈️</span>
                                        <div className="pi-info">
                                            <strong>{inv.driver_name}</strong>
                                            <span>{inv.license_number}</span>
                                        </div>
                                        <div className="pi-bus">
                                            <span>🚌 {inv.bus_name || '—'}</span>
                                            <small>{inv.bus_number || ''}</small>
                                        </div>
                                        <span className="pending-badge">⏳ Awaiting Response</span>
                                        <button className="delete-btn-sm" onClick={() => handleCancelInvite(inv.id)}>
                                            Cancel
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
};

export default Drivers;