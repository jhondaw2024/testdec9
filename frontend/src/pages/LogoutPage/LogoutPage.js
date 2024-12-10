// LogoutPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LogoutPage.scss';

const LogoutPage = ({ onLogout }) => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      onLogout(); // Call the parent logout handler
      navigate('/login');
    }
  }, [countdown, onLogout, navigate]);

  const handleLogout = () => {
    onLogout(); // Clear token and update state
    navigate('/login');
  };

  const handleStayLoggedIn = () => {
    navigate('/chat'); // Go back to the previous page
  };

  return (
    <div className="logout-page">
      <h1>Logout Confirmation</h1>
      <p>Are you sure you want to log out?</p>
      <div className="button-group">
        <button onClick={handleLogout} className="logout-btn">
          Confirm Logout
        </button>
        <button onClick={handleStayLoggedIn} className="stay-btn">
          Stay Logged In
        </button>
      </div>
      <p className="countdown">
        Redirecting to login page in {countdown} seconds...
      </p>
      <p className="goodbye-message">See you soon!</p>
    </div>
  );
};

export default LogoutPage;
