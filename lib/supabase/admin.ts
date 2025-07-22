// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

// Create admin client with service role key
export const supabaseAdmin = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
