import React, { useState, useEffect } from 'react';
import busApi from '../api/busApi';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('buses');

  // Data states
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form states
  const [showBusModal, setShowBusModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New Bus form
  const [busForm, setBusForm] = useState({
    busName: '',
    busNumber: '',
    busType: 'AC Sleeper (2+1)',
    totalSeats: 30
  });

  // New Route form
  const [routeForm, setRouteForm] = useState({
    source: '',
    destination: '',
    distanceKm: 250,
    durationHours: '4h 30m'
  });

  // New Schedule form
  const [schedForm, setSchedForm] = useState({
    busId: '',
    routeId: '',
    departureTime: '08:00 AM',
    arrivalTime: '01:30 PM',
    departureDate: '2026-09-15',
    price: 750
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [busesData, routesData, schedsData] = await Promise.all([
        busApi.getAllBuses(),
        busApi.getAllRoutes(),
        busApi.getAllSchedules()
      ]);
      setBuses(busesData || []);
      setRoutes(routesData || []);
      setSchedules(schedsData || []);

      if (busesData?.length > 0 && routesData?.length > 0) {
        setSchedForm((prev) => ({
          ...prev,
          busId: busesData[0].id,
          routeId: routesData[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handlers for Buses CRUD
  const handleCreateBus = async (e) => {
    e.preventDefault();
    try {
      const created = await busApi.createBus(busForm);
      setBuses((prev) => [created, ...prev]);
      setShowBusModal(false);
      setBusForm({ busName: '', busNumber: '', busType: 'AC Sleeper (2+1)', totalSeats: 30 });
      showToast('Bus fleet created successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create bus.', 'error');
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm('Delete this bus from fleet?')) return;
    try {
      await busApi.deleteBus(busId);
      setBuses((prev) => prev.filter((b) => b.id !== busId));
      showToast('Bus deleted successfully.', 'info');
    } catch (err) {
      showToast('Could not delete bus.', 'error');
    }
  };

  // Handlers for Routes CRUD
  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      const created = await busApi.createRoute(routeForm);
      setRoutes((prev) => [created, ...prev]);
      setShowRouteModal(false);
      setRouteForm({ source: '', destination: '', distanceKm: 250, durationHours: '4h 30m' });
      showToast('Route created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create route.', 'error');
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      await busApi.deleteRoute(routeId);
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
      showToast('Route deleted.', 'info');
    } catch (err) {
      showToast('Could not delete route.', 'error');
    }
  };

  // Handlers for Schedules CRUD
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      const created = await busApi.createSchedule(schedForm);
      setSchedules((prev) => [created, ...prev]);
      setShowScheduleModal(false);
      showToast('Schedule created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create schedule.', 'error');
    }
  };

  const handleDeleteSchedule = async (schedId) => {
    if (!window.confirm('Cancel and remove this schedule?')) return;
    try {
      await busApi.deleteSchedule(schedId);
      setSchedules((prev) => prev.filter((s) => s.id !== schedId));
      showToast('Schedule removed.', 'info');
    } catch (err) {
      showToast('Could not remove schedule.', 'error');
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header-banner">
        <div>
          <h2>⚙️ BusEase Admin Command Center</h2>
          <p>Manage Bus Fleets, Route Networks, Trip Schedules, & System Analytics</p>
        </div>
      </div>

      {/* Top Overview Analytics Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚌</div>
          <div className="stat-info">
            <span className="stat-val">{buses.length}</span>
            <span className="stat-label">Active Bus Fleets</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🗺️</div>
          <div className="stat-info">
            <span className="stat-val">{routes.length}</span>
            <span className="stat-label">Connected Routes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-val">{schedules.length}</span>
            <span className="stat-label">Active Schedules</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-val">₹1,48,900</span>
            <span className="stat-label">Total Platform Revenue</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs-bar">
        <button
          className={`admin-tab-btn ${activeTab === 'buses' ? 'active' : ''}`}
          onClick={() => setActiveTab('buses')}
        >
          🚌 Buses Management
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          🗺️ Routes Management
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          📅 Schedule Management
        </button>
      </div>

      {/* Tab 1: Buses Management */}
      {activeTab === 'buses' && (
        <div className="admin-content-panel">
          <div className="panel-header">
            <h3>Bus Fleet Directory</h3>
            <button className="btn-add-entity" onClick={() => setShowBusModal(true)}>
              ➕ Add New Bus
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bus Name</th>
                  <th>Plate Number</th>
                  <th>Bus Type</th>
                  <th>Capacity</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td className="bold">{b.busName}</td>
                    <td><span className="code-pill">{b.busNumber}</span></td>
                    <td>{b.busType}</td>
                    <td>{b.totalSeats} Seats</td>
                    <td>⭐ {b.rating || '4.5'}</td>
                    <td>
                      <button className="btn-table-delete" onClick={() => handleDeleteBus(b.id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Routes Management */}
      {activeTab === 'routes' && (
        <div className="admin-content-panel">
          <div className="panel-header">
            <h3>Route Network Directory</h3>
            <button className="btn-add-entity" onClick={() => setShowRouteModal(true)}>
              ➕ Add New Route
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Source City</th>
                  <th>Destination City</th>
                  <th>Distance</th>
                  <th>Est. Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td className="bold">{r.source}</td>
                    <td className="bold">{r.destination}</td>
                    <td>{r.distanceKm} km</td>
                    <td>{r.durationHours}</td>
                    <td>
                      <button className="btn-table-delete" onClick={() => handleDeleteRoute(r.id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Schedule Management */}
      {activeTab === 'schedules' && (
        <div className="admin-content-panel">
          <div className="panel-header">
            <h3>Daily Departure Schedules</h3>
            <button className="btn-add-entity" onClick={() => setShowScheduleModal(true)}>
              ➕ Schedule New Trip
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bus Name</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Fare Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td className="bold">{s.bus?.busName || 'Bus'}</td>
                    <td>{s.route?.source} ➔ {s.route?.destination}</td>
                    <td>{s.departureTime}</td>
                    <td>{s.arrivalTime}</td>
                    <td className="price-col">₹{s.price}</td>
                    <td>
                      <button className="btn-table-delete" onClick={() => handleDeleteSchedule(s.id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD BUS */}
      {showBusModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>🚌 Add New Bus Fleet</h3>
              <button className="close-btn" onClick={() => setShowBusModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateBus} className="admin-modal-form">
              <div className="form-group">
                <label>Bus Operator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Travels"
                  value={busForm.busName}
                  onChange={(e) => setBusForm({ ...busForm, busName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-AB-9999"
                  value={busForm.busNumber}
                  onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bus Seating Type</label>
                <select
                  value={busForm.busType}
                  onChange={(e) => setBusForm({ ...busForm, busType: e.target.value })}
                >
                  <option value="AC Sleeper (2+1)">AC Sleeper (2+1)</option>
                  <option value="AC Multi-Axle Volvo">AC Multi-Axle Volvo</option>
                  <option value="Non-AC Seater (2+2)">Non-AC Seater (2+2)</option>
                  <option value="Executive Sleeper">Executive Sleeper</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Seats</label>
                <input
                  type="number"
                  value={busForm.totalSeats}
                  onChange={(e) => setBusForm({ ...busForm, totalSeats: parseInt(e.target.value, 10) })}
                  required
                  min="10"
                  max="60"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowBusModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Bus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ROUTE */}
      {showRouteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>🗺️ Add New Route</h3>
              <button className="close-btn" onClick={() => setShowRouteModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateRoute} className="admin-modal-form">
              <div className="form-group">
                <label>Source City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={routeForm.source}
                  onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Destination City</label>
                <input
                  type="text"
                  placeholder="e.g. Goa"
                  value={routeForm.destination}
                  onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Distance (km)</label>
                  <input
                    type="number"
                    value={routeForm.distanceKm}
                    onChange={(e) => setRouteForm({ ...routeForm, distanceKm: parseInt(e.target.value, 10) })}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Est Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 6h 30m"
                    value={routeForm.durationHours}
                    onChange={(e) => setRouteForm({ ...routeForm, durationHours: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowRouteModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Route</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SCHEDULE */}
      {showScheduleModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>📅 Schedule New Bus Departure</h3>
              <button className="close-btn" onClick={() => setShowScheduleModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateSchedule} className="admin-modal-form">
              <div className="form-group">
                <label>Select Bus Fleet</label>
                <select
                  value={schedForm.busId}
                  onChange={(e) => setSchedForm({ ...schedForm, busId: e.target.value })}
                  required
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>{b.busName} ({b.busNumber})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Route</label>
                <select
                  value={schedForm.routeId}
                  onChange={(e) => setSchedForm({ ...schedForm, routeId: e.target.value })}
                  required
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.source} ➔ {r.destination}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Departure Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM"
                    value={schedForm.departureTime}
                    onChange={(e) => setSchedForm({ ...schedForm, departureTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Arrival Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 02:30 PM"
                    value={schedForm.arrivalTime}
                    onChange={(e) => setSchedForm({ ...schedForm, arrivalTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Ticket Fare (₹)</label>
                <input
                  type="number"
                  value={schedForm.price}
                  onChange={(e) => setSchedForm({ ...schedForm, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Publish Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
