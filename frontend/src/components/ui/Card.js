// src/components/ui/card.js
import React from 'react';

export const CardHeader = ({ children }) => {
  return <div className="card-header">{children}</div>;
}

export const CardTitle = ({ title }) => {
  return <h2 className="card-title">{title}</h2>;
}

export const CardContent = ({ children }) => {
  return <div className="card-content">{children}</div>; // Add this definition
}

export const Card = ({ children }) => {
  return <div className="card">{children}</div>;
}
