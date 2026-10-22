export class AnalysisError extends Error {
  constructor(message, status, diagnostic) {
    super(message);
    this.status = status;
    this.diagnostic = diagnostic;
  }
}

function providerError(status) {
  if (status === 429) return new AnalysisError('Você atingiu o limite de uso de hoje.', 429);
  if (status === 401) return new AnalysisError('Chave da IA inválida.', 401);
  if (status === 402) return new AnalysisError('A conta da IA não tem saldo para este modelo.', 402);
  if (status === 403) return new AnalysisError('O acesso ao modelo de IA não está autorizado. Confira as permissões na OpenRouter.', 403);
  return new AnalysisError('Não foi possível concluir a análise. Tente novamente em instantes.', 502);
}

export async function analyze({ campos, config, apiKey, fetchImpl = fetch }) {
  if (!campos || typeof campos !== 'object' || Array.isArray(campos)) {
    throw new AnalysisError('Preencha os campos antes de analisar.', 400);
  }

  const values = {};
  for (const campo of config.campos) {
    const value = campos[campo.id];
    if (typeof value !== 'string' || !value.trim()) {
      throw new AnalysisError(`Preencha o campo: ${campo.rotulo}.`, 400);
    }
    if (value.length > 10000) {
      throw new AnalysisError(`O campo ${campo.rotulo} deve ter no máximo 10.000 caracteres.`, 400);
    }
    values[campo.id] = value.trim();
  }

  if (config.modoTeste) {
    return `EXEMPLO — MODO DE TESTE

VEREDITO: SUSPEITO

POR QUE: Esta é uma resposta fictícia para testar a tela. A mensagem enviada ainda não foi analisada por uma inteligência artificial.

O QUE FAZER AGORA:
1. Não clique em links nem compartilhe senhas ou códigos.
2. Confira a informação pelo aplicativo ou telefone oficial da instituição.
3. Para analisar de verdade, ative a IA após concluir o teste.`;
  }

  if (!apiKey?.trim()) {
    throw new AnalysisError('A inteligência artificial ainda não foi configurada. Tente novamente mais tarde.', 503);
  }

  // Replace each placeholder once; user text remains literal, including $ and braces.
  const prompt = config.prompt.replace(/\{([A-Za-z0-9_]+)\}/g, (placeholder, id) =>
    Object.hasOwn(values, id) ? values[id] : placeholder
  );

  let response;
  try {
    response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.modelo,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 900,
        // Ask supported models to spend the budget on the final answer.
        reasoning: { enabled: false, exclude: true },
      }),
      signal: AbortSignal.timeout(30000),
      cache: 'no-store',
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new AnalysisError('A análise demorou demais. Tente novamente em instantes.', 504);
    }
    throw new AnalysisError('Não foi possível conectar à inteligência artificial. Tente novamente em instantes.', 502);
  }

  if (!response.ok) {
    throw providerError(response.status);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new AnalysisError('A inteligência artificial enviou uma resposta inválida. Tente novamente.', 502);
  }
  const choice = result?.choices?.[0];
  const upstreamError = result?.error || choice?.error;
  if (upstreamError) {
    const status = Number(upstreamError.code);
    const error = providerError(status);
    error.diagnostic = { kind: 'provider_error', code: Number.isInteger(status) ? status : null };
    throw error;
  }

  if (choice?.finish_reason === 'content_filter' || choice?.message?.refusal) {
    throw new AnalysisError('A IA não pôde analisar esse conteúdo. Reformule a mensagem e tente novamente.', 422);
  }

  const content = choice?.message?.content;
  const text = typeof content === 'string' ? content : Array.isArray(content)
    ? content.filter(part => part?.type === 'text' && typeof part.text === 'string').map(part => part.text).join('\n')
    : '';

  // Log only technical counters, never the submitted message or private reasoning.
  const count = value => Number.isInteger(value) && value >= 0 ? value : null;
  const diagnostic = {
    kind: 'empty_response',
    finishReason: ['stop', 'length', 'error', 'content_filter'].includes(choice?.finish_reason) ? choice.finish_reason : 'unknown',
    completionTokens: count(result?.usage?.completion_tokens),
    reasoningTokens: count(result?.usage?.completion_tokens_details?.reasoning_tokens),
  };
  if (choice?.finish_reason === 'length') {
    throw new AnalysisError('A IA atingiu o limite antes de concluir a resposta. Tente analisar uma mensagem mais curta.', 502, { ...diagnostic, kind: 'output_limit' });
  }
  if (!text.trim()) {
    throw new AnalysisError('O modelo de IA não enviou uma resposta. Aguarde um pouco antes de tentar novamente.', 502, diagnostic);
  }
  return text;
}
