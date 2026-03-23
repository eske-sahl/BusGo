import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import axios from 'axios';
import email_icon from '../Assets/email.png';
import lock_icon from '../Assets/password.png';

export const Login = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3002/login', {
                LoginEmail: loginEmail.trim(),
                LoginPassword: loginPassword
            });

            const { success, token, user, message } = response.data;

            if (success && token && user) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                // Redirect based on role
                if (user.role === "passenger") {
                    navigate("/UserDashboard");
                } else if (user.role === "owner") {
                    navigate("/OwnerDashboard");
                } else if (user.role === "driver") {
                    navigate("/DriverDashboard"); // ← add if you create this later
                } else {
                    setErrorMessage("Unknown role. Contact support.");
                }
            } else {
                setErrorMessage(message || "Login failed");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Cannot connect to server";
            setErrorMessage(msg);
            console.warn("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <div className="text">Login</div>
                <div className="underline"></div>
            </div>

            <form onSubmit={handleLogin}>
                <div className="inputs">
                    <div className="input">
                        <img src={email_icon} alt="email" className="icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input">
                        <img src={lock_icon} alt="lock" className="icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
                        {errorMessage}
                    </div>
                )}
                
                <div className="submit-container">
                    <button
                        type="submit"
                        className="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>
            </form>

            <div className="signup-info">
                <p>Don't have an account? <Link to="/Register"><strong>Register</strong></Link></p>
            </div>
        </div>
    );
};