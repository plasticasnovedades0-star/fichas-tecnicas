import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Importación de Componentes Placeholder (los crearemos enseguida)
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OperarioView from './pages/OperarioView';
import ComercialView from './pages/ComercialView';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/operario" element={<OperarioView />} />
          <Route path="/comercial" element={<ComercialView />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
