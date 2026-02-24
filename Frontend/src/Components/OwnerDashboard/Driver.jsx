import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Drivers = ({ ownerId }) => {
    const [activeTab, setActiveTab] = useState('my-drivers');
    const [requests, setRequests] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({
        driver_name: '', email: '', mobile: '',
        license_number: '', experience_years: '',
        vehicle_types: '', address: '', emergency_contact: '', notes: ''
    });
    const [addSubmitting, setAddSubmitting] = useState(false);

    const fetchAll = () => {
        axios.get(`http://localhost:3002/api/driver-requests/owner/${ownerId}`)
            .then(res => {
                const all = res.data || [];
                setRequests(all.filter(r => r.status === 'pending'));
                setDrivers(all.filter(r => r.status === 'accepted'));
                setLoading(false);
            })
            .catch(() => setLoading(false));

        axios.get(`http://localhost:3002/api/bus/owner/${ownerId}`)
            .then(res => setBuses(res.data || []))
            .catch(() => setBuses([]));
    };

    useEffect(() => { fetchAll(); }, [ownerId]);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleAccept = async (req, busId) => {
        if (!busId) { showMsg('❌ Please select a bus to assign.', 'error'); return; }
        const bus = buses.find(b => b.id === parseInt(busId));
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${req.id}/accept`, {
                owner_id: ownerId, bus_id: busId
            });
            await axios.put(`http://localhost:3002/api/bus/${busId}`, {
                name: bus?.name, number: bus?.number, capacity: bus?.capacity,
                driver: req.driver_name, status: bus?.status, ownerId: ownerId
            });
            showMsg(`✅ ${req.driver_name} accepted and assigned to ${bus?.name}!`);
            fetchAll();
        } catch { showMsg('❌ Failed to accept. Try again.', 'error'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this driver request?')) return;
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${id}/reject`);
            showMsg('Request rejected.', 'info');
            fetchAll();
        } catch { showMsg('❌ Failed to reject.', 'error'); }
    };

    const handleRemoveDriver = async (req) => {
        if (!window.confirm(`Remove ${req.driver_name} from your team?`)) return;
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${req.id}/reject`);
            if (req.assigned_bus_id) {
                const bus = buses.find(b => b.id === req.assigned_bus_id);
                await axios.put(`http://localhost:3002/api/bus/${req.assigned_bus_id}`, {
                    name: bus?.name, number: bus?.number, capacity: bus?.capacity,
                    driver: '', status: bus?.status, ownerId: ownerId
                });
            }
            showMsg(`${req.driver_name} removed from your team.`, 'info');
            fetchAll();
        } catch { showMsg('❌ Failed to remove driver.', 'error'); }
    };

    const handleReassign = async (req, newBusId) => {
        if (!newBusId) return;
        const bus = buses.find(b => b.id === parseInt(newBusId));
        try {
            await axios.put(`http://localhost:3002/api/driver-requests/${req.id}/accept`, {
                owner_id: ownerId, bus_id: newBusId
            });
            await axios.put(`http://localhost:3002/api/bus/${newBusId}`, {
                name: bus?.name, number: bus?.number, capacity: bus?.capacity,
                driver: req.driver_name, status: bus?.status, ownerId: ownerId
            });
            showMsg(`✅ ${req.driver_name} reassigned to ${bus?.name}!`);
            fetchAll();
        } catch { showMsg('❌ Reassignment failed.', 'error'); }
    };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        if (!addForm.driver_name || !addForm.mobile || !addForm.license_number) {
            showMsg('❌ Name, mobile, and license are required.', 'error'); return;
        }
        setAddSubmitting(true);
        try {
            await axios.post('http://localhost:3002/api/driver-requests/owner-add', {
                ...addForm, owner_id: ownerId, status: 'accepted'
            });
            showMsg(`✅ ${addForm.driver_name} added to your team!`);
            setAddForm({ driver_name: '', email: '', mobile: '', license_number: '',
                experience_years: '', vehicle_types: '', address: '', emergency_contact: '', notes: '' });
            setShowAddForm(false);
            fetchAll();
        } catch { showMsg('❌ Failed to add driver.', 'error'); }
        finally { setAddSubmitting(false); }
    };

    const unassignedBuses = buses.filter(b => !b.driver || b.driver === '');

    return (
        <div className="section-container">
            <div className="section-header">
                <h1>👨‍✈️ Driver Management</h1>
                <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? '✕ Cancel' : '➕ Add New Driver'}
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`owner-msg-box ${message.type}`}>{message.text}</div>
            )}

            {/* Add Driver Form */}
            {showAddForm && (
                <div className="add-driver-form-card">
                    <h3>➕ Add Driver Directly</h3>
                    <p className="form-subtitle">Add a driver you've already agreed with. They'll appear in your team.</p>
                    <form onSubmit={handleAddDriver}>
                        <div className="request-form-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input value={addForm.driver_name} onChange={e => setAddForm(p => ({...p, driver_name: e.target.value}))}
                                    placeholder="Driver's full name" required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({...p, email: e.target.value}))}
                                    placeholder="driver@email.com" />
                            </div>
                            <div className="form-group">
                                <label>Mobile *</label>
                                <input value={addForm.mobile} onChange={e => setAddForm(p => ({...p, mobile: e.target.value}))}
                                    placeholder="+91 9876543210" required />
                            </div>
                            <div className="form-group">
                                <label>License Number *</label>
                                <input value={addForm.license_number} onChange={e => setAddForm(p => ({...p, license_number: e.target.value}))}
                                    placeholder="e.g. KL0720230001" required />
                            </div>
                            <div className="form-group">
                                <label>Experience (years)</label>
                                <input type="number" value={addForm.experience_years}
                                    onChange={e => setAddForm(p => ({...p, experience_years: e.target.value}))}
                                    placeholder="e.g. 5" min="0" />
                            </div>
                            <div className="form-group">
                                <label>Vehicle Types</label>
                                <input value={addForm.vehicle_types} onChange={e => setAddForm(p => ({...p, vehicle_types: e.target.value}))}
                                    placeholder="e.g. Heavy Bus, Mini Bus" />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input value={addForm.address} onChange={e => setAddForm(p => ({...p, address: e.target.value}))}
                                    placeholder="Driver's address" />
                            </div>
                            <div className="form-group">
                                <label>Emergency Contact</label>
                                <input value={addForm.emergency_contact} onChange={e => setAddForm(p => ({...p, emergency_contact: e.target.value}))}
                                    placeholder="Emergency phone number" />
                            </div>
                            <div className="form-group full-width">
                                <label>Notes</label>
                                <textarea value={addForm.notes} rows={2}
                                    onChange={e => setAddForm(p => ({...p, notes: e.target.value}))}
                                    placeholder="Any additional notes..." />
                            </div>
                        </div>
                        <div className="form-actions-row">
                            <button type="submit" className="accept-btn" disabled={addSubmitting}>
                                {addSubmitting ? '⏳ Adding...' : '✅ Add Driver'}
                            </button>
                            <button type="button" className="reject-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="driver-tabs">
                <button className={`driver-tab ${activeTab === 'my-drivers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-drivers')}>
                    ✅ My Drivers <span className="tab-badge">{drivers.length}</span>
                </button>
                <button className={`driver-tab ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}>
                    ⏳ Pending Requests {requests.length > 0 && <span className="tab-badge">{requests.length}</span>}
                </button>
            </div>

            {loading ? (
                <div style={{textAlign:'center', padding:'2rem', color:'var(--text-light)'}}>Loading...</div>
            ) : (
                <>
                    {/* MY DRIVERS TAB */}
                    {activeTab === 'my-drivers' && (
                        drivers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">👥</div>
                                <h3>No Drivers Yet</h3>
                                <p>Accept driver requests or add a driver directly using the button above.</p>
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
                                            <th>Reassign Bus</th>
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
                                                            <small style={{display:'block', color:'var(--text-light)'}}>{d.email || ''}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{d.mobile}</td>
                                                <td>{d.license_number}</td>
                                                <td>
                                                    {d.bus_name
                                                        ? <span className="assigned-bus-tag">🚌 {d.bus_name} ({d.bus_number})</span>
                                                        : <span style={{color:'var(--text-light)'}}>Not assigned</span>}
                                                </td>
                                                <td>
                                                    <select className="assign-bus-select"
                                                        defaultValue=""
                                                        onChange={e => { if (e.target.value) handleReassign(d, e.target.value); }}>
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

                    {/* PENDING REQUESTS TAB */}
                    {activeTab === 'requests' && (
                        requests.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No Pending Requests</h3>
                                <p>No drivers have sent employment requests to you yet.</p>
                            </div>
                        ) : (
                            <div className="requests-list">
                                {requests.map(req => (
                                    <div key={req.id} className="request-card">
                                        <div className="request-header">
                                            <div className="request-driver-info">
                                                <span className="request-avatar">🧑‍✈️</span>
                                                <div>
                                                    <h3>{req.driver_name}</h3>
                                                    <p>{req.email}</p>
                                                </div>
                                            </div>
                                            <span className="pending-badge">⏳ Pending</span>
                                        </div>

                                        <div className="request-details-grid">
                                            {[
                                                ['📋 License', req.license_number],
                                                ['📱 Mobile', req.mobile],
                                                ['🚌 Experience', req.experience_years ? `${req.experience_years} yrs` : '—'],
                                                ['🚐 Vehicles', req.vehicle_types || '—'],
                                                ['📍 Address', req.address || '—'],
                                                ['🆘 Emergency', req.emergency_contact || '—'],
                                            ].map(([label, val]) => (
                                                <div className="req-detail" key={label}>
                                                    <strong>{label}</strong><span>{val}</span>
                                                </div>
                                            ))}
                                            {req.notes && (
                                                <div className="req-detail full-span">
                                                    <strong>📝 Notes</strong><span>{req.notes}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="request-actions">
                                            <select className="assign-bus-select"
                                                value={assigning[req.id] || ''}
                                                onChange={e => setAssigning(prev => ({ ...prev, [req.id]: e.target.value }))}>
                                                <option value="">-- Select Bus to Assign --</option>
                                                {unassignedBuses.map(bus => (
                                                    <option key={bus.id} value={bus.id}>{bus.name} ({bus.number})</option>
                                                ))}
                                            </select>
                                            <button className="accept-btn" onClick={() => handleAccept(req, assigning[req.id])}>
                                                ✅ Accept & Assign
                                            </button>
                                            <button className="reject-btn" onClick={() => handleReject(req.id)}>
                                                ❌ Reject
                                            </button>
                                        </div>
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