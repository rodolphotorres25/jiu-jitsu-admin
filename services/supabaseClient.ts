/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente são injetadas pelo ambiente de desenvolvimento (ex: Vite, Next.js).
// Certifique-se de criar um arquivo .env.local na raiz do seu projeto com:
// VITE_SUPABASE_URL=SUA_URL_AQUI
// VITE_SUPABASE_ANON_KEY=SUA_CHAVE_AQUI

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
