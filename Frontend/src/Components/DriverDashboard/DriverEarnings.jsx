import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DriverEarnings = ({ driverId, assignedBus }) => {
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        passengers: '',
        notes: ''
    });

    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => { fetchEarnings(); }, [driverId]);

    const fetchEarnings = () => {
        setLoading(true);
        axios.get(`http://localhost:3002/api/earnings/driver/${driverId}`)
            .then(res => { setEarnings(res.data || []); setLoading(false); })
            .catch(() => { setEarnings([]); setLoading(false); });
    };

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.date || !form.amount) { setMessage('❌ Date and Amount are required.'); return; }

        // ✅ FIX 1: Block future date submissions
        if (form.date > todayStr) {
            setMessage('❌ Cannot record earnings for a future date.');
            return;
        }

        // ✅ FIX 2: Prevent duplicate entries for the same date
        const alreadyExists = earnings.some(e => e.date?.split('T')[0] === form.date);
        if (alreadyExists) {
            setMessage(`❌ Earnings for ${form.date} already recorded. You cannot add duplicate entries for the same date.`);
            return;
        }

        setSaving(true); setMessage('');
        try {
            await axios.post('http://localhost:3002/api/earnings/add', {
                driver_id: driverId,
                bus_id: assignedBus?.id || null,
                date: form.date,
                amount: parseFloat(form.amount),
                passengers: parseInt(form.passengers) || 0,
                notes: form.notes
            });
            setMessage('✅ Earnings recorded successfully!');
            setForm({ date: todayStr, amount: '', passengers: '', notes: '' });
            fetchEarnings();
        } catch {
            setMessage('❌ Failed to save. Please try again.');
        } finally { setSaving(false); }
    };

    const totalEarnings = earnings.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const totalPassengers = earnings.reduce((s, e) => s + parseInt(e.passengers || 0), 0);
    const todayEntry = earnings.find(e => e.date?.split('T')[0] === todayStr);

    return (
        <div className="section-container">
            <h1>💰 Earnings</h1>

            {/* Summary */}
            <div className="quick-stats">
                <div className="stat-card">
                    <span className="stat-icon">📅</span>
                    <div className="stat-info">
                        <h3>₹{todayEntry ? parseFloat(todayEntry.amount).toLocaleString() : '0'}</h3>
                        <p>Today</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">💰</span>
                    <div className="stat-info">
                        <h3>₹{totalEarnings.toLocaleString()}</h3>
                        <p>Total Recorded</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                        <h3>{totalPassengers.toLocaleString()}</h3>
                        <p>Total Passengers</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📋</span>
                    <div className="stat-info">
                        <h3>{earnings.length}</h3>
                        <p>Records</p>
                    </div>
                </div>
            </div>

            {/* Record Form */}
            <div className="earnings-form-card">
                <h3>📝 Record Today's Earnings</h3>

                {/* ✅ Show a notice if today is already recorded */}
                {todayEntry && (
                    <div className="form-message-box info" style={{
                        background: '#e0f2fe', color: '#0369a1',
                        padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem'
                    }}>
                        ℹ️ Today's earnings (₹{parseFloat(todayEntry.amount).toLocaleString()}) are already recorded.
                        You cannot submit a duplicate entry for today.
                    </div>
                )}

                {message && (
                    <div className={`form-message-box ${message.startsWith('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="request-form-grid">
                        <div className="form-group">
                            <label>Date *</label>
                            {/* ✅ FIX: max=today prevents future date selection from the date picker */}
                            <input type="date" name="date" value={form.date}
                                onChange={handleChange}
                                max={todayStr}
                                required />
                        </div>
                        <div className="form-group">
                            <label>Amount Collected (₹) *</label>
                            <input type="number" name="amount" value={form.amount}
                                onChange={handleChange}
                                placeholder="e.g. 12500" min="0" step="0.01" required />
                        </div>
                        <div className="form-group">
                            <label>Passengers Carried</label>
                            <input type="number" name="passengers" value={form.passengers}
                                onChange={handleChange} placeholder="e.g. 45" min="0" />
                        </div>
                        <div className="form-group">
                            <label>Bus</label>
                            <input type="text" disabled
                                value={assignedBus ? `${assignedBus.name} (${assignedBus.number})` : 'Not assigned'} />
                        </div>
                        <div className="form-group full-width">
                            <label>Remarks</label>
                            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                                placeholder="Any notes about today's trip..." />
                        </div>
                    </div>
                    <button type="submit" className="submit-request-btn"
                        // ✅ Also disable button if today is already recorded
                        disabled={saving || (form.date === todayStr && !!todayEntry)}>
                        {saving ? '💾 Saving...' : '💾 Record Earnings'}
                    </button>
                </form>
            </div>

            {/* History Table */}
            <div className="earnings-history-section">
                <h3>📊 Earnings History</h3>
                {loading ? (
                    <p className="loading-text">Loading...</p>
                ) : earnings.length === 0 ? (
                    <div className="no-bus-banner" style={{ marginTop: '1rem' }}>
                        <div className="no-bus-icon">💰</div>
                        <h2>No Records Yet</h2>
                        <p>Start recording daily earnings using the form above.</p>
                    </div>
                ) : (
                    <div className="earnings-table-wrap">
                        <table className="earnings-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Passengers</th>
                                    <th>Bus</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earnings.map((entry, idx) => (
                                    <tr key={entry.id || idx}
                                        className={entry.date?.split('T')[0] === todayStr ? 'today-row' : ''}>
                                        <td>{entry.date
                                            ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : '—'}</td>
                                        <td><strong>₹{parseFloat(entry.amount).toLocaleString()}</strong></td>
                                        <td>{entry.passengers || '—'}</td>
                                        <td>{entry.bus_name || '—'}</td>
                                        <td>{entry.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverEarnings;