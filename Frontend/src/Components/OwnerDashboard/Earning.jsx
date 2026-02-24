import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Earnings = ({ ownerId }) => {
    const [earningsData, setEarningsData] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        axios.get(`http://localhost:3002/api/earnings/owner/${ownerId}?date=${selectedDate}`)
            .then(res => { setEarningsData(res.data || []); setLoading(false); })
            .catch(() => { setEarningsData([]); setLoading(false); });

        axios.get(`http://localhost:3002/api/driver-requests/owner/${ownerId}`)
            .then(res => setDrivers((res.data || []).filter(d => d.status === 'accepted')))
            .catch(() => setDrivers([]));
    }, [ownerId, selectedDate]);

    const totalEarnings = earningsData.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const totalPassengers = earningsData.reduce((s, e) => s + parseInt(e.passengers || 0), 0);

    // Map driver_id to earnings for quick lookup
    const earningsByDriver = {};
    earningsData.forEach(e => { earningsByDriver[e.driver_id] = e; });

    return (
        <div className="section-container">
            <div className="section-header">
                <h1>💰 Earnings Overview</h1>
                <div className="date-picker-row">
                    <label>📅 Date:</label>
                    <input type="date" value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="date-picker-input" />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="earnings-summary">
                <div className="earnings-card large">
                    <div className="earnings-icon">💰</div>
                    <div className="earnings-info">
                        <h2>₹{totalEarnings.toLocaleString()}</h2>
                        <p>{selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : 'Day'} Total</p>
                    </div>
                </div>
                <div className="earnings-card large">
                    <div className="earnings-icon">👥</div>
                    <div className="earnings-info">
                        <h2>{totalPassengers.toLocaleString()}</h2>
                        <p>Total Passengers</p>
                    </div>
                </div>
                <div className="earnings-card large">
                    <div className="earnings-icon">🚌</div>
                    <div className="earnings-info">
                        <h2>{earningsData.length}/{drivers.length}</h2>
                        <p>Buses Reported</p>
                    </div>
                </div>
            </div>

            {/* Per Driver/Bus Breakdown */}
            <div className="earnings-breakdown">
                <h2>🚌 Earnings per Bus / Driver</h2>
                {loading ? (
                    <div style={{textAlign:'center', padding:'2rem', color:'var(--text-light)'}}>Loading...</div>
                ) : drivers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>No Drivers Assigned</h3>
                        <p>Add drivers to your team to track earnings per bus.</p>
                    </div>
                ) : (
                    <div className="earnings-bus-grid">
                        {drivers.map(driver => {
                            const entry = earningsByDriver[driver.driver_id];
                            const hasEntry = !!entry;
                            return (
                                <div key={driver.id} className={`earnings-bus-card ${hasEntry ? 'reported' : 'not-reported'}`}>
                                    <div className="ebc-header">
                                        <span className="ebc-icon">🚌</span>
                                        <div>
                                            <strong>{driver.bus_name || 'No Bus'}</strong>
                                            <small>{driver.bus_number || ''}</small>
                                        </div>
                                        <span className={`ebc-status ${hasEntry ? 'done' : 'pending'}`}>
                                            {hasEntry ? '✅ Reported' : '⏳ Pending'}
                                        </span>
                                    </div>

                                    <div className="ebc-driver">
                                        <span>🧑‍✈️ {driver.driver_name}</span>
                                    </div>

                                    {hasEntry ? (
                                        <div className="ebc-amounts">
                                            <div className="ebc-amount-row">
                                                <span>Amount Collected</span>
                                                <strong className="ebc-amount">₹{parseFloat(entry.amount).toLocaleString()}</strong>
                                            </div>
                                            <div className="ebc-amount-row">
                                                <span>Passengers</span>
                                                <strong>{entry.passengers || 0}</strong>
                                            </div>
                                            {entry.notes && (
                                                <div className="ebc-notes">📝 {entry.notes}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="ebc-not-reported">
                                            <p>Driver hasn't recorded earnings yet for this date.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detailed Table */}
            {earningsData.length > 0 && (
                <div className="earnings-table-section">
                    <h2>📊 Detailed Records</h2>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Driver</th>
                                    <th>Bus</th>
                                    <th>Amount</th>
                                    <th>Passengers</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earningsData.map((e, idx) => (
                                    <tr key={e.id || idx}>
                                        <td><strong>🧑‍✈️ {e.driver_name || '—'}</strong></td>
                                        <td>{e.bus_name ? `${e.bus_name} (${e.bus_number})` : '—'}</td>
                                        <td><strong style={{color:'var(--accent-rust)'}}>₹{parseFloat(e.amount).toLocaleString()}</strong></td>
                                        <td>{e.passengers || '—'}</td>
                                        <td style={{color:'var(--text-light)'}}>{e.notes || '—'}</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={2}><strong>Total</strong></td>
                                    <td><strong style={{color:'var(--secondary-brown)'}}>₹{totalEarnings.toLocaleString()}</strong></td>
                                    <td><strong>{totalPassengers}</strong></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Earnings;