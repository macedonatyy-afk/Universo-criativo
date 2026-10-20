import LoginForm from './login-form';
import { getSupabaseConfig } from '../../lib/supabase/config';

export const metadata = { title: 'Entrar | Universo Criativo' };
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const configured = Boolean(getSupabaseConfig());

  return (
    <main className="pagina">
      <section className="cartao" aria-labelledby="titulo-login">
        <h1 id="titulo-login">Meu Universo Criativo ✨</h1>
        <p className="descricao">Entre ou crie sua conta para compartilhar suas ideias.</p>
        {!configured && <p className="erro" role="alert">O acesso ainda não foi configurado. Entre em contato com a responsável pelo site.</p>}
        <LoginForm configured={configured} />
      </section>
    </main>
  );
}
