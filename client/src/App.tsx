import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./layouts/MainLayout.tsx";
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
