import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import BusCard from '../components/BusCard';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchState = location.state || {};

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchState.source || !searchState.destination || !searchState.date) {
      // If accessed directly without search state, redirect to Search page
      navigate('/');
      return;
    }

    const fetchSchedules = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await API.post('/schedules/search', {
          source: searchState.source,
          destination: searchState.destination,
          date: searchState.date,
        });
        setSchedules(response.data || []);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to fetch schedules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [searchState, navigate]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Available Buses</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Route: <strong>{searchState.source}</strong> to <strong>{searchState.destination}</strong> on <strong>{searchState.date}</strong>
          </p>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-outline">
          Modify Search
        </button>
      </div>

      {loading && <div className="alert alert-info">Searching for available buses...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && schedules.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3>No buses found for this route and date</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Try searching for another date or city pair.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Search
          </button>
        </div>
      )}

      {!loading && schedules.map((schedule) => (
        <BusCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
};

export default Results;
