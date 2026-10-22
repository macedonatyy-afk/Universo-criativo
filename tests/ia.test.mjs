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
