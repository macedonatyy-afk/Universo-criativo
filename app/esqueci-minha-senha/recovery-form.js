'use client';

import { useActionState, useState } from 'react';
import { sendRecoveryEmail } from './actions';

export default function RecoveryForm({ configured, invalidLink }) {
  const [state, action, pending] = useActionState(sendRecoveryEmail, {});
  const [email, setEmail] = useState('');
  return (
    <form action={action}>
      {invalidLink && !state.error && !state.message && <p className="erro" role="alert">O link de recuperação é inválido ou expirou. Peça um novo link e abra neste mesmo navegador.</p>}
      <label htmlFor="recovery-email">Seu e-mail</label>
      <input id="recovery-email" name="email" type="email" autoComplete="email" required
        value={email} onChange={event => setEmail(event.target.value)}
        onInvalid={event => event.target.setCustomValidity('Informe um e-mail válido.')}
        onInput={event => event.target.setCustomValidity('')}
      />
      <button disabled={pending || !configured}>{pending ? 'Enviando...' : 'Enviar link de recuperação'}</button>
      {state.error && <p className="erro" role="alert">{state.error}</p>}
      {state.message && <p className="sucesso" role="status">{state.message}</p>}
    </form>
  );
}
