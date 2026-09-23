import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination || !date) return;
    
    // Navigate to Results page with search parameters in state
    navigate('/results', { state: { source, destination, date } });
  };

  return (
    <div className="form-container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h2 className="form-title">Search Bus Schedules</h2>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Source City</label>
            <input
              type="text"
              className="form-control"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
              placeholder="e.g. New York, Mumbai, Delhi"
            />
          </div>

          <div className="form-group">
            <label>Destination City</label>
            <input
              type="text"
              className="form-control"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              placeholder="e.g. Boston, Pune, Jaipur"
            />
          </div>

          <div className="form-group">
            <label>Travel Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            🔍 Search Buses
          </button>
        </form>
      </div>
    </div>
  );
};

export default Search;
