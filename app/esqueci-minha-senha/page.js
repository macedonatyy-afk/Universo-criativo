import Link from 'next/link';
import { getSupabaseConfig } from '../../lib/supabase/config';
import RecoveryForm from './recovery-form';

export const metadata = { title: 'Esqueci minha senha | Universo Criativo' };
export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  const configured = Boolean(getSupabaseConfig());
  return (
    <main className="pagina">
      <section className="cartao" aria-labelledby="titulo-recuperacao">
        <p className="selo-halloween">Sem susto com a senha</p>
        <h1 id="titulo-recuperacao">Esqueci minha senha</h1>
        <p className="descricao">Informe o e-mail da sua conta e vamos ajudar você a recuperar o acesso.</p>
        {!configured && <p className="erro" role="alert">O acesso ainda não foi configurado. Tente novamente mais tarde.</p>}
        <RecoveryForm configured={configured} invalidLink={params?.erro === 'link'} />
        <Link className="link-recuperacao" href="/login">Voltar para entrar</Link>
      </section>
    </main>
  );
}
