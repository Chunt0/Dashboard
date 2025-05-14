import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Nav/Navbar';
import DataProcessing from "./pages/DataProcessing";
import QualityAssurance from "./pages/QualityAssurance.tsx";
import Training from "./pages/Training.tsx";
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/upload" element={<DataProcessing />} />
          <Route path="/qa" element={<QualityAssurance />} />
          <Route path="/train" element={<Training />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
