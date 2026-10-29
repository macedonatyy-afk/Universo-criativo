import './globals.css';
import localFont from 'next/font/local';
import HalloweenScene from './halloween-scene';
import HalloweenCurtains from './halloween-curtains';
import SiteFooter from './site-footer';

const halloweenFont = localFont({
  src: '../public/fonts/shadows-fright.ttf',
  variable: '--fonte-halloween',
  display: 'swap',
  weight: '400',
});

export const metadata = {
  title: 'Isso é golpe? | Universo Criativo',
  description: 'Analise mensagens suspeitas e saiba quais cuidados tomar. O susto fica só no visual.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={halloweenFont.variable}>
        <HalloweenScene />
        <HalloweenCurtains />
        <div className="conteudo-site">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
