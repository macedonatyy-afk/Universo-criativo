import './globals.css';

export const metadata = {
  title: 'Universo Criativo',
  description: 'Um espaço para explorar suas ideias.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
