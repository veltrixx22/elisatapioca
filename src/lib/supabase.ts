import { createClient } from "@supabase/supabase-js";

// 1. Ler as variáveis exatamente assim
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 4. Adicionar um console.log temporário no modo development para testar
if (import.meta.env.DEV) {
  console.log("Supabase URL existe?", Boolean(supabaseUrl));
  console.log("Supabase KEY existe?", Boolean(supabaseAnonKey));
}

// 3. A tela “Configuração Necessária” só pode aparecer se: !supabaseUrl || !supabaseAnonKey
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// 5. Garantir que o arquivo supabaseClient usa createClient
// Inicializamos apenas se as variáveis existirem para evitar o erro "supabaseUrl is required" no console
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
