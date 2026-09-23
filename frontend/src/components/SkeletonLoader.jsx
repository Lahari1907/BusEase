import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === 'bus-card') {
    return (
      <div className="skeleton-wrapper">
        {items.map((_, idx) => (
          <div className="skeleton-card" key={idx}>
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-subtitle"></div>
            <div className="skeleton-row">
              <div className="skeleton-box"></div>
              <div className="skeleton-box"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'seat-grid') {
    return (
      <div className="skeleton-seat-grid">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-grid">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div key={idx} className="skeleton-seat-block"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-wrapper">
      {items.map((_, idx) => (
        <div className="skeleton-line" key={idx} style={{ height: '40px', marginBottom: '12px' }}></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
