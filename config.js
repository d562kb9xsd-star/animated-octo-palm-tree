// UFO Archive Pro Configuration

const UFO_APP_CONFIG = {
  // 🔗 Your Supabase Project URL
  supabaseUrl: "PASTE_YOUR_SUPABASE_URL_HERE",

  // 🔑 Your Supabase Public (anon) Key
  supabaseAnonKey: "PASTE_YOUR_SUPABASE_ANON_KEY_HERE"
};

// 🔐 Initialise Supabase client
const supabaseClient = supabase.createClient(
  UFO_APP_CONFIG.supabaseUrl,
  UFO_APP_CONFIG.supabaseAnonKey
);
