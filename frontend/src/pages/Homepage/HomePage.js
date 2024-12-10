import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HomePage.scss';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    toast.dismiss();

    try {
      const response = await fetch('https://stockproject-2c1r.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      toast.success('User created successfully!');
      navigate('/confirmation');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="home-page">
      <h1>Welcome to StockApp!</h1>
      <h2>Discover our services for stock and investment queries.</h2>
      <p>Sign up today and start chatting!</p>
      
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className='button-on' type="submit">Sign Up</button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default HomePage;
