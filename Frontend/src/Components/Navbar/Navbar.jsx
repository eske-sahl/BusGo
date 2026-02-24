import React from "react";
import { useState } from 'react'
import buslogo from '../Assets/buslogo.png';
import './navbar.css';

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
    <div className="navbar">
        <div className="logo">
            <a href="/Home"><img src={buslogo} alt="logo" className="logo" /></a>
        </div>
            <div className={"nav-links " + (menuOpen ? "nav-active" : "")}>
                <div className="nav-link"><a href="/Home">Home</a></div>
                <div className="nav-link"><a href="/About">About Us</a></div>
                <div className="nav-link"><a href="/Login">Login</a></div>
        </div>
            <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
                &#9776;
            </div>
    </div>
        );
    }