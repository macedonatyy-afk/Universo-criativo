import assert from 'node:assert/strict';
import { test } from 'node:test';
import { saveAnalysis, loadHistory, HISTORY_PAGE_SIZE } from '../lib/historico.js';

test('salva os campos com rótulos, sem aceitar identidade enviada pelo formulário', async () => {
  let inserted;
  const supabase = {
    from(table) {
      assert.equal(table, 'resposta');
      return { async insert(record) { inserted = record; return { error: null }; } };
    },
  };
  const saved = await saveAnalysis(supabase, {
    campos: { mensagem: '  Primeira linha\nSegunda linha  ', origem: ' SMS ', user_id: 'outra-pessoa' },
    config: { campos: [{ id: 'mensagem', rotulo: 'Mensagem' }, { id: 'origem', rotulo: 'Origem' }] },
    resposta: 'VEREDITO: SUSPEITO\nPOR QUE: cobrança urgente.',
  });
  assert.equal(saved, true);
  assert.deepEqual(inserted, {
    entrada: 'Mensagem:\nPrimeira linha\nSegunda linha\n\nOrigem:\nSMS',
    resposta: 'VEREDITO: SUSPEITO\nPOR QUE: cobrança urgente.',
  });
  assert.ok(!Object.hasOwn(inserted, 'user_id'));
});

test('falha de política ou conexão não é reportada como histórico salvo', async () => {
  for (const insert of [async () => ({ error: { code: '42501' } }), async () => { throw new Error('Database unavailable'); }]) {
    assert.equal(await saveAnalysis({ from: () => ({ insert }) }, {
      campos: { mensagem: 'Teste' },
      config: { campos: [{ id: 'mensagem', rotulo: 'Mensagem' }] },
      resposta: 'Resposta concluída',
    }), false);
  }
});

// In-memory query engine intentionally includes both owners' rows. The server query
// must still scope by verified identity, even in addition to the real database RLS.
function queryClient(records) {
  return {
    from(table) {
      assert.equal(table, 'resposta');
      let filtered = records.slice();
      const ordering = [];
      const query = {
        select(columns, options) { assert.equal(options.count, 'exact'); return query; },
        eq(column, value) { filtered = filtered.filter(record => record[column] === value); return query; },
        order(column, options) { ordering.push([column, options.ascending]); return query; },
        async range(start, end) {
          filtered.sort((a, b) => {
            for (const [column, ascending] of ordering) {
              if (a[column] !== b[column]) return (a[column] < b[column] ? -1 : 1) * (ascending ? 1 : -1);
            }
            return 0;
          });
          return { data: filtered.slice(start, end + 1), count: filtered.length, error: null };
        },
      };
      return query;
    },
  };
}

test('conta A vê duas análises e conta B vê somente a própria, da mais recente para a mais antiga', async () => {
  const client = queryClient([
    { id: '1', user_id: 'A', criado_em: '2026-10-22T10:00:00Z', entrada: 'Mensagem antiga de A' },
    { id: '2', user_id: 'B', criado_em: '2026-10-22T11:00:00Z', entrada: 'Mensagem privada de B' },
    { id: '3', user_id: 'A', criado_em: '2026-10-22T12:00:00Z', entrada: 'Mensagem nova de A' },
  ]);
  const a = await loadHistory(client, 'A');
  const b = await loadHistory(client, 'B');
  assert.deepEqual(a.data.map(record => record.id), ['3', '1']);
  assert.deepEqual(b.data.map(record => record.id), ['2']);
  assert.equal(a.count, 2);
  assert.equal(b.count, 1);
  assert.deepEqual((await loadHistory(client, 'C')).data, []);
});

test('paginação mantém ordenação estável e não repete nem omite análises', async () => {
  const records = Array.from({ length: HISTORY_PAGE_SIZE + 1 }, (_, index) => ({
    id: String(index).padStart(3, '0'), user_id: 'A', criado_em: '2026-10-22T10:00:00Z',
  }));
  const client = queryClient(records);
  const first = await loadHistory(client, 'A', 1);
  const second = await loadHistory(client, 'A', 2);
  assert.equal(first.data.length, HISTORY_PAGE_SIZE);
  assert.equal(second.data.length, 1);
  assert.equal(second.data[0].id, '000');
  assert.equal(new Set([...first.data, ...second.data].map(record => record.id)).size, records.length);
});
