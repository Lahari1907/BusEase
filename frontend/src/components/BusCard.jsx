import React from 'react';
import { useNavigate } from 'react-router-dom';

const BusCard = ({ schedule, onSelectSeats }) => {
  const navigate = useNavigate();

  if (!schedule) return null;

  const {
    id,
    bus,
    route,
    departureTime,
    arrivalTime,
    price,
    availableSeatsCount = 20,
    boardingPoints = [],
    droppingPoints = []
  } = schedule;

  const handleSelectSeatClick = () => {
    if (onSelectSeats) {
      onSelectSeats(schedule);
    } else {
      navigate(`/seat-selection/${id}`);
    }
  };

  const handleViewDetails = () => {
    navigate(`/bus/${id}`);
  };

  return (
    <div className="bus-card">
      <div className="bus-card-header">
        <div className="bus-info-group">
          <h3 className="bus-name">{bus?.busName || 'Express Bus'}</h3>
          <span className="bus-type-tag">{bus?.busType || 'AC Sleeper'}</span>
          <span className="bus-number-badge">{bus?.busNumber || 'MH-12-1234'}</span>
        </div>
        <div className="bus-rating-badge">
          ⭐ {bus?.rating || '4.5'}
        </div>
      </div>

      <div className="bus-card-body">
        {/* Departure Time & Source */}
        <div className="time-location-block departure">
          <span className="time">{departureTime || '06:00 AM'}</span>
          <span className="city">{route?.source || 'Source'}</span>
          <span className="sub-point">{boardingPoints[0] || 'Main Stand'}</span>
        </div>

        {/* Journey Duration Line */}
        <div className="journey-duration-block">
          <span className="duration-text">{route?.durationHours || '4h 00m'}</span>
          <div className="duration-line">
            <span className="line-dot start"></span>
            <span className="line-bar"></span>
            <span className="line-dot end"></span>
          </div>
          <span className="distance-text">{route?.distanceKm ? `${route.distanceKm} km` : 'Direct'}</span>
        </div>

        {/* Arrival Time & Destination */}
        <div className="time-location-block arrival">
          <span className="time">{arrivalTime || '10:00 AM'}</span>
          <span className="city">{route?.destination || 'Destination'}</span>
          <span className="sub-point">{droppingPoints[0] || 'Central Bus Stop'}</span>
        </div>

        {/* Price & Action Section */}
        <div className="bus-card-price-action">
          <div className="price-tag-group">
            <span className="starts-from">Starts from</span>
            <span className="price-val">₹{price}</span>
            <span className="seat-count-tag">{availableSeatsCount} Seats Left</span>
          </div>
          <div className="action-buttons-group">
            <button className="btn-details-outline" onClick={handleViewDetails}>
              Trip Info
            </button>
            <button className="btn-select-seats" onClick={handleSelectSeatClick}>
              Select Seat
            </button>
          </div>
        </div>
      </div>

      {/* Amenities Bar */}
      {bus?.amenities && bus.amenities.length > 0 && (
        <div className="bus-card-footer">
          <span className="amenity-label">Amenities:</span>
          <div className="amenities-list">
            {bus.amenities.map((item, idx) => (
              <span key={idx} className="amenity-chip">
                {item === 'WiFi' ? '📶 ' : item === 'Charging Point' ? '🔌 ' : item === 'Water Bottle' ? '🥤 ' : '✨ '}
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCard;
