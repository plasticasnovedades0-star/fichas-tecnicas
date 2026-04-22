import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Menu, X } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const { isDark } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Operario', path: '/operario' },
    { name: 'Comercial', path: '/comercial' },
    { name: 'Admin', path: '/admin' },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <img src="/logo.png" alt="Logo" style={{ height: '35px', borderRadius: '4px' }} />
        <span>Fichas Técnicas</span> 
      </Link>
      
      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path}
            className={location.pathname === link.path ? 'active' : ''}
            onClick={closeMenu}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
