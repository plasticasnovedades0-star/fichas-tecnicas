import React, { useState, useEffect } from 'react';
import { Search, Eye, Download } from 'lucide-react';
import { supabase } from '../supabase/client';

// Detecta si el tipo es Excel (puede venir como "Excel" o "Sobresalir")
const isExcelType = (type) => {
  const t = (type || '').toLowerCase();
  return t === 'excel' || t === 'sobresalir';
};

export default function ComercialView() {
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
          Vista Comercial
        </h2>
        
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text"
            className="input-base search-input"
            placeholder="Buscar por descripción o referencia..."
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
                  <th style={{ textAlign: 'right' }}>Acciones</th>
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
                    <td data-label="Acciones" className="td-action">
                      {file.file_url ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <a href={file.file_url} target="_blank" rel="noreferrer">
                            <button className="btn-primary" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', cursor: 'pointer' }}>
                              <Eye size={16} />
                            </button>
                          </a>
                          <a href={file.file_url} download={file.file_url.split('/').pop()} target="_blank" rel="noreferrer">
                            <button className="btn-primary" style={{ padding: '0.5rem', cursor: 'pointer' }}>
                              <Download size={16} />
                            </button>
                          </a>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.5rem' }}>Sin archivo</span>
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
