import { createHandler } from './handler.mjs';
Deno.serve(createHandler({
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  WHOP_COMPANY_API_KEY: Deno.env.get('WHOP_COMPANY_API_KEY'),
  WHOP_COMPANY_ID: Deno.env.get('WHOP_COMPANY_ID'),
  WHOP_WEBHOOK_SECRET: Deno.env.get('WHOP_WEBHOOK_SECRET'),
  APP_URL: Deno.env.get('APP_URL'),
}));
