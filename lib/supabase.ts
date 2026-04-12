import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Anonymous user ID — persisted in localStorage
export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("dfm-anon-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("dfm-anon-id", id);
  }
  return id;
}
