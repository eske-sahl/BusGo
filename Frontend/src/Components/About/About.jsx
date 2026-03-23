import React from 'react';
import './About.css';
import { Navbar } from '../Navbar/Navbar';

function About() {
    return (
        <div>
            <Navbar />
            <div className="about-container">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <span className="about-badge">About BusTrack Kerala</span>
                    <h1>Making Public Transport Smarter & Easier</h1>
                    <p>We're on a mission to revolutionize bus travel in Kerala through real-time tracking and smart technology</p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="our-story">
                <div className="story-content">
                    <div className="story-text">
                        <span className="section-badge"> Our Story</span>
                        <h2>How It All Started</h2>
                        <p>BusTrack Kerala was born from a simple yet powerful idea: no one should miss their bus or waste time waiting uncertainly at bus stops. As students and daily commuters ourselves, we experienced firsthand the frustrations of unpredictable bus schedules and lack of real-time information.</p>
                        <p>In 2024, we decided to do something about it. What started as a college project has now grown into a comprehensive platform serving thousands of passengers, drivers, and bus owners across Kerala.</p>
                        <p>Today, BusTrack Kerala is more than just a tracking app—it's a community of travelers, drivers, and transport providers working together to make public transportation more reliable, efficient, and accessible for everyone.</p>
                    </div>
                    <div className="story-image">
                        <div className="image-placeholder">
                            <span className="placeholder-icon"></span>
                            <p>Our Journey</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="mission-vision">
                <div className="mv-grid">
                    <div className="mv-card">
                        <div className="mv-icon"></div>
                        <h3>Our Mission</h3>
                        <p>To provide real-time, accurate bus tracking information that helps people travel confidently and efficiently across Kerala. We aim to reduce waiting times, eliminate uncertainty, and make public transport a more attractive option for everyone.</p>
                    </div>
                    <div className="mv-card">
                        <div className="mv-icon"></div>
                        <h3>Our Vision</h3>
                        <p>To become Kerala's most trusted and comprehensive bus tracking platform, setting new standards for public transportation technology and contributing to a more connected, sustainable future for our state.</p>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="core-values">
                <div className="values-header">
                    <span className="section-badge"> Core Values</span>
                    <h2>What We Stand For</h2>
                    <p>The principles that guide everything we do</p>
                </div>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon"></div>
                        <h4>Reliability</h4>
                        <p>We provide accurate, real-time information you can trust</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"></div>
                        <h4>Innovation</h4>
                        <p>Constantly improving through technology and feedback</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"></div>
                        <h4>Community</h4>
                        <p>Building connections between passengers and drivers</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"></div>
                        <h4>Sustainability</h4>
                        <p>Promoting public transport for a greener Kerala</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"></div>
                        <h4>Efficiency</h4>
                        <p>Saving time and reducing uncertainty for everyone</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon"></div>
                        <h4>Privacy</h4>
                        <p>Protecting your data with the highest security standards</p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="team-header">
                    <span className="section-badge">Our Team</span>
                    <h2>Meet The People Behind BusTrack</h2>
                    <p>A passionate team dedicated to transforming public transport</p>
                </div>
                <div className="team-grid">
                    <div className="team-card">
                        <div className="team-avatar">
                            <span className="avatar-placeholder">👨‍💻</span>
                        </div>
                        <h4>Sahl Saleem</h4>
                        <p className="team-role">Founder & CEO</p>
                        <p className="team-bio">Tech enthusiast passionate about solving real-world problems</p>
                    </div>
                    <div className="team-card">
                        <div className="team-avatar">
                            <span className="avatar-placeholder">👩‍💼</span>
                        </div>
                        <h4>Swalha Saleem</h4>
                        <p className="team-role">Chief Technology Officer</p>
                        <p className="team-bio">Building robust systems for seamless tracking</p>
                    </div>
                    <div className="team-card">
                        <div className="team-avatar">
                            <span className="avatar-placeholder">👨‍🎨</span>
                        </div>
                        <h4>Swalih</h4>
                        <p className="team-role">Head of Design</p>
                        <p className="team-bio">Creating intuitive experiences for all users</p>
                    </div>
                    <div className="team-card">
                        <div className="team-avatar">
                            <span className="avatar-placeholder">👩‍💻</span>
                        </div>
                        <h4>Salwa Saleem</h4>
                        <p className="team-role">Operations Manager</p>
                        <p className="team-bio">Ensuring smooth operations and user satisfaction</p>
                    </div>
                </div>
            </section>


            {/* Contact CTA Section */}
            <section className="contact-cta">
                <div className="contact-cta-content">
                    <h2>Want to Know More?</h2>
                    <p>Have questions or want to partner with us? We'd love to hear from you.</p>
                    <div className="cta-buttons">
                        <a href="/register" className="btn-secondary">Join Our Platform</a>
                    </div>
                </div>
            </section>
        </div>
        </div>
    );
}
export { About };