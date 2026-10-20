'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '../lib/supabase/server';

export async function signOut() {
  const supabase = await createClient();
  if (supabase) {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) return { error: 'Não foi possível sair. Tente novamente.' };
    } catch {
      return { error: 'Não foi possível sair. Verifique sua conexão e tente novamente.' };
    }
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
