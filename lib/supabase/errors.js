export function authErrorMessage(error) {
  const messages = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
    user_already_exists: 'Já existe uma conta com este e-mail. Tente entrar.',
    email_exists: 'Já existe uma conta com este e-mail. Tente entrar.',
    signup_disabled: 'A criação de contas está desativada no momento.',
    email_provider_disabled: 'O acesso por e-mail está desativado no momento.',
    weak_password: 'Escolha uma senha mais forte, com pelo menos 6 caracteres.',
    email_address_invalid: 'Informe um e-mail válido.',
    email_address_not_authorized: 'Este e-mail não está autorizado para criar uma conta.',
    over_email_send_rate_limit: 'Muitos e-mails solicitados. Aguarde antes de tentar novamente.',
    over_request_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente novamente.',
    user_banned: 'Esta conta está bloqueada. Entre em contato com o suporte.',
    validation_failed: 'Confira o e-mail e a senha informados.',
    session_not_found: 'Sua sessão expirou. Entre novamente.',
    same_password: 'Escolha uma senha diferente da senha atual.',
    otp_expired: 'Este link expirou. Peça um novo link de recuperação.',
    flow_state_not_found: 'O link de recuperação não é válido neste navegador. Peça um novo link.',
    flow_state_expired: 'O link de recuperação expirou. Peça um novo link.',
  };

  if (error?.status === 429) return messages.over_request_rate_limit;
  if (error?.name === 'AuthRetryableFetchError' || error?.status >= 500) {
    return 'Não foi possível conectar ao serviço de acesso. Tente novamente em instantes.';
  }
  return messages[error?.code] || 'Não foi possível concluir a solicitação. Tente novamente.';
}
