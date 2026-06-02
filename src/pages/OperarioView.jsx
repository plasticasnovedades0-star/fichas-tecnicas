import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { supabase } from '../supabase/client';

// Detecta si el tipo es Excel (puede venir como "Excel" o "Sobresalir")
const isExcelType = (type) => {
  const t = (type || '').toLowerCase();
  return t === 'excel' || t === 'sobresalir';
};

export default function OperarioView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchFiles() {
    setLoading(true);
    const { data, error } = await supabase.from('fichas').select('*');
    if (error) {
      console.error('Error fetching files:', error);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  // Referencias que ya tienen un PDF → los Excel con esa referencia se ocultan
  const referencesWithPDF = new Set(
    files
      .filter(f => (f.type || '').toLowerCase() === 'pdf')
      .map(f => (f.reference || '').toLowerCase())
  );

  const visibleFiles = files.filter(f => {
    if (isExcelType(f.type) && referencesWithPDF.has((f.reference || '').toLowerCase())) {
      return false; // Ocultar Excel si existe PDF con la misma referencia
    }
    return true;
  });

  const filteredFiles = visibleFiles.filter(f => 
    (f.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="card-glass">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Vista Operario 
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(Solo lectura)</span>
        </h2>
        
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Search size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="input-base"
            placeholder="Buscar por descripción o referencia..."
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos desde Supabase...</div>
          ) : (
            <table className="file-list">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td data-label="Referencia" style={{ fontWeight: 600 }}>{file.reference}</td>
                    <td data-label="Descripción">{file.description}</td>
                    <td data-label="Tipo">
                      <span className={`type-badge ${isExcelType(file.type) ? 'type-excel' : 'type-pdf'}`}>
                        {file.type}
                      </span>
                    </td>
                    <td data-label="Acción" className="td-action">
                      {file.file_url ? (
                        <a href={file.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <button className="btn-primary btn-version">
                            <Eye size={16} /> Versión
                          </button>
                        </a>
                      ) : (
                        <button disabled className="btn-primary btn-version" style={{ opacity: 0.5 }}>
                          Sin Archivo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredFiles.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No se encontraron resultados en la base de datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
