import Link from 'next/link';
import SiteHeader from '../site-header';
import { createClient } from '../../lib/supabase/server';

export const metadata = { title: 'Já caí no golpe, e agora? | Universo Criativo' };
export const dynamic = 'force-dynamic';

const passos = [
  { titulo: 'Fale com seu banco imediatamente', texto: 'Ligue para o número que está atrás do cartão ou use o aplicativo oficial. Avise sobre o golpe, peça orientação para bloquear cartões e movimentações e pergunte como contestar a transação.' },
  { titulo: 'Troque as senhas', texto: 'Abra o aplicativo ou site oficial, sem usar links recebidos na mensagem. Troque as senhas que foram expostas e as que você repetiu em outras contas. Ative a verificação em duas etapas quando estiver disponível.' },
  { titulo: 'Registre um boletim de ocorrência', texto: 'Procure o site oficial da Polícia Civil do seu estado para registrar o boletim pela internet, ou vá a uma delegacia. Separe as datas e os comprovantes para explicar o que aconteceu.' },
  { titulo: 'Avise sua família e seus contatos', texto: 'Conte o que aconteceu a alguém de confiança. Se invadiram sua conta, avise seus contatos por outro canal para que não enviem dinheiro nem códigos a quem está se passando por você.' },
  { titulo: 'Guarde as provas', texto: 'Salve prints das mensagens, números usados, datas e comprovantes de pagamento. Guarde tudo em um local seguro para apresentar ao banco e à polícia. Não publique seus dados pessoais.' },
];

export default async function HelpPage() {
  let email;
  const supabase = await createClient();
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      email = data.user?.email;
    } catch {
      // Help remains available even without a session.
    }
  }
  return (
    <>
      <SiteHeader email={email} />
      <main className="pagina pagina-ajuda">
        <section className="cartao cartao-ajuda" aria-labelledby="titulo-ajuda">
          <p className="selo-halloween">Uma ajuda de verdade</p>
          <h1 id="titulo-ajuda">Já caí no golpe, e agora?</h1>
          <p className="descricao">Não se culpe. Você não precisa resolver tudo sozinha. Comece por estes cinco passos.</p>
          <p className="aviso-importante">Interrompa o contato com quem pediu dinheiro ou códigos. Não pague novas taxas com a promessa de recuperar o que perdeu.</p>
          <ol className="passos-ajuda">
            {passos.map(passo => (
              <li key={passo.titulo}>
                <h2>{passo.titulo}</h2>
                <p>{passo.texto}</p>
              </li>
            ))}
          </ol>
          <Link href="/">Voltar para analisar uma mensagem</Link>
        </section>
      </main>
    </>
  );
}
