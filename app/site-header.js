import Link from 'next/link';
import SignOutButton from './sign-out-button';

export default function SiteHeader({ email }) {
  return (
    <header className="topo">
      {email ? <span className="email-usuario">{email}</span> : <Link href="/" className="marca-site">Isso é golpe?</Link>}
      <nav className="navegacao" aria-label="Navegação principal">
        <Link href="/">Analisar mensagem</Link>
        {email && <Link href="/historico" prefetch={false}>Meu histórico</Link>}
        <Link href="/ajuda">Ajuda</Link>
        {email ? <SignOutButton /> : <Link href="/login">Entrar</Link>}
      </nav>
    </header>
  );
}
