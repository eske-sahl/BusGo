import React, { useState } from 'react';
import './Dashboard.css';
import buslogo from '../Assets/buslogo.png';
import { Link ,useNavigate} from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
import Driver from './Driver';
import Earning from './Earning';
import MyBuses from "./MyBuses";



export const OwnerDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    // const [ownerName] = useState('Rajesh Kumar');
    const [companyName] = useState('Kerala Express Travels');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigateto=useNavigate();


    const user = JSON.parse(localStorage.getItem("user"));

    // Sample Data - Replace with actual API data
    const [buses] = useState([]);
    


    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        axios
            .get(`http://localhost:3002/api/routes/owner/${user.id}`)
            .then((res) => {
                setRoutes(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
        }, [user?.id]);


    
    const [drivers] = useState([
        { id: 1, name: 'Suresh Kumar', phone: '+91 9876543210', license: 'KL0720230001', bus: 'KL-07-A-1234', status: 'Active' },
        { id: 2, name: 'Ramesh Pillai', phone: '+91 9876543211', license: 'KL0920230002', bus: 'KL-09-B-5678', status: 'Active' },
        { id: 3, name: 'Vinod Nair', phone: '+91 9876543212', license: 'KL1420230003', bus: 'Not Assigned', status: 'Available' },
    ]);

    const [earnings] = useState({
        today: 45000,
        monthly: 850000,
        total: 5200000
    });

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

    const handleLogout = () => {
        console.log('Logging out...');
        navigateto('/Logout');
        // Navigate to login page
    };

    const renderContent = () => {
        switch(activeSection) {
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
                return <MyBuses/>;;
            case 'drivers':
                return <Driver ownerId={user.id}/>;
            case 'earnings':
                return <Earning ownerId={user.id}/>;
            case 'profile':
                return (
                    <Profile 
                        ownerName={ownerName} 
                        ownerEmail={ownerEmail}
                        ownerPhone={ownerPhone}
                        ownerDOB={ownerDOB}
                        ownerPlace={ownerPlace}
                        ownerGender={ownerGender}
                        ownerDesignation={ownerDesignation}
                        ownerUsername={ownerUsername}
                        ownerPhoto={ownerPhoto}
                        ownerRole={ownerRole} companyName={companyName} />
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
                        🏠 Dashboard
                    </button>
                    <button 
                        className={activeSection === 'buses' ? 'active' : ''} 
                        onClick={() => { setActiveSection('buses'); setIsMobileMenuOpen(false); }}
                    >
                        🚌 My Buses
                    </button>
                    <button 
                        className={activeSection === 'drivers' ? 'active' : ''} 
                        onClick={() => { setActiveSection('drivers'); setIsMobileMenuOpen(false); }}
                    >
                        👨‍✈️ Drivers
                    </button>
                    <button 
                        className={activeSection === 'earnings' ? 'active' : ''} 
                        onClick={() => { setActiveSection('earnings'); setIsMobileMenuOpen(false); }}
                    >
                        💰 Earnings
                    </button>
                    <button 
                        className={activeSection === 'profile' ? 'active' : ''} 
                        onClick={() => { setActiveSection('profile'); setIsMobileMenuOpen(false); }}
                    >
                        👤 Profile
                    </button>
                </nav>

                {/* Owner Profile Section */}
                <div className="header-user">
                    <div className="user-info">
                        <span className="user-icon">👤</span>
                        <div className="user-details">
                            <span className="user-name">{ownerName}</span>
                            <span className="user-role">Owner</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="owner-content">
                {renderContent()}
            </main>

            {/* FOOTER */}
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

// DASHBOARD COMPONENT
const DashboardHome = ({ earnings, buses=[], routes=[], drivers=[], setActiveSection }) => {
    const activeBuses = buses.filter(bus => bus.status === 'Active').length;
    const activeRoutes = routes.filter(route => route.status === 'Active').length;
    const activeDrivers = drivers.filter(driver => driver.status === 'Active').length;

    return (
        <div className="section-container">
            <h1>Dashboard Overview</h1>
            
            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon">🚌</div>
                    <div className="summary-info">
                        <h3>{activeBuses}/{buses.length}</h3>
                        <p>Active Buses</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🗺️</div>
                    <div className="summary-info">
                        <h3>{activeRoutes}</h3>
                        <p>Active Routes</p>
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
                        <h3>₹{earnings.today.toLocaleString()}</h3>
                        <p>Today's Earnings</p>
                    </div>
                </div>
                <div className="summary-card earnings-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-info">
                        <h3>₹{earnings.monthly.toLocaleString()}</h3>
                        <p>Monthly Earnings</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <button
                        className="quick-action-btn"
                        onClick={() => setActiveSection('buses')}
                    >
                        <span className="action-icon">➕</span>
                        <span>Add New Bus</span>
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => setActiveSection('drivers')}
                    >
                        <span className="action-icon">👨‍✈️</span>
                        <span>Add Driver</span>
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => setActiveSection('earnings')}
                    >
                        <span className="action-icon">💰</span>
                        <span>View Earnings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


// DRIVERS COMPONENT
// const Drivers = ({ 

// EARNINGS COMPONENT
// const Earnings = ({ earnings }) => {
//     return (
//         <div className="section-container">
//             <h1>Earnings Overview</h1>

//             <div className="earnings-summary">
//                 <div className="earnings-card large">
//                     <div className="earnings-icon">💰</div>
//                     <div className="earnings-info">
//                         <h2>₹{earnings.today.toLocaleString()}</h2>
//                         <p>Today's Earnings</p>
//                     </div>
//                 </div>
//                 <div className="earnings-card large">
//                     <div className="earnings-icon">📊</div>
//                     <div className="earnings-info">
//                         <h2>₹{earnings.monthly.toLocaleString()}</h2>
//                         <p>This Month</p>
//                     </div>
//                 </div>
//                 <div className="earnings-card large">
//                     <div className="earnings-icon">💎</div>
//                     <div className="earnings-info">
//                         <h2>₹{earnings.total.toLocaleString()}</h2>
//                         <p>Total Earnings</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Simple Charts Placeholder */}
//             <div className="charts-section">
//                 <h2>Earnings Breakdown</h2>
//                 <div className="charts-grid">
//                     <div className="chart-placeholder">
//                         <h3>📈 Earnings per Day</h3>
//                         <p className="chart-note">Chart visualization can be added using Chart.js or similar library</p>
//                     </div>
//                     <div className="chart-placeholder">
//                         <h3>🗺️ Earnings per Route</h3>
//                         <p className="chart-note">Chart visualization can be added using Chart.js or similar library</p>
//                     </div>
//                     <div className="chart-placeholder">
//                         <h3>🚌 Earnings per Bus</h3>
//                         <p className="chart-note">Chart visualization can be added using Chart.js or similar library</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// PROFILE COMPONENT
const Profile = ({ 
    ownerName, 
    ownerEmail, 
    ownerPhone, 
    ownerDOB, 
    ownerPlace, 
    ownerGender, 
    ownerDesignation, 
    ownerUsername,
 }) => {
    return (
        <div className="section-container">
            <h1>Owner Profile</h1>
            <div className="profile-container">
                <div className="profile-avatar-large">
                    <span>👤</span>
                </div>
                <div className="profile-details">
                    <div className="detail-row">
                        <label>Full Name:</label>
                        <span>{ownerName}</span>
                    </div>
                    <div className="detail-row">
                        <label>Company Name:</label>
                        <span>"Bus Company"</span>
                    </div>
                    <div className="detail-row">
                        <label>Phone:</label>
                        <span>{ownerPhone}</span>
                    </div>
                    <div className="detail-row">
                        <label>Email:</label>
                        <span>{ownerEmail}</span>
                    </div>
                    <div className="detail-row">
                        <label>Place:</label>
                        <span>{ownerPlace}</span>
                    </div>
                    <div className="detail-row">
                        <label>Date of Birth:</label>
                        <span>{ownerDOB}</span>
                    </div>
                    <div className="detail-row">
                        <label>Designation:</label>
                        <span>{ownerDesignation}</span>
                    </div>
                    <div className="detail-row">
                        <label>Username:</label>
                        <span>{ownerUsername}</span>
                    </div>
                    <div className="detail-row">
                        <label>Gender:</label>
                        <span>{ownerGender}</span>
                    </div>

                </div>
                <div className="profile-actions">
                    <button className="edit-profile-btn">✏️ Edit Profile</button>
                    <button className="password-btn">🔒 Change Password</button>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;