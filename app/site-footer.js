import Link from 'next/link';
import { Pumpkin } from './halloween-scene';

export default function SiteFooter() {
  return (
    <footer className="rodape-halloween">
      <div className="cortina-rodape" aria-hidden="true" />
      <Pumpkin className="abobora-rodape" />
      <p className="frase-rodape">O susto fica no visual. A segurança vem primeiro.</p>
      <Link href="/ajuda">Já caí no golpe, e agora?</Link>
      <p className="assinatura">Feito por Aymêe, Natally e Yasmin · Do Zero ao Ar · Afesu Veleiros 2026</p>
    </footer>
  );
}
