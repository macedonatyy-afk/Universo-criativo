import assert from 'node:assert/strict';
import { test } from 'node:test';
import { desafio } from '../desafio.js';
import { analyze, AnalysisError } from '../lib/ia.js';

const campos = { mensagem: 'Seu CPF foi bloqueado. Pague uma taxa em 24 horas.' };
const liveConfig = { ...desafio, modoTeste: false };

test('modo de teste funciona sem chave e nunca chama a OpenRouter', async () => {
  const text = await analyze({
    campos,
    config: { ...desafio, modoTeste: true },
    fetchImpl: () => assert.fail('Não deve chamar a IA no modo de teste.'),
  });
  assert.match(text, /MODO DE TESTE/);
  assert.match(text, /VEREDITO:/);
  assert.match(text, /POR QUE:/);
  assert.match(text, /O QUE FAZER AGORA:/);
});

test('valida campos ausentes, vazios, de tipo incorreto e muito longos', async () => {
  for (const invalid of [null, [], {}, { mensagem: '' }, { mensagem: '  ' }, { mensagem: 12 }, { mensagem: 'x'.repeat(10001) }]) {
    await assert.rejects(analyze({ campos: invalid, config: desafio }), error =>
      error instanceof AnalysisError && error.status === 400
    );
  }
});

test('modo real requer chave no servidor', async () => {
  await assert.rejects(analyze({ campos, config: liveConfig }), {
    status: 503,
    message: 'A inteligência artificial ainda não foi configurada. Tente novamente mais tarde.',
  });
});

test('envia modelo, 900 tokens e substituições literais; devolve só o texto', async () => {
  const config = {
    ...liveConfig,
    campos: [{ id: 'mensagem', rotulo: 'Mensagem' }, { id: 'outro', rotulo: 'Outro' }],
    prompt: '{mensagem}\n{outro}\n{mensagem}',
  };
  const text = await analyze({
    campos: { mensagem: 'Custa $& e {outro}', outro: 'texto adicional' },
    config,
    apiKey: ' chave-ficticia ',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Authorization, 'Bearer chave-ficticia');
      const body = JSON.parse(options.body);
      assert.equal(body.model, desafio.modelo);
      assert.equal(body.max_tokens, 900);
      assert.deepEqual(body.reasoning, { enabled: false, exclude: true });
      assert.equal(body.messages[0].content, 'Custa $& e {outro}\ntexto adicional\nCusta $& e {outro}');
      return Response.json({ choices: [{ message: { content: 'VEREDITO: SUSPEITO\n\nPOR QUE: exemplo' } }] });
    },
  });
  assert.equal(text, 'VEREDITO: SUSPEITO\n\nPOR QUE: exemplo');
});

for (const [status, message] of [
  [401, 'Chave da IA inválida.'],
  [429, 'Você atingiu o limite de uso de hoje.'],
  [500, 'Não foi possível concluir a análise. Tente novamente em instantes.'],
]) {
  test(`traduz erro ${status} sem expor detalhes do provedor`, async () => {
    await assert.rejects(analyze({
      campos, config: liveConfig, apiKey: 'chave-ficticia',
      fetchImpl: async () => new Response('Internal provider details', { status }),
    }), { message, status: status === 500 ? 502 : status });
  });
}

test('traduz falha de conexão e limite de tempo', async () => {
  for (const name of ['TypeError', 'TimeoutError']) {
    await assert.rejects(analyze({
      campos, config: liveConfig, apiKey: 'chave-ficticia',
      fetchImpl: async () => { throw Object.assign(new Error('Network details'), { name }); },
    }), error => error.status === (name === 'TimeoutError' ? 504 : 502) && !error.message.includes('Network details'));
  }
});

test('rejeita resposta vazia ou inválida sem exibir sucesso', async () => {
  for (const response of [new Response('not json'), Response.json({}), Response.json({ choices: [{ message: { content: '' } }] })]) {
    await assert.rejects(analyze({
      campos, config: liveConfig, apiKey: 'chave-ficticia', fetchImpl: async () => response,
    }), error => error instanceof AnalysisError && error.status === 502);
  }
});

test('aceita resposta final em blocos de texto e não exibe raciocínio interno', async () => {
  const text = await analyze({
    campos, config: liveConfig, apiKey: 'chave-ficticia',
    fetchImpl: async () => Response.json({ choices: [{ message: {
      content: [{ type: 'text', text: 'VEREDITO: SUSPEITO' }, { type: 'reasoning', text: 'Raciocínio privado' }, { type: 'text', text: 'POR QUE: há cobrança urgente.' }],
      reasoning: 'Raciocínio privado',
    } }] }),
  });
  assert.equal(text, 'VEREDITO: SUSPEITO\nPOR QUE: há cobrança urgente.');
});

test('identifica orçamento esgotado em raciocínio sem aceitar resposta vazia', async () => {
  await assert.rejects(analyze({
    campos, config: liveConfig, apiKey: 'chave-ficticia',
    fetchImpl: async () => Response.json({
      choices: [{ finish_reason: 'length', message: { content: null, reasoning: 'Não exibir' } }],
      usage: { completion_tokens: 900, completion_tokens_details: { reasoning_tokens: 900 } },
    }),
  }), error => {
    assert.equal(error.status, 502);
    assert.equal(error.diagnostic.kind, 'output_limit');
    assert.equal(error.diagnostic.reasoningTokens, 900);
    assert.match(error.message, /limite antes de concluir/);
    assert.ok(!JSON.stringify(error.diagnostic).includes('Não exibir'));
    return true;
  });
});

test('traduz falhas devolvidas dentro de HTTP 200', async () => {
  for (const [code, expected] of [[429, 'Você atingiu o limite de uso de hoje.'], [401, 'Chave da IA inválida.']]) {
    for (const result of [{ error: { code, message: 'Private provider error' } }, { choices: [{ error: { code: String(code) } }] }]) {
      await assert.rejects(analyze({
        campos, config: liveConfig, apiKey: 'chave-ficticia', fetchImpl: async () => Response.json(result),
      }), { status: code, message: expected });
    }
  }
});

test('traduz recusa do provedor em vez de tratar como resposta vazia', async () => {
  await assert.rejects(analyze({
    campos, config: liveConfig, apiKey: 'chave-ficticia',
    fetchImpl: async () => Response.json({ choices: [{ finish_reason: 'content_filter', message: { content: null } }] }),
  }), { status: 422, message: 'A IA não pôde analisar esse conteúdo. Reformule a mensagem e tente novamente.' });
});
