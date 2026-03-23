import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import buslogo from '../Assets/buslogo.png';
import RouteSearch from './RouteSearch';
import BusSearch from './BusSearch';

export const UserDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [buses, setBuses] = useState([]);
    const [loadingBuses, setLoadingBuses] = useState(true);
    const navigateto = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        axios.get('http://localhost:3002/Buses')
            .then(res => { setBuses(res.data || []); setLoadingBuses(false); })
            .catch(err => { console.log(err); setLoadingBuses(false); });
    }, []);

    if (!user || user.role !== 'passenger') {
        navigateto("/Login");
        return null;
    }

    const handleClickLogo = () => {
        localStorage.removeItem("user");
        navigateto('/Home');
    };

    const handleLogout = () => {
        navigateto('/Login');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <DashboardHome
                    userName={user.fullname}
                    buses={buses}
                    loadingBuses={loadingBuses}
                    setActiveSection={setActiveSection} />;
            case 'buses':
                return <BusesList buses={buses} loading={loadingBuses} setActiveSection={setActiveSection} />;
            case 'bus-route-search':
                return <RouteSearch />;
            case 'bus-search':
                return <BusSearch />;
            case 'profile':
                return <Profile user={user} />;
            default:
                return <DashboardHome
                    userName={user.fullname}
                    buses={buses}
                    loadingBuses={loadingBuses}
                    setActiveSection={setActiveSection} />;
        }
    };

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo">
                        <img src={buslogo} onClick={handleClickLogo} alt="BusGo Logo" className="header-logo" />
                    </div>
                </div>

                <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <span /><span /><span />
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
                    {[
                        { key: 'dashboard',       label: 'Dashboard' },
                        { key: 'buses',           label: 'Buses' },
                        { key: 'bus-route-search',label: 'Route Search' },
                        { key: 'bus-search',      label: 'Bus Search' },
                        { key: 'profile',         label: 'Profile' },
                    ].map(item => (
                        <button key={item.key}
                            className={activeSection === item.key ? 'active' : ''}
                            onClick={() => { setActiveSection(item.key); setIsMobileMenuOpen(false); }}>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="header-user">
                    <div className="user-info">
                        <span className="user-icon">👤</span>
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
                    <p>&copy; 2026 BusTrack Kerala. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#about">About</a>
                        <a href="#contact">Contact</a>
                        <a href="#privacy">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// ── DASHBOARD HOME ────────────────────────────────────────────────────────────
const DashboardHome = ({ userName, buses, loadingBuses, setActiveSection }) => {
    // ✅ FIX: real counts from fetched bus data instead of hardcoded "500+", "50+"
    const totalBuses  = buses.length;
    const activeBuses = buses.filter(b => b.status?.toLowerCase() === 'active').length;
    // Count unique routes (buses that have a route_name assigned)
    const totalRoutes = buses.filter(b => b.route_name || b.start_place).length;

    return (
        <div className="section-container">
            <div className="welcome-section">
                <h1>Welcome, {userName}! 👋</h1>
                <p>Search buses, track routes, and plan your journey easily.</p>
            </div>

            <div className="quick-stats">
                <div className="stat-card">
                    <div className="stat-icon">🚌</div>
                    <div className="stat-info">
                        {/* ✅ Real total buses from API */}
                        <h3>{loadingBuses ? '...' : totalBuses}</h3>
                        <p>Available Buses</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        {/* ✅ Real active buses count */}
                        <h3>{loadingBuses ? '...' : activeBuses}</h3>
                        <p>Active Now</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🗺️</div>
                    <div className="stat-info">
                        {/* ✅ Real routes count */}
                        <h3>{loadingBuses ? '...' : totalRoutes}</h3>
                        <p>Routes Covered</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button className="action-btn" onClick={() => setActiveSection('bus-search')}>
                        🔍 Search Buses
                    </button>
                    <button className="action-btn" onClick={() => setActiveSection('bus-route-search')}>
                        🗺️ Find Routes
                    </button>
                    <button className="action-btn" onClick={() => setActiveSection('buses')}>
                        🚌 View All Buses
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── BUSES LIST ────────────────────────────────────────────────────────────────
const BusesList = ({ buses, loading, setActiveSection }) => {
    if (loading) return (
        <div className="section-container">
            <h1>🚌 All Buses</h1>
            <p>Loading buses...</p>
        </div>
    );

    return (
        <div className="section-container">
            <h1>🚌 All Buses</h1>
            {buses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🚌</div>
                    <h3>No Buses Available</h3>
                    <p>No buses are registered in the system yet.</p>
                </div>
            ) : (
                <div className="buses-grid">
                    {buses.map(bus => (
                        <div key={bus.id} className="bus-card">
                            <div className="bus-icon">🚌</div>
                            {/* ✅ FIX: use correct API field names (was bus.type, bus.route, bus.timing — all undefined) */}
                            <h3>{bus.name}</h3>
                            <p className="bus-number">🪪 {bus.number}</p>

                            {/* Route info — use real fields from /Buses endpoint */}
                            {bus.start_place && bus.end_place ? (
                                <p className="bus-route">
                                    📍 {bus.start_place} → {bus.end_place}
                                </p>
                            ) : (
                                <p className="bus-route" style={{ color: 'var(--text-light)' }}>
                                    No route assigned
                                </p>
                            )}

                            {/* Timing */}
                            {bus.start_time && bus.end_time ? (
                                <p className="bus-timing">
                                    ⏰ {bus.start_time} – {bus.end_time}
                                </p>
                            ) : (
                                <p className="bus-timing" style={{ color: 'var(--text-light)' }}>
                                    ⏰ Timing not set
                                </p>
                            )}

                            {/* Status badge */}
                            <span className={`status-badge ${bus.status?.toLowerCase() || 'active'}`}>
                                {bus.status || 'Active'}
                            </span>

                            {/* Driver */}
                            {bus.driver && (
                                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                                    🧑‍✈️ {bus.driver}
                                </p>
                            )}

                            <div className="bus-actions">
                                {/* ✅ FIX: buttons now navigate to actual sections instead of doing nothing */}
                                <button className="view-btn"
                                    onClick={() => setActiveSection('bus-route-search')}>
                                    View Route
                                </button>
                                <button className="track-btn"
                                    onClick={() => setActiveSection('bus-search')}>
                                    Track Bus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── PROFILE ───────────────────────────────────────────────────────────────────
const Profile = ({ user }) => {
    const navigate = useNavigate(); // ✅ needed

    // ✅ DELETE FUNCTION (PASTE HERE)
    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This cannot be undone.");

        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:3002/api/users/${user.id}`);

            alert("Account deleted successfully");

            localStorage.removeItem("user");
            navigate("/Login"); // redirect to login

        } catch (err) {
            console.error(err);
            alert("Failed to delete account");
        }
    };

    return (
        <div className="section-container">
            <h1>User Profile</h1>

            <div className="profile-container">
                <div className="profile-avatar-large">
                    <span>👤</span>
                </div>

                <div className="profile-details">
                    {[
                        ['Full Name', user.fullname],
                        ['Phone', user.phone],
                        ['Email', user.email],
                        ['Place', user.place],
                        ['Date of Birth', user.dob],
                        ['Designation', user.designation],
                        ['Username', user.username],
                        ['Gender', user.gender],
                    ].map(([label, val]) => (
                        <div className="detail-row" key={label}>
                            <label>{label}:</label>
                            <span>{val || '—'}</span>
                        </div>
                    ))}
                </div>

                {/* ✅ DELETE BUTTON */}
                <div className="profile-actions">
                    <button 
                        className="delete-btn"
                        onClick={handleDeleteAccount}
                    >
                        🗑️ Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;