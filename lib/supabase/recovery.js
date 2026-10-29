export function recoveryRedirect(origin) {
  try {
    const url = new URL(origin);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || (url.protocol !== 'https:' && !(local && url.protocol === 'http:'))) return null;
    return new URL('/auth/callback', url.origin).href;
  } catch {
    return null;
  }
}

export function validateNewPassword(password, confirmation) {
  if (typeof password !== 'string' || password.length < 6) return 'A nova senha deve ter pelo menos 6 caracteres.';
  if (password !== confirmation) return 'As senhas não são iguais. Confira e tente novamente.';
  return null;
}
