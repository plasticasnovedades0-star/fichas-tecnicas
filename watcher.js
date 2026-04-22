import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fnhqpqnretooavpsobri.supabase.co';
const supabaseKey = 'sb_publishable_oN67frGtXxOa9qt4oC1h9A_pkNEBGwt';
const supabase = createClient(supabaseUrl, supabaseKey);

const folderPath = 'C:/Users/WilsonGarcia/OneDrive - NOVEDADES PLASTICAS SA/FICHAS TECNICAS - PROCESO DE MERCADEO';

async function uploadFile(fileName) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isExcel = fileName.toLowerCase().endsWith('.xlsx');

  if (!isPdf && !isExcel) return;

  try {
    const filePath = path.join(folderPath, fileName);
    if (!fs.existsSync(filePath)) return;
    
    const fileBuffer = fs.readFileSync(filePath);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `auto-${cleanFileName}`;

    console.log(`[PROCESANDO] ${fileName}...`);

    // 1. Subir a Storage (con upsert: true para sobrescribir si existe)
    const { error: storageError } = await supabase.storage
      .from('archivos')
      .upload(storagePath, fileBuffer, {
        contentType: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    if (storageError) {
      console.error(`❌ Error Storage (${fileName}):`, storageError.message);
      return;
    }

    // 2. Obtener URL pública
    const { data: publicUrlData } = supabase.storage.from('archivos').getPublicUrl(storagePath);
    const fileUrl = publicUrlData.publicUrl;

    // 3. Upsert en la base de datos
    const reference = fileName.split(/[ -]/)[0] || 'REF';
    const description = fileName.replace(/\.[^/.]+$/, "");

    const { error: dbError } = await supabase.from('fichas').upsert(
      {
        reference: reference,
        description: description,
        type: isPdf ? 'PDF' : 'Excel',
        file_url: fileUrl
      },
      { onConflict: 'description' } // Requiere la restricción UNIQUE en la DB
    );

    if (dbError) {
      console.error(`❌ Error DB (${fileName}):`, dbError.message);
    } else {
      console.log(`✅ ¡Sincronizado! ${fileName}`);
    }
  } catch (err) {
    console.error(`❌ Error inesperado:`, err.message);
  }
}

// Iniciar observación de la carpeta
console.log('--- OBSERVADOR ACTIVO ---');
console.log(`Vigilando: ${folderPath}`);
console.log('Presiona Ctrl+C para detener.');

// Usamos watch para detectar cambios y nuevos archivos
fs.watch(folderPath, (eventType, fileName) => {
  if (fileName) {
    // Pequeño retraso para asegurar que el archivo terminó de guardarse (especialmente en OneDrive)
    setTimeout(() => uploadFile(fileName), 1000);
  }
});
