import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchBuses } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/helpers';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [source, setSource] = useState(searchParams.get('source') || 'Mumbai');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Pune');
  const [date, setDate] = useState(searchParams.get('date') || '2026-09-15');

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterBusType, setFilterBusType] = useState('ALL');
  const [sortBy, setSortBy] = useState('PRICE_LOW');

  const popularRoutes = [
    { src: 'Mumbai', dest: 'Pune' },
    { src: 'Bangalore', dest: 'Hyderabad' },
    { src: 'Delhi', dest: 'Jaipur' },
    { src: 'Chennai', dest: 'Bangalore' },
    { src: 'Mumbai', dest: 'Goa' },
  ];

  const fetchSchedules = async (srcVal, destVal, dateVal) => {
    setLoading(true);
    try {
      const data = await searchBuses(srcVal, destVal, dateVal);
      setSchedules(data || []);
    } catch (err) {
      console.error('Failed to fetch bus schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(source, destination, date);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ source, destination, date });
    fetchSchedules(source, destination, date);
  };

  const handlePopularRouteClick = (srcVal, destVal) => {
    setSource(srcVal);
    setDestination(destVal);
    setSearchParams({ source: srcVal, destination: destVal, date });
    fetchSchedules(srcVal, destVal, date);
  };

  const swapSourceDestination = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Filter & Sort logic
  let filteredSchedules = [...schedules];
  if (filterBusType !== 'ALL') {
    filteredSchedules = filteredSchedules.filter((s) => {
      const typeStr = s.bus?.busType?.toUpperCase() || '';
      if (filterBusType === 'AC') return typeStr.includes('AC');
      if (filterBusType === 'SLEEPER') return typeStr.includes('SLEEPER');
      if (filterBusType === 'SEATER') return typeStr.includes('SEATER');
      return true;
    });
  }

  if (sortBy === 'PRICE_LOW') {
    filteredSchedules.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'PRICE_HIGH') {
    filteredSchedules.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'RATING') {
    filteredSchedules.sort((a, b) => (b.bus?.rating || 0) - (a.bus?.rating || 0));
  } else if (sortBy === 'DEPARTURE') {
    filteredSchedules.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }

  const handleSelectSeats = (schedule) => {
    navigate('/seats', { state: { schedule } });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Search Hero Header Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">India's #1 Bus Booking Platform</h1>
            <p className="text-blue-100 text-sm sm:text-base">Search schedules, lock seats with Redis, and book instantly</p>
          </div>

          {/* Search Bar Widget */}
          <Card className="bg-white text-slate-800 p-4 sm:p-6 shadow-xl border-0">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-3 items-end">
              
              {/* FROM Input */}
              <div className="lg:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span>📍</span> From
                </label>
                <input
                  type="text"
                  placeholder="Source City (e.g. Mumbai)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              {/* Swap Button */}
              <div className="hidden lg:flex lg:col-span-1 justify-center pb-1">
                <button
                  type="button"
                  onClick={swapSourceDestination}
                  className="p-2.5 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
                  title="Swap Cities"
                >
                  🔄
                </button>
              </div>

              {/* TO Input */}
              <div className="lg:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span>🏁</span> To
                </label>
                <input
                  type="text"
                  placeholder="Destination City (e.g. Pune)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              {/* DATE Input */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span>📅</span> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              {/* Submit Button */}
              <div className="lg:col-span-1">
                <Button type="submit" variant="primary" className="w-full py-2.5 text-sm font-bold">
                  Search
                </Button>
              </div>
            </form>
          </Card>

          {/* Popular Routes Quick Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Popular:</span>
            {popularRoutes.map((r, idx) => (
              <button
                key={idx}
                onClick={() => handlePopularRouteClick(r.src, r.dest)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  source === r.src && destination === r.dest
                    ? 'bg-amber-400 text-slate-900 font-bold shadow'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {r.src} ➔ {r.dest}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-4">
            <Card className="p-5 space-y-5">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <span>⚙️</span> Filters & Sorting
              </h3>

              {/* Bus Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Bus Type</label>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                  {[
                    { id: 'ALL', label: 'All Buses' },
                    { id: 'AC', label: 'AC Buses' },
                    { id: 'SLEEPER', label: 'Sleeper' },
                    { id: 'SEATER', label: 'Seater' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFilterBusType(type.id)}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl text-left transition-all ${
                        filterBusType === type.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="RATING">Highest Rating</option>
                  <option value="DEPARTURE">Departure Time</option>
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <span className="font-bold block">🔒 Redis Seat Locking</span>
                <p className="text-amber-700 leading-relaxed">
                  Seats are locked for 5 minutes during checkout to ensure zero double-booking.
                </p>
              </div>
            </Card>
          </aside>

          {/* Schedules List */}
          <main className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-lg font-bold text-slate-800">
                Available Buses ({filteredSchedules.length})
                {source && destination && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    {source} ➔ {destination}
                  </span>
                )}
              </h2>
            </div>

            {loading ? (
              <Loader label="Searching available bus schedules..." />
            ) : filteredSchedules.length > 0 ? (
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <Card key={schedule.id} className="p-5 hover:border-blue-200 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      {/* Bus Info */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">{schedule.bus?.busName || 'Express Bus'}</h3>
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            ⭐ {schedule.bus?.rating || '4.5'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{schedule.bus?.busType || 'AC Sleeper'}</p>

                        <div className="flex items-center gap-4 pt-2 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{schedule.departureTime}</span>
                            <span className="block text-slate-400">{schedule.route?.source || source}</span>
                          </div>
                          <span className="text-slate-300">➔</span>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{schedule.arrivalTime}</span>
                            <span className="block text-slate-400">{schedule.route?.destination || destination}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Select Seats Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-2">
                        <div className="text-left sm:text-right">
                          <span className="text-xs text-slate-400 block">Starting from</span>
                          <span className="text-xl font-extrabold text-blue-600">
                            {formatCurrency(schedule.price)}
                          </span>
                        </div>

                        <Button
                          onClick={() => handleSelectSeats(schedule)}
                          variant="primary"
                          size="sm"
                          className="font-bold"
                        >
                          Select Seats ➔
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12 space-y-3">
                <div className="text-4xl">🚌</div>
                <h3 className="text-lg font-bold text-slate-800">No Buses Found for this Route</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Try searching for popular routes like Mumbai ➔ Pune or Bangalore ➔ Hyderabad.
                </p>
                <Button onClick={() => handlePopularRouteClick('Mumbai', 'Pune')} variant="outline" size="sm">
                  Reset to Mumbai ➔ Pune
                </Button>
              </Card>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};

export default Search;
