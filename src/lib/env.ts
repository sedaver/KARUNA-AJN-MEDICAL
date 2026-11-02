import { z } from "zod";
const publicEnv = z.object({ url: z.url(), key: z.string().min(20) });
export function getSupabaseConfig() {
  const parsed = publicEnv.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return parsed.success ? parsed.data : null;
}
