import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="container">
      <div className="card-glass" style={{ textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Bienvenido a Fichas Técnicas Novedades Plásticas</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          Selecciona tu perfil de acceso para continuar a la gestión de archivos.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/operario" style={{ textDecoration: 'none' }}>
            <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer' }}>
              <User size={24} color="var(--primary-color)" />
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Perfil Operario</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Solo visualización y búsqueda</span>
              </div>
            </div>
          </Link>

          <Link to="/comercial" style={{ textDecoration: 'none' }}>
            <div className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer' }}>
              <Briefcase size={24} color="var(--primary-color)" />
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Perfil Comercial</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Búsqueda, visualización y descarga rápida</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
