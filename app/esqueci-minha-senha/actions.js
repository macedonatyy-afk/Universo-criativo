'use server';

import { headers } from 'next/headers';
import { createClient } from '../../lib/supabase/server';
import { authErrorMessage } from '../../lib/supabase/errors';
import { recoveryRedirect } from '../../lib/supabase/recovery';

export async function sendRecoveryEmail(_previousState, formData) {
  const email = String(formData.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Informe um e-mail válido.' };

  const supabase = await createClient();
  if (!supabase) return { error: 'O acesso ainda não foi configurado. Tente novamente mais tarde.' };
  // Next.js verifies the Server Action Origin against the request host.
  const redirectTo = recoveryRedirect((await headers()).get('origin'));
  if (!redirectTo) return { error: 'Não foi possível preparar o link. Abra o site pelo endereço principal e tente novamente.' };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { error: authErrorMessage(error) };
  } catch {
    return { error: 'Não foi possível enviar o e-mail. Verifique sua conexão e tente novamente.' };
  }
  return { message: 'Se houver uma conta com esse e-mail, você receberá um link para criar uma nova senha. Confira também a pasta de spam e abra o link neste mesmo navegador.' };
}
