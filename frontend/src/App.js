import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/Homepage/HomePage';
import Login from './pages/Login/Login';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import Chat from './pages/Chat/Chat';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import BillingPage from './pages/BillingPage/BillingPage';
import SupportPage from './pages/SupportPage/SupportPage';
import LogoutPage from './pages/LogoutPage/LogoutPage';
import CancellationPage from './pages/CancellationPage/CancellationPage';
import Confirmation from './pages/ConfirmationPage/ConfirmationPage';
import PricingPage from './pages/PricingPage/PricingPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={<Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/confirmation" 
              element={<Confirmation />} 
            />
            <Route 
              path="/chat" 
              element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated ? <SettingsPage onLogout={handleLogout}  /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/billing" 
              element={isAuthenticated ? <BillingPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/support" 
              element={isAuthenticated ? <SupportPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/logout" 
              element={isAuthenticated ? <LogoutPage onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/pricing" 
              element={isAuthenticated ? <PricingPage /> : <Navigate to="/login" />} 
            />
            <Route path="/cancel" element={<CancellationPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
