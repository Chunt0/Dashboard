import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/NavBar';
import Video from './pages/Video';
import Image from './pages/Image';
import View from './pages/View';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/video" element={<Video />} />
          <Route path="/image" element={<Image />} />
          <Route path="/view" element={<View />} />
          <Route path="*" element={<Video />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
