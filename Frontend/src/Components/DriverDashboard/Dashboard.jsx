import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import buslogo from '../Assets/buslogo.png';
import MyBus from './MyBus';
import DriverEarnings from './DriverEarnings';

export const DriverDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [assignedBus, setAssignedBus] = useState(null);
    const [loadingBus, setLoadingBus] = useState(true);
    const [todayEarnings, setTodayEarnings] = useState(0);
    const navigateto = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const fetchAssignedBus = () => {
        const u = JSON.parse(localStorage.getItem("user"));
        axios.get(`http://localhost:3002/api/bus/driver/${encodeURIComponent(u.fullname)}`)
            .then(res => { setAssignedBus(res.data); setLoadingBus(false); })
            .catch(() => setLoadingBus(false));
    };

    const fetchTodayEarnings = () => {
        const u = JSON.parse(localStorage.getItem("user"));
        const today = new Date().toISOString().split('T')[0];
        axios.get(`http://localhost:3002/api/earnings/driver/${u.id}?date=${today}`)
            .then(res => setTodayEarnings(res.data?.amount || 0))
            .catch(() => setTodayEarnings(0));
    };

    useEffect(() => {
        if (!user || user.role !== 'driver') {
            navigateto("/Login");
            return;
        }
        fetchAssignedBus();
        fetchTodayEarnings();
    }, []);

    if (!user || user.role !== 'driver') return null;

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigateto('/Login');
    };

    const navItems = [
        { key: 'dashboard', label: '🏠 Dashboard' },
        { key: 'mybus',     label: '🚌 My Bus' },
        { key: 'earnings',  label: '💰 Earnings' },
        { key: 'profile',   label: '👤 Profile' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <DriverHome user={user} assignedBus={assignedBus} loadingBus={loadingBus}
                            todayEarnings={todayEarnings} setActiveSection={setActiveSection} />;
            case 'mybus':
                return <MyBus user={user} assignedBus={assignedBus} loadingBus={loadingBus}
                            onBusAssigned={fetchAssignedBus} />;
            case 'earnings':
                return <DriverEarnings driverId={user.id} assignedBus={assignedBus} />;
            case 'profile':
                return <DriverProfile user={user} />;
            default:
                return <DriverHome user={user} assignedBus={assignedBus} loadingBus={loadingBus}
                            todayEarnings={todayEarnings} setActiveSection={setActiveSection} />;
        }
    };

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <div className="header-left">
                    <img src={buslogo} alt="BusGo Logo" className="header-logo" />
                </div>

                <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <span /><span /><span />
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
                    {navItems.map(item => (
                        <button key={item.key}
                            className={activeSection === item.key ? 'active' : ''}
                            onClick={() => { setActiveSection(item.key); setIsMobileMenuOpen(false); }}>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="header-user">
                    <div className="user-info">
                        <span className="user-icon">🧑‍✈️</span>
                        <span className="user-name">{user.fullname}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                {renderContent()}
            </main>

            <footer className="dashboard-footer">
                <div className="footer-content">
                    <p>&copy; 2026 BusTrack Kerala. Safe Driving, Happy Passengers.</p>
                    <div className="footer-links">
                        <a href="#about">About</a>
                        <a href="#support">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

/* ─── DASHBOARD HOME ─────────────────────────────────── */
const DriverHome = ({ user, assignedBus, loadingBus, todayEarnings, setActiveSection }) => (
    <div className="section-container">
        <div className="welcome-section">
            <h1>Welcome, {user.fullname}! 🧑‍✈️</h1>
            <p>Manage your bus, track stops, and record daily earnings.</p>
        </div>
        <div className="quick-stats">
            <div className="stat-card">
                <span className="stat-icon">🚌</span>
                <div className="stat-info">
                    {loadingBus ? <h3>Loading...</h3> : assignedBus
                        ? <><h3>{assignedBus.name}</h3><p>{assignedBus.number}</p></>
                        : <><h3>No Bus</h3><p>Request assignment</p></>}
                </div>
            </div>
            <div className="stat-card">
                <span className="stat-icon">🗺️</span>
                <div className="stat-info">
                    {assignedBus?.start_place
                        ? <><h3>{assignedBus.start_place}</h3><p>→ {assignedBus.end_place}</p></>
                        : <><h3>No Route</h3><p>Pending assignment</p></>}
                </div>
            </div>
            <div className="stat-card">
                <span className="stat-icon">💰</span>
                <div className="stat-info">
                    <h3>₹{(todayEarnings || 0).toLocaleString()}</h3>
                    <p>Today's Earnings</p>
                </div>
            </div>
            <div className="stat-card">
                <span className="stat-icon">⏰</span>
                <div className="stat-info">
                    <h3>{assignedBus?.start_time || '--:--'}</h3>
                    <p>to {assignedBus?.end_time || '--:--'}</p>
                </div>
            </div>
        </div>
        <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
                <button className="action-btn" onClick={() => setActiveSection('mybus')}>🚌 View My Bus</button>
                <button className="action-btn" onClick={() => setActiveSection('earnings')}>💰 Record Earnings</button>
                <button className="action-btn" onClick={() => setActiveSection('profile')}>👤 My Profile</button>
            </div>
        </div>
    </div>
);

/* ─── PROFILE ────────────────────────────────────────── */
const DriverProfile = ({ user }) => (
    <div className="section-container">
        <h1>👤 My Profile</h1>
        <div className="profile-card">
            <div className="profile-avatar"><span>🧑‍✈️</span></div>
            <div className="profile-info">
                {[['Full Name', user.fullname], ['Phone', user.phone], ['Email', user.email],
                  ['Place', user.place], ['Date of Birth', user.dob],
                  ['Username', user.username], ['Gender', user.gender]
                ].map(([label, val]) => (
                    <p key={label}><strong>{label}:</strong> {val || '—'}</p>
                ))}
            </div>
            <div className="profile-actions">
                <button className="edit-btn">✏️ Edit Profile</button>
                <button className="password-btn">🔒 Change Password</button>
            </div>
        </div>
    </div>
);

export default DriverDashboard;