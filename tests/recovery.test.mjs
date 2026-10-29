import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recoveryRedirect, validateNewPassword } from '../lib/supabase/recovery.js';
import { authErrorMessage } from '../lib/supabase/errors.js';

test('recuperação usa callback fixo no domínio do site', () => {
  assert.equal(recoveryRedirect('https://universo-criativo-3hbh.vercel.app'), 'https://universo-criativo-3hbh.vercel.app/auth/callback');
  assert.equal(recoveryRedirect('https://site.example/pagina?next=https://outro.example'), 'https://site.example/auth/callback');
  assert.equal(recoveryRedirect('http://localhost:3100'), 'http://localhost:3100/auth/callback');
});

test('não cria links com protocolos inseguros, credenciais ou origem ausente', () => {
  for (const origin of [null, '', 'null', 'javascript:alert(1)', 'ftp://site.example', 'http://site.example', 'https://usuario:senha@site.example']) {
    assert.equal(recoveryRedirect(origin), null);
  }
});

test('senha nova precisa ter pelo menos seis caracteres e confirmação igual', () => {
  assert.equal(validateNewPassword('', ''), 'A nova senha deve ter pelo menos 6 caracteres.');
  assert.equal(validateNewPassword('12345', '12345'), 'A nova senha deve ter pelo menos 6 caracteres.');
  assert.equal(validateNewPassword('senha-nova', 'outra-senha'), 'As senhas não são iguais. Confira e tente novamente.');
  assert.equal(validateNewPassword('senha-nova', 'senha-nova'), null);
});

test('erros de recuperação e senha repetida são apresentados em português', () => {
  for (const code of ['same_password', 'otp_expired', 'flow_state_not_found', 'flow_state_expired']) {
    const message = authErrorMessage({ code, message: 'Private provider error' });
    assert.ok(message.length > 15);
    assert.ok(!message.includes('Private provider error'));
    assert.ok(!message.includes('Não foi possível concluir'));
  }
});
