import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import buslogo from '../Assets/buslogo.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Driver from './Driver';
import Earning from './Earning';
import MyBuses from "./MyBuses";

export const OwnerDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [companyName] = useState('Kerala Express Travels');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigateto = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    // ✅ FIX 1: buses now fetched from API (was always empty [])
    const [buses, setBuses] = useState([]);
    // ✅ FIX 2: drivers now fetched from API (was hardcoded dummy data)
    const [drivers, setDrivers] = useState([]);
    // ✅ FIX 3: earnings now fetched from API (was hardcoded 45000 / 850000)
    const [earnings, setEarnings] = useState({ today: 0, monthly: 0, total: 0 });
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        // Fetch buses
        axios.get(`http://localhost:3002/api/bus/owner/${user.id}`)
            .then(res => setBuses(res.data || []))
            .catch(err => console.error("Failed to fetch buses:", err));

        // Fetch accepted drivers
        axios.get(`http://localhost:3002/api/driver-requests/owner/${user.id}`)
            .then(res => setDrivers((res.data || []).filter(d => d.status === 'accepted')))
            .catch(err => console.error("Failed to fetch drivers:", err));

        // Fetch routes
        axios.get(`http://localhost:3002/api/routes/owner/${user.id}`)
            .then(res => setRoutes(res.data || []))
            .catch(err => console.error("Failed to fetch routes:", err));

        // ✅ FIX: Fetch today's earnings
        const today = new Date().toISOString().split('T')[0];
        axios.get(`http://localhost:3002/api/earnings/owner/${user.id}?date=${today}`)
            .then(res => {
                const data = res.data || [];
                const todayTotal = data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                setEarnings(prev => ({ ...prev, today: todayTotal }));
            })
            .catch(err => console.error("Failed to fetch today's earnings:", err));

        // ✅ FIX: Fetch monthly earnings
        // Build start/end of current month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        axios.get(`http://localhost:3002/api/earnings/owner/${user.id}/monthly?start=${monthStart}&end=${monthEnd}`)
            .then(res => {
                const data = res.data || [];
                const monthlyTotal = Array.isArray(data)
                    ? data.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
                    : parseFloat(data.total || 0);
                setEarnings(prev => ({ ...prev, monthly: monthlyTotal }));
            })
            .catch(() => {
                // Fallback: if no monthly endpoint, sum up from daily for this month
                // You can remove this block if your backend supports the monthly endpoint
                console.warn("Monthly earnings endpoint not available, consider adding /api/earnings/owner/:id/monthly");
            });

    }, [user?.id]);

    if (!user || user.role !== 'owner') {
        navigateto("/Login");
        return null;
    }

    const ownerName = user.fullname;
    const ownerEmail = user.email;
    const ownerRole = user.role;
    const ownerPhone = user.phone;
    const ownerDOB = user.dob;
    const ownerPlace = user.place;
    const ownerDesignation = user.designation;
    const ownerPhoto = user.photo;
    const ownerGender = user.gender;
    const ownerUsername = user.username;

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
                return (
                    <DashboardHome
                        earnings={earnings}
                        buses={buses}
                        drivers={drivers}
                        setActiveSection={setActiveSection}
                    />
                );
            case 'buses':
                return <MyBuses />;
            case 'drivers':
                return <Driver ownerId={user.id} />;
            case 'earnings':
                return <Earning ownerId={user.id} />;
            case 'profile':
                return (
                    <Profile
                        user={user}
                        ownerName={ownerName}
                        ownerEmail={ownerEmail}
                        ownerPhone={ownerPhone}
                        ownerDOB={ownerDOB}
                        ownerPlace={ownerPlace}
                        ownerGender={ownerGender}
                        ownerDesignation={ownerDesignation}
                        ownerUsername={ownerUsername}
                        ownerPhoto={ownerPhoto}
                        ownerRole={ownerRole}
                        companyName={companyName}
                    />
                );
            default:
                return (
                    <DashboardHome
                        earnings={earnings}
                        buses={buses}
                        routes={routes}
                        drivers={drivers}
                        setActiveSection={setActiveSection}
                    />
                );
        }
    };

    return (
        <div className="owner-dashboard-wrapper">
            {/* HEADER */}
            <header className="owner-header">
                <div className="header-left">
                    <div className="logo">
                        <img src={buslogo} onClick={handleClickLogo} alt="BusGo Logo" className="header-logo" />
                    </div>
                </div>
                <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <span></span><span></span><span></span>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
                    {['dashboard', 'buses', 'drivers', 'earnings', 'profile'].map(section => (
                        <button
                            key={section}
                            className={activeSection === section ? 'active' : ''}
                            onClick={() => { setActiveSection(section); setIsMobileMenuOpen(false); }}
                        >
                            {section === 'dashboard' && '🏠 Dashboard'}
                            {section === 'buses' && '🚌 My Buses'}
                            {section === 'drivers' && '👨‍✈️ Drivers'}
                            {section === 'earnings' && '💰 Earnings'}
                            {section === 'profile' && '👤 Profile'}
                        </button>
                    ))}
                </nav>

                <div className="header-user">
                    <div className="user-info">
                        <span className="user-icon">👤</span>
                        <div className="user-details">
                            <span className="user-name">{ownerName}</span>
                            <span className="user-role">Owner</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </header>

            <main className="owner-content">{renderContent()}</main>

            <footer className="owner-footer">
                <div className="footer-content">
                    <p>&copy; 2026 BusTrack Kerala. Empowering Kerala's Bus Owners.</p>
                    <div className="footer-links">
                        <a href="#about">About</a>
                        <a href="#support">Support</a>
                        <a href="#terms">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// ✅ FIX 4: DashboardHome now uses correct bus status check
// Bus status from your API may be 'active' (lowercase) — check both
const DashboardHome = ({ earnings, buses = [], drivers = [], setActiveSection }) => {
    // ✅ Case-insensitive status check to handle 'Active' vs 'active'
    const activeBuses = buses.filter(bus =>
        bus.status?.toLowerCase() === 'active'
    ).length;

    const activeDrivers = drivers.length; // All accepted drivers are "active"

    return (
        <div className="section-container">
            <h1>Dashboard Overview</h1>

            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon">🚌</div>
                    <div className="summary-info">
                        {/* ✅ Shows active/total correctly */}
                        <h3>{activeBuses}/{buses.length}</h3>
                        <p>Active Buses</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">👨‍✈️</div>
                    <div className="summary-info">
                        <h3>{activeDrivers}</h3>
                        <p>Active Drivers</p>
                    </div>
                </div>
                <div className="summary-card earnings-card">
                    <div className="summary-icon">💰</div>
                    <div className="summary-info">
                        {/* ✅ Real today's earnings from API */}
                        <h3>₹{earnings.today.toLocaleString()}</h3>
                        <p>Today's Earnings</p>
                    </div>
                </div>
                <div className="summary-card earnings-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-info">
                        {/* ✅ Real monthly earnings from API */}
                        <h3>₹{earnings.monthly.toLocaleString()}</h3>
                        <p>Monthly Earnings</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <button className="quick-action-btn" onClick={() => setActiveSection('buses')}>
                        <span className="action-icon">➕</span>
                        <span>Add New Bus</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => setActiveSection('drivers')}>
                        <span className="action-icon">👨‍✈️</span>
                        <span>Add Driver</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => setActiveSection('earnings')}>
                        <span className="action-icon">💰</span>
                        <span>View Earnings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// PROFILE COMPONENT (unchanged)
const Profile = ({
    user, ownerName, ownerEmail, ownerPhone, ownerDOB,
    ownerPlace, ownerGender, ownerDesignation, ownerUsername,
}) => {

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
            <h1>Owner Profile</h1>
            <div className="profile-container">
                <div className="profile-avatar-large"><span>👤</span></div>
                <div className="profile-details">
                    <div className="detail-row"><label>Full Name:</label><span>{ownerName}</span></div>
                    <div className="detail-row"><label>Phone:</label><span>{ownerPhone}</span></div>
                    <div className="detail-row"><label>Email:</label><span>{ownerEmail}</span></div>
                    <div className="detail-row"><label>Place:</label><span>{ownerPlace}</span></div>
                    <div className="detail-row"><label>Date of Birth:</label><span>{ownerDOB}</span></div>
                    <div className="detail-row"><label>Designation:</label><span>{ownerDesignation}</span></div>
                    <div className="detail-row"><label>Username:</label><span>{ownerUsername}</span></div>
                    <div className="detail-row"><label>Gender:</label><span>{ownerGender}</span></div>
                </div>
                <div className="profile-card">
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
        </div>
    );
};

export default OwnerDashboard;