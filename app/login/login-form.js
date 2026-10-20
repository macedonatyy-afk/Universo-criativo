'use client';

import { useActionState, useState } from 'react';
import { authenticate } from './actions';

export default function LoginForm({ configured }) {
  const [state, action, pending] = useActionState(authenticate, {});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form action={action}>
      <label htmlFor="email">E-mail</label>
      <input id="email" name="email" type="email" autoComplete="email" required
        value={email} onChange={event => setEmail(event.target.value)}
        onInvalid={event => event.target.setCustomValidity('Informe um e-mail válido.')}
        onInput={event => event.target.setCustomValidity('')}
      />
      <label htmlFor="password">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required
        value={password} onChange={event => setPassword(event.target.value)}
        onInvalid={event => event.target.setCustomValidity('Informe sua senha.')}
        onInput={event => event.target.setCustomValidity('')}
      />
      <p className="ajuda">Para criar uma conta, use uma senha com pelo menos 6 caracteres.</p>
      <div className="acoes-login">
        <button type="submit" name="intent" value="login" disabled={pending || !configured}>Entrar</button>
        <button type="submit" name="intent" value="signup" className="secundario" disabled={pending || !configured}>Criar conta</button>
      </div>
      {pending && <p role="status">Aguarde...</p>}
      {state.error && <p className="erro" role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
    </form>
  );
}
