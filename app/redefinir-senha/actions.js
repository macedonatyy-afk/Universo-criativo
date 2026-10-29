'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';
import { authErrorMessage } from '../../lib/supabase/errors';
import { validateNewPassword } from '../../lib/supabase/recovery';

export async function updatePassword(_previousState, formData) {
  const password = String(formData.get('password') || '');
  const confirmation = String(formData.get('confirmation') || '');
  const validationError = validateNewPassword(password, confirmation);
  if (validationError) return { error: validationError };
  const supabase = await createClient();
  if (!supabase) return { error: 'O acesso ainda não foi configurado. Tente novamente mais tarde.' };
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { error: 'Sua sessão expirou. Peça um novo link de recuperação.' };
    const result = await supabase.auth.updateUser({ password });
    if (result.error) return { error: authErrorMessage(result.error) };
  } catch {
    return { error: 'Não foi possível atualizar sua senha. Verifique sua conexão e tente novamente.' };
  }
  revalidatePath('/', 'layout');
  return { done: true };
}
