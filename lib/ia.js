export class AnalysisError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
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

  if (response.status === 429) {
    throw new AnalysisError('Você atingiu o limite de uso de hoje.', 429);
  }
  if (response.status === 401) {
    throw new AnalysisError('Chave da IA inválida.', 401);
  }
  if (!response.ok) {
    throw new AnalysisError('Não foi possível concluir a análise. Tente novamente em instantes.', 502);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new AnalysisError('A inteligência artificial enviou uma resposta inválida. Tente novamente.', 502);
  }
  const text = result?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new AnalysisError('A inteligência artificial não retornou uma resposta. Tente novamente.', 502);
  }
  return text;
}
