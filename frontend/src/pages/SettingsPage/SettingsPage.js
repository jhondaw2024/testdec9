import React, { useState } from 'react';
import './SettingsPage.scss';
import {Link} from "react-router-dom"
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [chatbotTone, setChatbotTone] = useState('neutral');
  const [notifications, setNotifications] = useState({ email: true, sms: false });

// token
const getEmailFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('No token found. Please log in again.');
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    // The email is stored in the 'sub' claim of your JWT
    return decodedToken.sub;
  } catch (error) {
    console.error('Error decoding token:', error);
    toast.error('Error accessing user information');
    return null;
  }
};

// togglepassword
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  //handle personal info

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
        const response = await fetch('https://stockproject-2c1r.onrender.com/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ name, email, password, confirm_password: confirmPassword }),  
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
        } else {
            throw new Error(data.detail || 'Failed to save personal info');
        }
    } catch (error) {
        alert(error.message);
    }
};

//handle preferences

const handleSavePreferences = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('https://stockproject-2c1r.onrender.com/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                email, 
                chatbot_tone: chatbotTone,
                notifications
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
        } else {
            throw new Error(data.detail || 'Failed to save preferences');
        }
    } catch (error) {
        alert(error.message);
    }
};

//handle deletion of account'
const handleDeleteAccount = async () => {
  const isConfirmed = window.confirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );

  if (!isConfirmed) {
    return;
  }

  const userEmail = getEmailFromToken();
  if (!userEmail) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `https://stockproject-2c1r.onrender.com/user/delete?email=${encodeURIComponent(userEmail)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete account');
    }

    const data = await response.json();
    
    // Call the logout handler to update the auth state
    onLogout();
    
    // Show success message
    toast.success('Account successfully deleted');
    
    // Redirect to login page
    navigate('/login');
  } catch (error) {
    console.error('Delete account error:', error);
    toast.error(error.message || 'Failed to delete account');
  }
};

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="personal-info">
        <h2>Personal Information And Password Reset</h2>
        <form onSubmit={handleSavePersonalInfo}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                cursor: 'pointer'
              }}
            >
              {showPassword ? '👁️' : '🙈'}
            </span>
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </section>

      <section className="chatbot-preferences">
        <h2>Chatbot Preferences</h2>
        <form onSubmit={handleSavePreferences}>
          <label>
            Chatbot Tone:
            <select
              value={chatbotTone}
              onChange={(e) => setChatbotTone(e.target.value)}
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="neutral">Neutral</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
            />
            Receive Email Notifications
          </label>
          {/* <label>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
            />
            Receive SMS Notifications
          </label> */}
          <button type="submit">Save Preferences</button>
        </form>
      </section>

      <section className="danger-zone">
        <h2>Danger Zone</h2>
        <button onClick={handleDeleteAccount} className="delete-account">
          Delete Account
        </button>

      <Link to="/cancel">
       <button className="cancel-account">Cancel Account</button>
       </Link>
      
      </section>
    </div>
  );
};

export default SettingsPage;