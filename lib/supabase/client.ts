// lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // Correct import for App Router
import { Database } from "../database.types";

// Note: The function name has changed to createClientComponentClient
export const createClient = () => createClientComponentClient<Database>();
