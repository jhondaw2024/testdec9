// src/components/ui/button.js
import React from 'react';

export const Button=({ onClick, children, style = {} })=>{
  return (
    <button onClick={onClick} className="button" style={style}>
      {children}
    </button>
  );
}
