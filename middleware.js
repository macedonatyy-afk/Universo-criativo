import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getSupabaseConfig } from './lib/supabase/config';

export async function middleware(request) {
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  let user = null;

  if (config) {
    const supabase = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    } catch {
      // Fail closed when the authentication service is unavailable.
    }
  }

  const pathname = request.nextUrl.pathname;
  const destination = !user && pathname === '/' ? '/login' :
    user && pathname === '/login' && request.method === 'GET' ? '/' : null;

  if (destination) {
    const redirect = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}

export const config = { matcher: ['/', '/login'] };
