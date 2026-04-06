import React from 'react';

const BusinessMetrics = ({ characters, totalRevenue, generatedImages }) => {
  const getOccupancyStatus = () => {
    const count = characters.length;
    if (count === 0) return { text: 'Empty', color: '#ff6600' };
    if (count <= 3) return { text: 'Low', color: '#ffaa00' };
    if (count <= 6) return { text: 'Moderate', color: '#ffff00' };
    return { text: 'Busy', color: '#00ff88' };
  };

  const occupancy = getOccupancyStatus();
  const customersServed = characters.filter(c => c.hasOrdered).length;
  const activeOrders = characters.filter(c => c.state === 'ordering' || c.state === 'waiting').length;

  return (
    <div className="business-metrics">
      <h3>🚀 Orbital Cafe Status</h3>
      
      <div className="metric-row">
        <span>Revenue:</span>
        <span className="metric-value">{Math.round(totalRevenue)} CR</span>
      </div>
      
      <div className="metric-row">
        <span>Customers Served:</span>
        <span className="metric-value">{customersServed}</span>
      </div>
      
      <div className="metric-row">
        <span>Current Occupancy:</span>
        <span className="metric-value" style={{ color: occupancy.color }}>
          {characters.length}/8 ({occupancy.text})
        </span>
      </div>
      
      <div className="metric-row">
        <span>Active Orders:</span>
        <span className="metric-value">{activeOrders}</span>
      </div>
      
      <div className="metric-row">
        <span>Images Generated:</span>
        <span className="metric-value">{generatedImages.length}</span>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        <div>🌍 Earth Orbit Station</div>
        <div>⚡ All Systems Nominal</div>
        <div>🔄 Auto-Refresh: ON</div>
      </div>
    </div>
  );
};

export default BusinessMetrics;
