import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles data:", data, "Error:", error);
}
test();
