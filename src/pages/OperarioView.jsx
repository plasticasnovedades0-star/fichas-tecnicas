import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { supabase } from '../supabase/client';

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

  const filteredFiles = files.filter(f => 
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

        <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ fontWeight: 600 }}>{file.reference}</td>
                    <td>{file.description}</td>
                    <td>
                      <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                        {file.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {file.file_url ? (
                        <a href={file.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                            <Eye size={16} /> Ver
                          </button>
                        </a>
                      ) : (
                        <button disabled className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', opacity: 0.5 }}>
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
