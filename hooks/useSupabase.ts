"use client";

import { createClient } from "@supabase/supabase-js";

const useSupabase = async () => {
  const supabaseClient = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "undefined",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "undefined"
  );

  return supabaseClient;
};

export default useSupabase;
