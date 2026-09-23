import React from 'react';

const SeatGrid = ({
  totalSeats = 28,
  bookedSeats = [],
  lockedSeats = [],
  selectedSeats = [],
  onSeatClick,
  lockingSeatNumber = null
}) => {
  // Generate seats array
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  // Group seats into pairs for left side (Window + Aisle) and right side (Aisle + Window)
  // Standard 2 + 2 layout with center gangway aisle
  const rows = [];
  for (let i = 0; i < totalSeats; i += 4) {
    rows.push({
      leftWindow: seats[i] || null,
      leftAisle: seats[i + 1] || null,
      rightAisle: seats[i + 2] || null,
      rightWindow: seats[i + 3] || null,
    });
  }

  const getSeatStatus = (seatNo) => {
    if (!seatNo) return 'empty';
    if (bookedSeats.includes(seatNo)) return 'booked';
    if (lockedSeats.includes(seatNo)) return 'locked';
    if (selectedSeats.includes(seatNo)) return 'selected';
    return 'available';
  };

  const renderSeatButton = (seatNo) => {
    if (!seatNo) return <div className="seat-spacer" key="spacer" />;

    const status = getSeatStatus(seatNo);
    const isLocking = lockingSeatNumber === seatNo;

    let buttonClass = 'bus-seat-btn';
    if (status === 'available') buttonClass += ' seat-available';
    if (status === 'selected') buttonClass += ' seat-selected';
    if (status === 'locked') buttonClass += ' seat-locked';
    if (status === 'booked') buttonClass += ' seat-booked';

    const isDisabled = status === 'booked' || status === 'locked' || isLocking;

    return (
      <button
        key={seatNo}
        type="button"
        className={buttonClass}
        disabled={isDisabled}
        onClick={() => onSeatClick(seatNo)}
        title={`Seat ${seatNo} - ${status.toUpperCase()}`}
      >
        <span className="seat-icon">💺</span>
        <span className="seat-num">{isLocking ? '...' : seatNo < 10 ? `0${seatNo}` : seatNo}</span>
      </button>
    );
  };

  return (
    <div className="seat-grid-container">
      {/* Legend header */}
      <div className="seat-legend-bar">
        <div className="legend-item">
          <span className="legend-color-box legend-available"></span>
          <span className="legend-text">Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box legend-selected"></span>
          <span className="legend-text">Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box legend-locked"></span>
          <span className="legend-text">Locked (Redis)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box legend-booked"></span>
          <span className="legend-text">Booked</span>
        </div>
      </div>

      {/* Bus Shell Container */}
      <div className="bus-cabin-frame">
        {/* Front Dashboard & Driver */}
        <div className="bus-front-cabin">
          <div className="driver-dashboard">
            <span className="driver-icon">☸️</span>
            <span className="driver-label">DRIVER</span>
          </div>
          <div className="entry-door-label">DOOR 🚪</div>
        </div>

        {/* Seating Rows with Gangway Aisle */}
        <div className="bus-seats-body">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="bus-seat-row">
              {/* Left Column Pair */}
              <div className="seat-pair left-pair">
                {renderSeatButton(row.leftWindow)}
                {renderSeatButton(row.leftAisle)}
              </div>

              {/* Center Gangway Aisle */}
              <div className="gangway-aisle">
                <span className="aisle-row-number">R{rIdx + 1}</span>
              </div>

              {/* Right Column Pair */}
              <div className="seat-pair right-pair">
                {renderSeatButton(row.rightAisle)}
                {renderSeatButton(row.rightWindow)}
              </div>
            </div>
          ))}
        </div>

        {/* Rear Cabin */}
        <div className="bus-rear-cabin">
          <span>BACK OF BUS</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
