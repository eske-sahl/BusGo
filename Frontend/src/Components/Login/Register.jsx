import React from "react";
import { useState } from 'react';
import axios from 'axios';
import { Navbar } from '../Navbar/Navbar';
import './login.css';
import { Link,useNavigate } from 'react-router-dom';
import {Login} from './Login';

import email_icon from '../Assets/email.png';
import lock_icon from '../Assets/password.png';
import user_icon from '../Assets/person.png';
import phone_icon from '../Assets/phone.png';
import calendar_icon from '../Assets/calendar.png';
import upload_icon from '../Assets/upload.png';
import photo_icon from '../Assets/photo.png';
import designation_icon from '../Assets/designation.png';
import place_icon from '../Assets/place.png';


export const Register = () => {

    const [profilePreview, setProfilePreview] = useState(null);

        
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [designation, setDesignation] = useState('');
    const [place, setPlace] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('');
    const [photo,setPhoto] = useState('');
        
    
    
    const createUser = () => {
        
        axios.post('http://localhost:3002/register', {
            Email:email,
            Username:username,
            Password:password,
            Designation:designation,
            Place:place,
            Phone:phone,
            DOB:dob,
            Gender:gender,
            Fullname:fullname,
            Role:role,
            Photo:photo
        }).then(()=>{
            console.log('user created');
        })
    };

    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!role) {
            setError("Please select a role");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3002/register', {
                Email: email.trim(),
                Username: username.trim(),
                Password: password,
                Phone: phone.trim() || null,
                Role: role,
                Designation: designation || null,
                Place: place.trim() || null,
                DOB: dob || null,
                Gender: gender || null,
                Fullname: fullname.trim() || null,
                Photo: photo || null   // base64 — consider uploading file later
            });

            if (response.data.success) {
                setSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => {
                    navigate('/Login');
                }, 1800);
            } else {
                setError(response.data.message || "Registration failed");
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong";
            setError(msg);
            console.warn(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
};
  return (
    <div>
        <div className="container">
            <div className="header">
                <div className="text">Sign Up</div>
                <div className="underline"></div>
            </div>

            <form onSubmit={handleRegister}>
            <div className="inputs">
                <div className="profile-upload-section">
                    <div className="profile-preview">
                        {profilePreview ? (
                            <img src={profilePreview} alt="Profile Preview" className="preview-image" />
                        ) : (
                            <div className="preview-placeholder">
                                <span><img src={photo_icon} alt="📷" /></span>
                            </div>
                        )}
                    </div>
                    <label htmlFor="profilePicture" className="upload-label">
                        <img src={upload_icon} alt="upload" className="upload-icon" />
                        Upload Profile Picture
                    </label>
                    <input 
                        type="file" 
                        id="profilePicture" 
                        accept="image/*" 
                        onChange={handleProfileUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* First Name and Last Name - Row */}
                <div className="input-row">
                    <div className="input input-half">
                        <img src={user_icon} alt="user-icon" className="icon" />
                        <input 
                            type="text" 
                            placeholder="Full Name *" 
                            className="input-field"
                            // required
                            onChange={(e)=>setFullname(e.target.value)}
                        />
                    </div>
                    <div className="input input-half">
                        <img src={user_icon} alt="user-icon" className="icon" />
                        <input 
                            type="text" 
                            placeholder="Username *" 
                            className="input-field"
                            required
                            onChange={(e)=>setUsername(e.target.value)}
                        />
                    </div>
                </div>


                {/* Date of Birth and Gender - Row */}
                <div className="input-row">
                    <div className="input input-half">
                        <img src={calendar_icon} alt="calendar-icon" className="icon" />
                        <input 
                            type="date" 
                            placeholder="Date of Birth *" 
                            className="input-field"
                            // required
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>
                    <div className="input input-half">
                        <select 
                        className="input-field select-field"
                        required
                        onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="">Gender *</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>                        
                    </div>
                </div>
                {/* Designation */}
                <div className="input">
                    <img src={designation_icon} alt="designation-icon" className="icon" />
                    <select className="input-field select-field" defaultValue="" required onChange={(e) => setDesignation(e.target.value)} >
                        <option value="">Select Designation *</option>
                        <option value="ordinary">Ordinary</option>
                        <option value="student">Student</option>
                        <option value="employee">Employee</option>
                        <option value="businessman">Business Man</option>
                    </select>
                </div>
                {/* Place */}
                <div className="input">
                    <img src={place_icon} alt="place-icon" className="icon" />
                    <input 
                        type="text" 
                        placeholder="Place *" 
                        className="input-field"
                        required
                        onChange={(e) => setPlace(e.target.value)}
                    />
                </div>
                {/* Email */}
                <div className="input">
                    <img src={email_icon} alt="email-icon" className="icon" />
                    <input 
                        type="email" 
                        placeholder="Email Address *" 
                        className="input-field"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Phone Number */}
                <div className="input">
                    <img src={phone_icon} alt="phone-icon" className="icon" />
                    <input 
                        type="tel" 
                        placeholder="Phone Number *" 
                        className="input-field"
                        pattern="[0-9]{10}"
                        // required
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                {/* Role Selection */}
                <div className="input">
                    <img src={user_icon} alt="role-icon" className="icon" />
                    <select className="input-field select-field" defaultValue="Select Role" required onChange={(e) => setRole(e.target.value)} >
                        <option value="">Select Role *</option>
                        <option value="passenger">Passenger</option>
                        <option value="driver">Driver</option>
                        <option value="owner">Bus Owner</option>
                    </select>
                </div>

                {/* Create Password */}
                <div className="input">
                    <img src={lock_icon} alt="lock" className="icon" />
                    <input
                        type="password"
                        placeholder="Create Password *"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="input">
                    <img src={lock_icon} alt="lock" className="icon" />
                    <input
                        type="password"
                        placeholder="Confirm Password *"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
                {success && <div style={{ color: 'green', margin: '10px 0' }}>{success}</div>}

                <div className="terms-checkbox">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">
                        I agree to the <span className="terms-link">Terms & Conditions</span>
                    </label>
                </div>

                <div className="submit-container">
                    <button
                        type="submit"
                        className="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </div>
            </div>
            </form>

                {/* Terms and Conditions */}
                <div className="terms-checkbox">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">
                        I agree to the <span className="terms-link">Terms & Conditions</span>
                    </label>
                </div>
                
            <div className="submit-container">
                    <div 
                        className="submit" 
                        onClick={() => {
                            // setAction("Sign Up");
                            setProfilePreview(null);
                            createUser();
                        }}
                    >
                        Sign Up
                    
                    </div>
                </div>
                <div className="signup-info">
                        <p>Already have an account? Click <Link to="/Login" className='Linkto'><strong>Login</strong></Link></p>
                </div>
            </div>  
        </div>
    
  );
}