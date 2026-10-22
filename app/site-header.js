import Link from 'next/link';
import SignOutButton from './sign-out-button';

export default function SiteHeader({ email }) {
  return (
    <header className="topo">
      <span className="email-usuario">{email}</span>
      <nav className="navegacao" aria-label="Navegação principal">
        <Link href="/">Analisar mensagem</Link>
        <Link href="/historico" prefetch={false}>Meu histórico</Link>
        <SignOutButton />
      </nav>
    </header>
  );
}
