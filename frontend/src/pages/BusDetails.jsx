import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import busApi from '../api/busApi';
import SkeletonLoader from '../components/SkeletonLoader';

const BusDetails = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await busApi.getScheduleById(scheduleId);
        setSchedule(data);
      } catch (err) {
        console.error('Failed to load schedule details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [scheduleId]);

  if (loading) {
    return (
      <div className="bus-details-container">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="bus-details-container text-center">
        <h2>Schedule Not Found</h2>
        <button className="btn-primary" onClick={() => navigate('/search')}>Back to Search</button>
      </div>
    );
  }

  const { bus, route, departureTime, arrivalTime, price, boardingPoints = [], droppingPoints = [] } = schedule;

  return (
    <div className="bus-details-container">
      {/* Header Banner */}
      <div className="details-header-card">
        <div className="header-top-row">
          <div>
            <h1>{bus?.busName || 'Express Bus'}</h1>
            <p className="bus-subtext">{bus?.busType} | {bus?.busNumber}</p>
          </div>
          <div className="header-price-tag">
            <span className="price-label">Fare per seat</span>
            <span className="price-amount">₹{price}</span>
          </div>
        </div>

        <div className="route-timeline-banner">
          <div className="timeline-point">
            <span className="time">{departureTime}</span>
            <span className="city">{route?.source}</span>
          </div>
          <div className="timeline-arrow">
            <span>{route?.durationHours}</span>
            <div className="arrow-line">➔</div>
          </div>
          <div className="timeline-point">
            <span className="time">{arrivalTime}</span>
            <span className="city">{route?.destination}</span>
          </div>
        </div>

        <button
          className="btn-proceed-seats-hero"
          onClick={() => navigate(`/seat-selection/${schedule.id}`)}
        >
          💺 Select Seats & Reserve Now
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="details-tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          📍 Boarding & Dropping Points
        </button>
        <button
          className={`tab-btn ${activeTab === 'amenities' ? 'active' : ''}`}
          onClick={() => setActiveTab('amenities')}
        >
          ✨ Amenities & Facilities
        </button>
        <button
          className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`}
          onClick={() => setActiveTab('policy')}
        >
          📜 Cancellation & Refund Policy
        </button>
      </div>

      {/* Tab Content */}
      <div className="details-content-card">
        {activeTab === 'itinerary' && (
          <div className="tab-pane-itinerary">
            <div className="points-column">
              <h3>📍 Boarding Locations</h3>
              <ul className="points-list">
                {boardingPoints.map((pt, idx) => (
                  <li key={idx}>
                    <span className="bullet"></span>
                    <span className="pt-name">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="points-column">
              <h3>🏁 Dropping Locations</h3>
              <ul className="points-list">
                {droppingPoints.map((pt, idx) => (
                  <li key={idx}>
                    <span className="bullet drop"></span>
                    <span className="pt-name">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="tab-pane-amenities">
            <h3>Included Onboard Amenities</h3>
            <div className="amenities-grid-view">
              {bus?.amenities ? (
                bus.amenities.map((item, idx) => (
                  <div key={idx} className="amenity-grid-card">
                    <span className="amenity-icon">
                      {item === 'WiFi' ? '📶' : item === 'Charging Point' ? '🔌' : item === 'Water Bottle' ? '🥤' : '✨'}
                    </span>
                    <span className="amenity-title">{item}</span>
                  </div>
                ))
              ) : (
                <p>Standard amenities included.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="tab-pane-policy">
            <h3>Standard Cancellation Charges</h3>
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Time of Cancellation</th>
                  <th>Cancellation Charge</th>
                  <th>Refund Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>More than 24 hours before departure</td>
                  <td>10% fee</td>
                  <td className="refund-green">90% Refund</td>
                </tr>
                <tr>
                  <td>Between 12 and 24 hours before departure</td>
                  <td>30% fee</td>
                  <td className="refund-orange">70% Refund</td>
                </tr>
                <tr>
                  <td>Less than 12 hours before departure</td>
                  <td>100% fee</td>
                  <td className="refund-red">No Refund</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusDetails;
