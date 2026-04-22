import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fnhqpqnretooavpsobri.supabase.co';
const supabaseKey = 'sb_publishable_oN67frGtXxOa9qt4oC1h9A_pkNEBGwt';
const supabase = createClient(supabaseUrl, supabaseKey);

const folderPath = 'C:/Users/WilsonGarcia/OneDrive - NOVEDADES PLASTICAS SA/FICHAS TECNICAS - PROCESO DE MERCADEO';

async function uploadFiles() {
  console.log('Iniciando subida masiva desde OneDrive...');
  
  if (!fs.existsSync(folderPath)) {
    console.error('La carpeta no existe:', folderPath);
    return;
  }

  const files = fs.readdirSync(folderPath);
  console.log(`Encontrados ${files.length} archivos en total.`);

  for (const fileName of files) {
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isExcel = fileName.toLowerCase().endsWith('.xlsx');

    if (isPdf || isExcel) {
      try {
        const filePath = path.join(folderPath, fileName);
        const fileBuffer = fs.readFileSync(filePath);
        
        // Limpiar el nombre para evitar caracteres raros en la URL
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `bulk-${cleanFileName}`;
        
        console.log(`[SUBIENDO] ${fileName}...`);
        
        // 1. Subir a Storage
        const { error: storageError } = await supabase.storage
          .from('archivos')
          .upload(storagePath, fileBuffer, {
            contentType: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: true
          });

        if (storageError) {
          console.error(`❌ Error Storage (${fileName}):`, storageError.message);
          continue;
        }

        // 2. Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from('archivos')
          .getPublicUrl(storagePath);

        const fileUrl = publicUrlData.publicUrl;

        // 3. Crear registro en DB
        // Extraer referencia (primeros caracteres antes del espacio o guion)
        const reference = fileName.split(/[ -]/)[0] || 'REF';

        const { error: dbError } = await supabase.from('fichas').insert([
          {
            reference: reference,
            description: fileName.replace(/\.[^/.]+$/, ""), // Quitar extensión
            type: isPdf ? 'PDF' : 'Excel',
            file_url: fileUrl
          }
        ]);

        if (dbError) {
          console.error(`❌ Error DB (${fileName}):`, dbError.message);
        } else {
          console.log(`✅ Éxito: ${fileName}`);
        }
      } catch (err) {
        console.error(`❌ Error inesperado con ${fileName}:`, err.message);
      }
    }
  }
  console.log('--- Proceso de migración finalizado ---');
}

uploadFiles();
