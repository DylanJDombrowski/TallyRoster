// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"; // 1. IMPORT THE CORRECT TYPE
import { Database } from "../database.types";

// 2. CHANGE THE PARAMETER TYPE HERE
export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // 3. PREFIX UNUSED VARIABLE WITH _
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // 4. PREFIX UNUSED VARIABLE WITH _
          // The `delete` method was called from a Server Component.
        }
      },
    },
  });
}
