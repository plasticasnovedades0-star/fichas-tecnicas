import { createClient } from '@supabase/supabase-js';

// Estas variables temporales se podrán configurar cuando proveas los accesos.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-url-de-supabase.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key-de-supabase';

export const supabase = createClient(supabaseUrl, supabaseKey);
