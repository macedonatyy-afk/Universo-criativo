'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updatePassword } from './actions';

export default function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, {});
  if (state.done) return (
    <div>
      <p className="sucesso" role="status">Senha atualizada com sucesso!</p>
      <Link className="botao-link" href="/">Continuar para o site</Link>
    </div>
  );
  return (
    <form action={action}>
      <label htmlFor="new-password">Nova senha</label>
      <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={6} required
        onInvalid={event => event.target.setCustomValidity('A senha deve ter pelo menos 6 caracteres.')}
        onInput={event => event.target.setCustomValidity('')}
      />
      <label htmlFor="confirm-password">Confirme a nova senha</label>
      <input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" minLength={6} required
        onInvalid={event => event.target.setCustomValidity('Confirme a senha com pelo menos 6 caracteres.')}
        onInput={event => event.target.setCustomValidity('')}
      />
      <button disabled={pending}>{pending ? 'Salvando...' : 'Salvar nova senha'}</button>
      {state.error && <p className="erro" role="alert">{state.error}</p>}
    </form>
  );
}
