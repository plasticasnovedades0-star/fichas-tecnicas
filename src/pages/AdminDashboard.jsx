import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun, Plus, Edit2, Trash2, Lock, X, Eye, Search, Activity } from 'lucide-react';
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

  // Estados para el Modal (Creación y Edición)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [formData, setFormData] = useState({ reference: '', description: '', type: 'PDF' });
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated]);

  async function fetchFiles() {
    setLoading(true);
    const { data, error } = await supabase.from('fichas').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching files:', error);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }

  const handleOpenModal = (file = null) => {
    if (file) {
      setEditingFile(file);
      setFormData({ reference: file.reference, description: file.description, type: file.type });
    } else {
      setEditingFile(null);
      setFormData({ reference: '', description: '', type: 'PDF' });
    }
    setSelectedFileObj(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let fileUrl = editingFile ? editingFile.file_url : null;

    // 1. Si se seleccionó un nuevo archivo, subirlo
    if (selectedFileObj) {
      const fileExt = selectedFileObj.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('archivos')
        .upload(fileName, selectedFileObj);
        
      if (uploadError) {
        setIsSubmitting(false);
        alert('Error subiendo archivo físico: ' + uploadError.message);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('archivos').getPublicUrl(fileName);
      fileUrl = publicUrlData.publicUrl;
    } else if (!editingFile && !selectedFileObj) {
      setIsSubmitting(false);
      alert('Por favor selecciona un archivo.');
      return;
    }

    // 2. Insertar o Actualizar en DB
    if (editingFile) {
      const { error: dbError } = await supabase
        .from('fichas')
        .update({ 
          reference: formData.reference, 
          description: formData.description, 
          type: formData.type,
          file_url: fileUrl 
        })
        .eq('id', editingFile.id);

      if (dbError) alert('Error al actualizar: ' + dbError.message);
    } else {
      const { error: dbError } = await supabase.from('fichas').insert([
        { 
          reference: formData.reference, 
          description: formData.description, 
          type: formData.type,
          file_url: fileUrl
        }
      ]);

      if (dbError) alert('Error al crear: ' + dbError.message);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
    fetchFiles();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro permanentemente?')) {
      const { error } = await supabase.from('fichas').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar: ' + error.message);
      } else {
        fetchFiles();
      }
    }
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

  // Filtrado mejorado (Referencia + Descripción)
  const filteredFiles = files.filter(f => 
    (f.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Modal Nueva/Editar Ficha */}
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
            <h2 style={{ marginBottom: '1.5rem' }}>{editingFile ? 'Editar Ficha' : 'Subir Nueva Ficha'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Referencia</label>
                <input 
                  type="text" 
                  className="input-base" 
                  placeholder="Ej: REF-001" 
                  required
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Descripción</label>
                <input 
                  type="text" 
                  className="input-base" 
                  placeholder="Manual de uso..." 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tipo de Archivo</label>
                <select 
                  className="input-base"
                  style={{ cursor: 'pointer' }}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel</option>
                  <option value="Word">Word</option>
                  <option value="Imagen">Imagen</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              
              <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                   {editingFile ? 'Reemplazar Archivo (Opcional)' : 'Seleccionar Archivo'}
                 </label>
                 <input 
                   type="file"
                   accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4"
                   className="input-base"
                   style={{ padding: '0.5rem' }}
                   required={!editingFile}
                   onChange={(e) => setSelectedFileObj(e.target.files[0])}
                 />
              </div>

              <button disabled={isSubmitting} type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                {isSubmitting ? 'Guardando...' : (editingFile ? 'Guardar Cambios' : 'Crear Registro')}
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
          <a href="https://192.168.2.119:5174/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', flex: '1 1 auto', maxWidth: 'max-content' }}>
            <button className="btn-primary" style={{ width: '100%', backgroundColor: '#10b981' }}>
              <Activity size={20} /> Monitor Elemental
            </button>
          </a>
          <button className="btn-primary" style={{ flex: '1 1 auto', maxWidth: 'max-content' }} onClick={() => handleOpenModal()}>
            <Plus size={20} /> Subir Archivo
          </button>
        </div>
      </div>

      <div className="card-glass">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Catálogo de Archivos</h3>
          <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '100%' }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '0.8rem', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-base" 
              placeholder="Buscar por referencia o descripción..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos...</div>
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
                {filteredFiles.map(file => (
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
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.5rem', background: 'var(--primary-color)' }}
                        onClick={() => handleOpenModal(file)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.5rem', background: '#ef4444' }}
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredFiles.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No se encontraron resultados
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
