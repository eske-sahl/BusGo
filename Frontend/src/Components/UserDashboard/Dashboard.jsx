import React, { useState } from 'react';
import axios from 'axios';
import { Link ,useNavigate} from 'react-router-dom';
import './Dashboard.css';
import buslogo from '../Assets/buslogo.png';
import { useEffect } from 'react';
import RouteSearch from './RouteSearch';
import BusSearch from './BusSearch';

export const UserDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    // const [userName] = useState('John Doe'); // Replace with actual user data
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigateto=useNavigate();
    
    const user = JSON.parse(localStorage.getItem("user"));

    // Sample data - Replace with actual API data
    const [buses, setBuses] = useState([]);

    useEffect(()=>{
        axios.get('http://localhost:3002/Buses')
        .then(res =>setBuses(res.data))
        .catch(err => console.log(err));
    },[]);


    if (!user || user.role !== 'passenger') {
        navigateto("/Login");
        return null;
    }

    const userName = user.fullname;
    const userEmail = user.email;
    const userRole = user.role;
    const userPhone = user.phone;
    const userDOB = user.dob;
    const userPlace = user.place;
    const userDesignation = user.designation;
    const userPhoto = user.photo;
    const userGender = user.gender;
    const userUsername = user.username;

    const handleLogout = () => {
        // Add logout logic here
        console.log('Logging out...');
        navigateto('/Logout');
        // Navigate to login page
    };

    const renderContent = () => {
        switch(activeSection) {
            case 'dashboard':
                return <DashboardHome 
                    userName={userName}
                    setActiveSection={setActiveSection} />;
            case 'buses':
                return <BusesList buses={buses} />;
            case 'bus-route-search':
                return <RouteSearch />;
            case 'bus-search':
                return <BusSearch />;
            case 'profile':
                return (
                    <Profile 
                        userName={userName} 
                        userEmail={userEmail}
                        userPhone={userPhone}
                        userDOB={userDOB}
                        userPlace={userPlace}
                        userGender={userGender}
                        userDesignation={userDesignation}
                        userUsername={userUsername}
                        userPhoto={userPhoto}
                        userRole={userRole}
                    />
                );
            default:
                return <DashboardHome 
                userName={userName}
                setActiveSection={setActiveSection} />;
        }
    };
    

    return (
        <div className="dashboard-wrapper">
            {/* HEADER */}
            <header className="dashboard-header">
                <div className="header-left">
                    <img src={buslogo} alt="BusGo Logo" className="header-logo" />
                    
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                {/* Navigation */}
                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
                    <button 
                        className={activeSection === 'dashboard' ? 'active' : ''} 
                        onClick={() => { setActiveSection('dashboard'); setIsMobileMenuOpen(false); }}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={activeSection === 'buses' ? 'active' : ''} 
                        onClick={() => { setActiveSection('buses'); setIsMobileMenuOpen(false); }}
                    >
                        Buses
                    </button>
                    <button 
                        className={activeSection === 'bus-route-search' ? 'active' : ''} 
                        onClick={() => { setActiveSection('bus-route-search'); setIsMobileMenuOpen(false); }}
                    >
                        Route Search
                    </button>
                    <button 
                        className={activeSection === 'bus-search' ? 'active' : ''} 
                        onClick={() => { setActiveSection('bus-search'); setIsMobileMenuOpen(false); }}
                    >
                        Bus Search
                    </button>
                    <button 
                        className={activeSection === 'profile' ? 'active' : ''} 
                        onClick={() => { setActiveSection('profile'); setIsMobileMenuOpen(false); }}
                    >
                        Profile
                    </button>
                </nav>

                {/* User Section */}
                <div className="header-user">
                    <div className="user-info">
                        <span className="user-icon">👤</span>
                        <span className="user-name">{userName}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Logout
                        
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="dashboard-content">
                {renderContent()}
            </main>

            {/* FOOTER */}
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

// DASHBOARD HOME COMPONENT
const DashboardHome = ({ userName,setActiveSection }) => (
    <div className="section-container">
        <div className="welcome-section">
            <h1>Welcome, {userName}! 👋</h1>
            <p>Search buses, track routes, and manage your bookings easily.</p>
        </div>

        <div className="quick-stats">
            <div className="stat-card">
                <div className="stat-icon">🚌</div>
                <div className="stat-info">
                    <h3>500+</h3>
                    <p>Available Buses</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">🗺️</div>
                <div className="stat-info">
                    <h3>50+</h3>
                    <p>Routes Covered</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                    <h3>4.8</h3>
                    <p>Average Rating</p>
                </div>
            </div>
        </div>

        <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
                <button 
                    className="action-btn"
                    onClick={() => setActiveSection('bus-search')}
                >
                🔍 Search Buses
                </button>

                <button 
                className="action-btn"
                onClick={() => setActiveSection('bus-route-search')}
                >
                🗺️ Find Routes
                </button>

                <button 
                className="action-btn"
                onClick={() => setActiveSection('bus-search')}
                >
                🎫 Book Now
                </button>

            </div>
        </div>
    </div>
);

// BUS SEARCH COMPONENT


// BUSES LIST COMPONENT
const BusesList = ({ buses }) => (
    <div className="section-container">
        <h1>🚌 All Buses</h1>
        <div className="buses-grid">
            {buses.map(bus => (
                <div key={bus.id} className="bus-card">
                    <div className="bus-icon">🚌</div>
                    <h3>{bus.name}</h3>
                    <p className="bus-number">{bus.number}</p>
                    <p className="bus-type">{bus.type}</p>
                    <p className="bus-route">{bus.route}</p>
                    <p className="bus-timing">⏰ {bus.timing}</p>
                    <div className="bus-actions">
                        <button className="view-btn">View Route</button>
                        <button className="track-btn">Track Bus</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// PROFILE COMPONENT
const Profile = ({ 
    userName, 
    userEmail, 
    userPhone, 
    userDOB, 
    userPlace, 
    userGender, 
    userDesignation, 
    userUsername,
}) => (
    <div className="section-container">
            <h1>User Profile</h1>
            <div className="profile-container">
                <div className="profile-avatar-large">
                    <span>👤</span>
                </div>
                <div className="profile-details">
                    <div className="detail-row">
                        <label>Full Name:</label>
                        <span>{userName}</span>
                    </div>
                    <div className="detail-row">
                        <label>Phone:</label>
                        <span>{userPhone}</span>
                    </div>
                    <div className="detail-row">
                        <label>Email:</label>
                        <span>{userEmail}</span>
                    </div>
                    <div className="detail-row">
                        <label>Place:</label>
                        <span>{userPlace}</span>
                    </div>
                    <div className="detail-row">
                        <label>Date of Birth:</label>
                        <span>{userDOB}</span>
                    </div>
                    <div className="detail-row">
                        <label>Designation:</label>
                        <span>{userDesignation}</span>
                    </div>
                    <div className="detail-row">
                        <label>Username:</label>
                        <span>{userUsername}</span>
                    </div>
                    <div className="detail-row">
                        <label>Gender:</label>
                        <span>{userGender}</span>
                    </div>

                </div>
                <div className="profile-actions">
                    <button className="edit-profile-btn">✏️ Edit Profile</button>
                    <button className="password-btn">🔒 Change Password</button>
                </div>
            </div>
        </div>
);

export default UserDashboard;