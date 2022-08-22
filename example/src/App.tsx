import React from 'react';
import StockChart from 'stockchart-visx';
import './App.css';

function App() {
  return (
    <div className="App">
      <StockChart width={1200} height={800} />
    </div>
  );
}

export default App;
