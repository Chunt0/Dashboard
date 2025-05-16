import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./layouts/MainLayout.tsx";
import './App.css';
//import Navbar from './components/Nav/Navbar';
//import Uploading from "./pages/Uploading";
//import QualityAssurance from "./pages/QualityAssurance.tsx";
//import Training from "./pages/Training.tsx";
//import Splash from "./pages/Splash.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
