import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { getSupabaseConfig } from '../lib/supabase/config.js';

const names = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
];
let original;

beforeEach(() => {
  original = Object.fromEntries(names.map(name => [name, process.env[name]]));
  names.forEach(name => delete process.env[name]);
});

afterEach(() => {
  names.forEach(name => {
    if (original[name] === undefined) delete process.env[name];
    else process.env[name] = original[name];
  });
});

for (const name of names.slice(1)) {
  test(`aceita a chave pública fornecida em ${name}`, () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ' https://projeto.supabase.co \n';
    process.env[name] = ' chave-publica-de-teste \n';
    assert.deepEqual(getSupabaseConfig(), {
      url: 'https://projeto.supabase.co',
      key: 'chave-publica-de-teste',
    });
  });
}

test('mantém a chave anon prioritária para instalações existentes', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://projeto.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-de-teste';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-de-teste';
  assert.equal(getSupabaseConfig().key, 'anon-de-teste');
});

test('usa publishable quando anon contém apenas espaços', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://projeto.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '  ';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-de-teste';
  assert.equal(getSupabaseConfig().key, 'publishable-de-teste');
});

test('bloqueia configuração ausente ou URL inválida', () => {
  assert.equal(getSupabaseConfig(), null);
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-de-teste';
  assert.equal(getSupabaseConfig(), null);
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'endereco-invalido';
  assert.equal(getSupabaseConfig(), null);
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'ftp://projeto.supabase.co';
  assert.equal(getSupabaseConfig(), null);
});
