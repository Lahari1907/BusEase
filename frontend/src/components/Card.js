import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', onClick = null }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 ${padding} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default Card;
