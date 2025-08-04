// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Future: <Route path="/history" element={<ReportHistory />} /> */}
    </Routes>
  );
}

export default App;
