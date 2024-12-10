// src/components/ui/alert.js

import React from 'react';

export const Alert = ({ children, variant = "default" }) => (
  <div className={`alert alert-${variant}`}>
    {children}
  </div>
);

export const AlertTitle = ({ children }) => (
  <h2 className="alert-title">{children}</h2>
);

export const AlertDescription = ({ children }) => (
  <p className="alert-description">{children}</p>
);
