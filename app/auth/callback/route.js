import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const supabase = await createClient();
  let valid = false;
  if (supabase && !url.searchParams.has('error')) {
    try {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        valid = !error;
      } else if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        valid = !error;
      }
    } catch {
      // Never expose provider errors or grant access after an invalid recovery link.
    }
  }
  const response = NextResponse.redirect(new URL(valid ? '/redefinir-senha' : '/esqueci-minha-senha?erro=link', url.origin));
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
