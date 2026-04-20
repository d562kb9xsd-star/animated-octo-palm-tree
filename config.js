// UFO Archive Pro Configuration

const UFO_APP_CONFIG = {
  supabaseUrl: "https://fvqtmcwmfhwwbweowl.supabase.co",
  supabaseAnonKey: "sb_publishable_5ImXLmCaWeRzVKx_rTdgkQ_h4_xqG_b"
};

// Initialise Supabase client
const supabaseClient = supabase.createClient(
  UFO_APP_CONFIG.supabaseUrl,
  UFO_APP_CONFIG.supabaseAnonKey
);
