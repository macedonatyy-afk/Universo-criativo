import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import PasswordForm from './password-form';

export const metadata = { title: 'Nova senha | Universo Criativo' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  let user = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    } catch {
      // Password changes require a verified recovery session.
    }
  }
  if (!user) redirect('/esqueci-minha-senha?erro=link');
  return (
    <main className="pagina">
      <section className="cartao" aria-labelledby="titulo-nova-senha">
        <p className="selo-halloween">Seu acesso de volta</p>
        <h1 id="titulo-nova-senha">Crie uma nova senha</h1>
        <p className="descricao">Escolha uma senha com pelo menos 6 caracteres e confirme abaixo.</p>
        <PasswordForm />
      </section>
    </main>
  );
}
