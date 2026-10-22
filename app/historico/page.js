import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { loadHistory, HISTORY_PAGE_SIZE } from '../../lib/historico';
import SiteHeader from '../site-header';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meu histórico | Universo Criativo' };

function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

export default async function HistoryPage({ searchParams }) {
  const supabase = await createClient();
  let user = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    } catch {
      // Private records require a verified session.
    }
  }
  if (!user) redirect('/login');

  const params = await searchParams;
  const requestedPage = Number(params?.pagina || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100000 ? requestedPage : 1;
  let records = [];
  let count = 0;
  let failed = false;
  try {
    const result = await loadHistory(supabase, user.id, page);
    if (result.error) failed = true;
    else {
      records = result.data || [];
      count = result.count || 0;
    }
  } catch {
    failed = true;
  }

  return (
    <>
      <SiteHeader email={user.email} />
      <main className="pagina pagina-historico">
        <section className="cartao" aria-labelledby="titulo-historico">
          <h1 id="titulo-historico">Meu histórico</h1>
          <p className="descricao">Suas análises, da mais recente para a mais antiga. Datas e horários de Brasília.</p>
          {failed ? (
            <p className="erro" role="alert">Não foi possível carregar seu histórico. Tente novamente em instantes.</p>
          ) : records.length === 0 ? (
            <p>{page === 1 ? 'Você ainda não tem análises salvas. Faça sua primeira análise para começar.' : 'Não há análises nesta página.'}</p>
          ) : (
            <ol className="historico-lista">
              {records.map(record => (
                <li key={record.id}>
                  <article className="registro-historico">
                    <h2>Análise de <time dateTime={record.criado_em || undefined}>{formatDate(record.criado_em)}</time></h2>
                    <h3>Mensagem enviada</h3>
                    <div className="conteudo-resposta">{record.entrada}</div>
                    <h3>Resposta</h3>
                    <div className="conteudo-resposta">{record.resposta}</div>
                  </article>
                </li>
              ))}
            </ol>
          )}
          {!failed && (page > 1 || count > HISTORY_PAGE_SIZE) && (
            <nav className="paginacao" aria-label="Páginas do histórico">
              {page > 1 && <Link href={`/historico?pagina=${page - 1}`} prefetch={false}>Anterior</Link>}
              <span>Página {page}</span>
              {page * HISTORY_PAGE_SIZE < count && <Link href={`/historico?pagina=${page + 1}`} prefetch={false}>Próxima</Link>}
            </nav>
          )}
          <Link href="/">Voltar para analisar</Link>
        </section>
      </main>
    </>
  );
}
