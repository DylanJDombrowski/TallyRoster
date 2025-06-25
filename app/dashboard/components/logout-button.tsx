// app/dashboard/components/logout-button.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { DoorClosed } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-900 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
    >
      <DoorClosed size={16} />
      Logout
    </button>
  );
}
