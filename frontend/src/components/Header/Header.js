import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header = ({ isAuthenticated }) => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">StockApp</Link>
      </div>
      <nav>
        <ul>
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/dashboard">
                  <button className="nav-button">Dashboard</button>
                </Link>
              </li>
              <li>
                <Link to="/chat">
                  <button className="nav-button">Chat</button>
                </Link>
              </li>
              <li>
                <Link to="/settings">
                  <button className="nav-button">Settings</button>
                </Link>
              </li>
              <li>
                <Link to="/support">
                  <button className="nav-button">Support</button>
                </Link>
              </li>
              <li>
                <Link to="/pricing">
                  <button className="nav-button">Pricing</button>
                </Link>
              </li>

            
              <li>
                <Link to="/logout">
                  <button className="nav-button">Logout</button>
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">
                <button className="nav-button">Login</button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
