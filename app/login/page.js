import LoginForm from './login-form';
import { getSupabaseConfig } from '../../lib/supabase/config';

export const metadata = { title: 'Entrar | Universo Criativo' };
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const configured = Boolean(getSupabaseConfig());

  return (
    <main className="pagina">
      <section className="cartao cartao-login" aria-labelledby="titulo-login">
        <p className="selo-halloween">Travessuras, sim. Golpes, não.</p>
        <h1 id="titulo-login">Isso é golpe?</h1>
        <p className="boas-vindas">Bem-vinda!</p>
        <p className="descricao">O susto fica só no visual. Entre ou crie sua conta para analisar mensagens suspeitas.</p>
        {!configured && <p className="erro" role="alert">O acesso ainda não foi configurado. Entre em contato com a responsável pelo site.</p>}
        <LoginForm configured={configured} />
      </section>
    </main>
  );
}
