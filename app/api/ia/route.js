import { desafio } from '../../../desafio';
import { analyze, AnalysisError } from '../../../lib/ia';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

function textResponse(text, status = 200) {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request) {
  const supabase = await createClient();
  if (!supabase) return textResponse('O acesso ainda não foi configurado.', 503);

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return textResponse('Sua sessão expirou. Entre novamente para analisar.', 401);
  } catch {
    return textResponse('Não foi possível verificar sua sessão. Tente entrar novamente.', 503);
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 64000) return textResponse('O texto enviado é muito grande. Reduza a mensagem.', 413);
    body = JSON.parse(raw);
  } catch {
    return textResponse('Não foi possível ler a mensagem. Preencha o formulário novamente.', 400);
  }

  try {
    const text = await analyze({
      campos: body?.campos,
      config: desafio,
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return textResponse(text);
  } catch (error) {
    if (error instanceof AnalysisError) return textResponse(error.message, error.status);
    return textResponse('Não foi possível concluir a análise. Tente novamente.', 500);
  }
}
