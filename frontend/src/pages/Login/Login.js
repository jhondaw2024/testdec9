import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './Login.scss';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      onLogin(token); // Pass the token to onLogin
      navigate('/chat');
    }
  }, [onLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'https://stockproject-2c1r.onrender.com/login' : 'https://stockproject-2c1r.onrender.com/register';
   
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.detail || (isLogin ? 'Login failed' : 'Sign-up failed'));
        return;
      }

      if (isLogin) {
        if (data.access_token) {
          // First store the token
          localStorage.setItem('token', data.access_token);
          
          // Then call onLogin with the token
          onLogin(data.access_token);
          
          // Show success message
          toast.success('Login successful!');
          
          // Finally navigate
          navigate('/chat');
        } else {
          toast.error('No access token received');
        }
      } else {
        toast.success('Account created successfully! Please check your email for confirmation.');
        navigate('/confirmation');
        setTimeout(() => {
          navigate('/login');
        }, 7000);
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <div className="home-page">
      <h1>Welcome to StockApp!</h1>
      <p>Discover our services for stock and investment queries.</p>
      <h2>{isLogin ? 'Log in to your account' : 'Sign up today and start chatting!'}</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      <div className="toggle-auth">
        {isLogin ? (
          <p>Don't have an account? <span className="button-signup" onClick={() => setIsLogin(false)}>Sign Up</span></p>
        ) : (
          <p>Already have an account? <span className="button-signup" onClick={() => setIsLogin(true)}>Log In</span></p>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover />
    </div>
  );
};

export default Login;