
import './home.css'
import {Navbar} from '../Navbar/Navbar'
import Location from '../Assets/location.png'
import Alert from '../Assets/alert.png'
import Schedule from '../Assets/schedule.png'
import Tracking from '../Assets/tracking.png'
import Time from '../Assets/time.png'
import Money from '../Assets/money.png'

export const Home = () => {

    return (
        <div>
            <Navbar />
            <div className="home-container">
                {/* Hero Section */}
                <section className="hero-section" id="home">
                    <div className="hero-content">
                        <span className="hero-badge">Smart Bus Tracking for Kerala</span>
                        <h1>Track Your Bus in Real-Time</h1>
                        <p>Never miss your bus again! Get live location updates, arrival times, and complete schedules for private buses across Kerala.</p>
                        <div className="hero-buttons">
                            <a href="/register" className="btn-primary">Get Started</a>
                            <a href="/About" className="btn-secondary">Learn More</a>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="stats-section">
                    <div className="stats-container">
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Buses Tracked</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">10K+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">50+</div>
                            <div className="stat-label">Routes Covered</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Real-Time Updates</div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section" id="features">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2>Everything You Need</h2>
                        <p>Powerful features designed to make your journey smooth and hassle-free</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><img src={Location} alt="📍" /></div>
                            <h3>Live Tracking</h3>
                            <p>See exactly where your bus is on the map in real-time. No more guessing or waiting unnecessarily.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><img src={Time} alt="⏰" /></div>
                            <h3>Arrival Times</h3>
                            <p>Get accurate predictions of when your bus will arrive at your stop. Plan your time better.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><img src={Schedule} alt="📅" /></div>
                            <h3>Complete Schedules</h3>
                            <p>Access full timetables for all routes. Check departure times and plan your journey ahead.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><img src={Alert} alt="🔔" /></div>
                            <h3>Smart Alerts</h3>
                            <p>Get notifications when your bus is approaching. Never rush or miss your ride again.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><img src={Tracking} alt="🗺️" /></div>
                            <h3>Route Information</h3>
                            <p>View complete route details, stops, and distances. Know your journey before you start.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><img src={Money} alt="💰ś" /></div>
                            <h3>Fare Details</h3>
                            <p>Check ticket prices for different routes and plan your travel budget accordingly.</p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works" id="how-it-works">
                    <div className="section-header">
                        <span className="section-badge">Simple Process</span>
                        <h2>How It Works</h2>
                        <p>Get started in three simple steps</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Sign Up</h3>
                            <p>Create your free account in less than a minute. Choose your role and get started.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Select Your Bus</h3>
                            <p>Search for your bus route or number. Save your favorite routes for quick access.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Track & Travel</h3>
                            <p>Get real-time updates, arrival notifications, and never miss your bus again.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <h2>Ready to Never Miss Your Bus?</h2>
                    <p>Join thousands of happy travelers who are already using BusTrack Kerala to make their daily commute easier.</p>
                    <div className="cta-buttons">
                        <a href="/register" className="btn-cta-primary">Create Free Account →</a>
                    </div>
                </section>

                {/* Footer */}
                <footer>
                    <p>&copy; 2024 BusGo Kerala. Making public transport smarter and easier for everyone.</p>
                </footer>
            </div>
        </div>

    )
}