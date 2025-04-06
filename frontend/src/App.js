import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Stream from './Stream';
import Confirm from './Confirm';
import HomePage from './HomePage';
import SupportNetwork from './SupportNetwork';
import ShowAllUsers from './ShowAllUsers';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/stream" element={<Stream />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/supportnetwork" element={<SupportNetwork />} />
        <Route path="/showallusers" element={<ShowAllUsers />} />
      </Routes>
    </Router>
  );
}

export default App;
