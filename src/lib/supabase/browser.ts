"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";
export function browserClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Staff access has not been configured.");
  return createBrowserClient<Database>(config.url, config.key);
}
