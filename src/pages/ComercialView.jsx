import React, { useState } from 'react';
import { Search, Eye, Download } from 'lucide-react';

export default function ComercialView() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockFiles = [
    { id: 1, reference: 'REF-001', description: 'Manual de Ensamblaje', type: 'PDF' },
    { id: 2, reference: 'REF-002', description: 'Reporte de Ventas Q1', type: 'Excel' },
    { id: 3, reference: 'REF-003', description: 'Catálogo de Productos 2026', type: 'PDF' }
  ];

  const filteredFiles = mockFiles.filter(f => 
    f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="card-glass">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Vista Comercial
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
                  <td style={{ fontWeight: 600 }}>{file.reference}</td>
                  <td>{file.description}</td>
                  <td>
                    <span style={{ 
                      background: file.type === 'PDF' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                      color: file.type === 'PDF' ? '#ef4444' : '#10b981', 
                      padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 
                    }}>
                      {file.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn-primary" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>
                      <Eye size={16} />
                    </button>
                    <button className="btn-primary" style={{ padding: '0.5rem' }}>
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
