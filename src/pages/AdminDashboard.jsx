import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun, Plus, Edit2, Trash2, Lock, X, Eye } from 'lucide-react';
import { supabase } from '../supabase/client';

export default function AdminDashboard() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Estado de datos Supabase
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para el Modal y Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFile, setNewFile] = useState({ reference: '', description: '', type: 'PDF' });
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated]);

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

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!selectedFileObj) {
      alert('Por favor selecciona un archivo primero.');
      return;
    }
    
    setIsSubmitting(true);
    
    // 1. Subir a Supabase Storage (Bucket "archivos")
    const fileExt = selectedFileObj.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('archivos')
      .upload(fileName, selectedFileObj);
      
    if (uploadError) {
      setIsSubmitting(false);
      console.error('Error subiendo archivo físico:', uploadError);
      alert('Error subiendo archivo físico. Verifica que tu bucket "archivos" sea PÚBLICO y que no tenga restricciones RLS estrictas (o actualiza tus políticas).');
      return;
    }
    
    // 2. Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('archivos')
      .getPublicUrl(fileName);
      
    const fileUrl = publicUrlData.publicUrl;
    
    // 3. Crear el registro en la base de datos apuntando a la URL
    const { error: dbError } = await supabase.from('fichas').insert([
      { 
        reference: newFile.reference, 
        description: newFile.description, 
        type: newFile.type,
        file_url: fileUrl
      }
    ]);

    if (dbError) {
      console.error('Error insertando ficha:', dbError);
      alert('Hubo un error al guardar en la base de datos Supabase.');
    } else {
      setNewFile({ reference: '', description: '', type: 'PDF' }); // limpiar
      setSelectedFileObj(null); // limpiar archivo
      document.getElementById('fileUploadInput').value = ''; 
      setIsModalOpen(false); // cerrar modal
      fetchFiles(); // refrescar lista
    }
    
    setIsSubmitting(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card-glass" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--primary-color)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
              <Lock size={32} />
            </div>
          </div>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Acceso Administrativo</h2>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            <input 
              type="text" 
              className="input-base" 
              placeholder="Usuario" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              className="input-base" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ position: 'relative' }}>
      {/* Modal Nueva Ficha */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card-glass" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Subir Nueva Ficha</h2>
            <form onSubmit={handleCreateFile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Referencia</label>
                <input 
                  type="text" 
                  className="input-base" 
                  placeholder="Ej: REF-001" 
                  required
                  value={newFile.reference}
                  onChange={(e) => setNewFile({...newFile, reference: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Descripción</label>
                <input 
                  type="text" 
                  className="input-base" 
                  placeholder="Manual de uso..." 
                  required
                  value={newFile.description}
                  onChange={(e) => setNewFile({...newFile, description: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tipo de Archivo</label>
                <select 
                  className="input-base"
                  style={{ cursor: 'pointer' }}
                  value={newFile.type}
                  onChange={(e) => setNewFile({...newFile, type: e.target.value})}
                >
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel</option>
                  <option value="Word">Word</option>
                  <option value="Imagen">Imagen</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              
              {/* CAMPO DE SELECCIÓN DE ARCHIVO */}
              <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Documento / Archivo Físico</label>
                 <input 
                   id="fileUploadInput"
                   type="file"
                   accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4"
                   className="input-base"
                   style={{ padding: '0.5rem' }}
                   required
                   onChange={(e) => setSelectedFileObj(e.target.files[0])}
                 />
              </div>

              <button disabled={isSubmitting} type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                {isSubmitting ? 'Subiendo archivo...' : 'Crear Registro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Panel Superior Admin */}
      <div className="card-glass" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Panel de Administración</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión de archivos y plataforma</span>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <button onClick={toggleTheme} className="btn-primary" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--glass-border)', flex: '1 1 auto', maxWidth: 'max-content' }}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />} 
            <span style={{ marginLeft: '0.5rem' }}>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
          <button className="btn-primary" style={{ flex: '1 1 auto', maxWidth: 'max-content' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Subir Archivo
          </button>
        </div>
      </div>

      <div className="card-glass">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Catálogo de Archivos</h3>
          <input 
            type="text" 
            className="input-base" 
            placeholder="Buscar para editar..." 
            style={{ maxWidth: '100%', flex: '1 1 250px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos desde Supabase...</div>
          ) : (
            <table className="file-list">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'center' }}>Ver</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {files.filter(f => (f.description || '').toLowerCase().includes(searchTerm.toLowerCase())).map(file => (
                  <tr key={file.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{file.reference}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{file.description}</td>
                    <td style={{ color: 'var(--text-main)' }}>{file.type}</td>
                    <td style={{ textAlign: 'center' }}>
                      {file.file_url ? (
                        <a href={file.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>
                          <Eye size={18} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin archivo</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn-primary" title="Próximamente" style={{ padding: '0.5rem', background: 'var(--text-muted)' }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-primary" title="Próximamente" style={{ padding: '0.5rem', background: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay archivos disponibles en Supabase</td>
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
