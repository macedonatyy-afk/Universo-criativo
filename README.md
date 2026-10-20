# Universo Criativo

Projeto Next.js com App Router e JavaScript, preparado para publicar na Vercel.

## Rodar localmente

1. Instale Node.js (versão 20 ou superior).
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com a URL e a chave pública anon do seu projeto Supabase. Nunca use a chave `service_role`.
4. No painel do Supabase, habilite o provedor **Email** em Authentication e configure a **Site URL** com o endereço do site (localmente, `http://localhost:3000`). Na Vercel, cadastre as mesmas variáveis antes do build.
5. Execute `npm run dev`.
6. Acesse http://localhost:3000. Visitantes sem sessão são enviados para `/login`.

## Autenticação

Em `/login`, informe e-mail e senha e escolha **Entrar** ou **Criar conta**. Se a confirmação de e-mail estiver habilitada no Supabase, confirme pelo link recebido e volte ao login para entrar. Sem confirmação obrigatória, o cadastro inicia a sessão automaticamente.

A página principal valida a sessão no servidor. O middleware renova os cookies de autenticação; no topo da página aparecem o e-mail da pessoa conectada e o botão **Sair**, que encerra a sessão deste navegador. Mensagens de autenticação são exibidas em português.

Para validar a compilação, pare o servidor de desenvolvimento e execute `npm run build`. Não execute build e desenvolvimento simultaneamente, pois ambos usam `.next`. Para testar produção, execute `npm start` após o build.

## Publicar na Vercel

Envie estes arquivos para o repositório GitHub `macedonatyy-afk/Universo-criativo`. Na Vercel, importe esse repositório e clique em **Deploy**.

## Personalizar

- Título e textos: `app/page.js`
- Cores e aparência: `app/globals.css`

O botão **Analisar** apenas repete o texto digitado, sem enviar dados para nenhum servidor.
