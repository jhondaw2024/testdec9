import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.scss';

const DashboardPage = () => {
  // Mock data for demonstration
  const recentQueries = [
    { id: 1, query: "AAPL stock performance" },
    { id: 2, query: "Best ETFs for 2024" },
    { id: 3, query: "Cryptocurrency market trends" },
  ];

  const recommendations = [
    "Review your portfolio diversification",
    "Check the latest market news",
    "Update your investment strategy",
  ];

  return (
    <div className="dashboard-page">
      <h1>Your Dashboard</h1>
      
      <div className="dashboard-content">
        <section className="recent-queries">
          <h2>Recent Queries</h2>
          <ul>
            {recentQueries.map(query => (
              <li key={query.id}>{query.query}</li>
            ))}
          </ul>
          <Link to="/chat" className="view-all">View all queries</Link>
        </section>

        <section className="recommendations">
          <h2>Recommendations</h2>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="buttons">
          <Link to="/chat" className="button">Start New Chat</Link>
          <Link to="/billing" className="button">Manage Subscription</Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
