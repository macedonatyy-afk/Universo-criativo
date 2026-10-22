# Universo Criativo

Projeto Next.js com App Router e JavaScript, preparado para publicar na Vercel.

## Rodar localmente

1. Instale Node.js (versão 20 ou superior).
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e configure `NEXT_PUBLIC_SUPABASE_URL` com a URL do projeto Supabase. Configure a chave pública em `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon), `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (publishable). Basta uma dessas variáveis de chave; se várias estiverem definidas, a prioridade segue essa ordem. Nunca use a chave `service_role` ou uma chave secreta `sb_secret_`.
4. No painel do Supabase, habilite o provedor **Email** em Authentication e configure a **Site URL** com o endereço do site (localmente, `http://localhost:3000`). Na Vercel, cadastre as mesmas variáveis antes do build.
5. Execute `npm run dev`.
6. Acesse http://localhost:3000. Visitantes sem sessão são enviados para `/login`.

## Autenticação

Em `/login`, informe e-mail e senha e escolha **Entrar** ou **Criar conta**. Se a confirmação de e-mail estiver habilitada no Supabase, confirme pelo link recebido e volte ao login para entrar. Sem confirmação obrigatória, o cadastro inicia a sessão automaticamente.

A página principal valida a sessão no servidor. O middleware renova os cookies de autenticação; no topo da página aparecem o e-mail da pessoa conectada e o botão **Sair**, que encerra a sessão deste navegador. Mensagens de autenticação são exibidas em português.

Para validar a compilação, pare o servidor de desenvolvimento e execute `npm run build`. Não execute build e desenvolvimento simultaneamente, pois ambos usam `.next`. Para testar produção, execute `npm start` após o build.

Para verificar os nomes de variáveis aceitos e a validação da configuração, execute `node --test tests/supabase-config.test.mjs` com Node.js 20.19+.

Se aparecer o aviso de acesso não configurado na Vercel, confira a URL e uma das variáveis de chave pública acima em **Settings → Environment Variables**, nos ambientes **Production** e **Preview**. Depois faça **Redeploy** e abra a implantação mais recente marcada como **Ready**. Alterar variáveis não atualiza implantações anteriores.

## Publicar na Vercel

Envie estes arquivos para o repositório GitHub `macedonatyy-afk/Universo-criativo`. Na Vercel, importe esse repositório e clique em **Deploy**.

## Personalizar

- Título, campos, botão, modelo e instruções da IA: `desafio.js`
- Cores e aparência: `app/globals.css`

## Isso é golpe? — Etapa B

`desafio.js` configura a tela e o comportamento da análise. A rota autenticada `POST /api/ia` recebe `{ "campos": { "mensagem": "texto suspeito" } }` e devolve apenas o texto da resposta. A chave da OpenRouter nunca é enviada ao navegador.

O projeto começa com `modoTeste: true`: o formulário mostra uma resposta de exemplo, explicitamente identificada, sem chamar a OpenRouter e sem gastar a cota. O exemplo não classifica de verdade a mensagem enviada.

Depois de conferir esse teste, cadastre `OPENROUTER_API_KEY` na Vercel, altere `modoTeste` para `false` em `desafio.js` e publique novamente. O servidor usa o modelo `openrouter/free` com `max_tokens: 900`. Erros de limite de uso, chave inválida e conexão são exibidos em português.

Nesta etapa as mensagens e respostas ainda não são salvas no banco; o histórico será implementado na Etapa C. Por isso, o aviso da tela inclui a orientação sobre IA da apostila, sem afirmar que já existe armazenamento privado. A dupla criou as políticas na tabela `resposta` (singular); confirme esse nome antes de implementar o histórico.

Execute `npm test` para validar a configuração do Supabase e o fluxo de análise. Os testes simulam a OpenRouter e não utilizam chaves reais nem consomem cota.
