import { createHandler } from './handler.mjs';
Deno.serve(createHandler({
 SUPABASE_URL:Deno.env.get('SUPABASE_URL'),
 SUPABASE_ANON_KEY:Deno.env.get('SUPABASE_ANON_KEY')
}));
