'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { authErrorMessage } from '../../lib/supabase/errors';

export async function authenticate(_previousState, formData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const intent = formData.get('intent');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Informe um e-mail válido.' };
  }
  if (!password) return { error: 'Informe sua senha.' };
  if (!['login', 'signup'].includes(intent)) {
    return { error: 'Escolha Entrar ou Criar conta.' };
  }
  if (intent === 'signup' && password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  const supabase = await createClient();
  if (!supabase) return { error: 'O acesso ainda não foi configurado. Entre em contato com a responsável pelo site.' };

  let result;
  try {
    result = intent === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
  } catch {
    return { error: 'Não foi possível conectar ao serviço de acesso. Tente novamente em instantes.' };
  }

  if (result.error) return { error: authErrorMessage(result.error) };
  if (intent === 'signup' && !result.data.session) {
    return { message: 'Confira seu e-mail para confirmar o cadastro. Depois, volte aqui e clique em Entrar.' };
  }
  if (!result.data.session) return { error: 'Não foi possível iniciar sua sessão. Tente novamente.' };
  redirect('/');
}
