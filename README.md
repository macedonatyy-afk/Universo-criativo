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

### Recuperação de senha

O link **Esqueci minha senha** abre `/esqueci-minha-senha`, que solicita o envio de um e-mail pelo Supabase. A confirmação é neutra e não revela se o e-mail tem uma conta. Abra o link no mesmo navegador em que iniciou o pedido, para preservar o verificador PKCE.

No Supabase, em **Authentication → URL Configuration**, confirme a Site URL principal e autorize `https://universo-criativo-3hbh.vercel.app/auth/callback` em **Redirect URLs** (ou mantenha a regra `https://universo-criativo-3hbh.vercel.app/**` se já estiver cadastrada). Para desenvolvimento local, autorize também o callback do endereço local utilizado.

O template padrão de **Reset Password** deve manter o link `{{ .ConfirmationURL }}`. O callback troca o código por uma sessão e abre `/redefinir-senha`; somente uma sessão validada pode atualizar a senha. Links inválidos ou expirados retornam ao pedido de recuperação, com erro em português. Para templates personalizados, o callback também aceita `token_hash` com `type=recovery`. O destino é sempre a página interna de nova senha, sem redirecionamento externo. A entrega real do e-mail depende da configuração e dos limites do Supabase.

## Halloween e ajuda

As páginas usam laranja, roxo e preto, com morcegos, teias, abóboras e um esqueleto decorativo. A fonte **Shadows Fright**, de Marvadesign, foi fornecida pelas autoras e fica em `public/fonts/shadows-fright.ttf`. Ela é carregada localmente por `next/font`, sem downloads de fonte durante o build ou acesso a serviços externos pelo navegador. Só os títulos maiores e a marca usam a fonte decorativa.

As cortinas pretas abrem na primeira visita de cada aba e permanecem como decoração do rodapé. A animação dura menos de dois segundos, não captura cliques e é desativada com `prefers-reduced-motion`. As ilustrações decorativas são ignoradas pelos leitores de tela. Os botões de exemplo continuam preenchendo a mensagem sem iniciar uma análise automaticamente.

A página pública `/ajuda` contém cinco passos para quem caiu em um golpe e pode ser acessada pelo topo e pelo rodapé, mesmo sem login. As orientações não prometem recuperar valores. Os testes de recuperação usam serviços simulados; valide o envio e a redefinição com uma conta de teste no Supabase real após publicar.

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

O teste inicial com `modoTeste: true` já foi concluído. Agora `modoTeste: false` ativa a análise pela OpenRouter. Para voltar a testar sem gastar cota, altere para `true`: o formulário mostra uma resposta de exemplo, explicitamente identificada, sem chamar a OpenRouter. O exemplo não classifica de verdade a mensagem enviada.

Cadastre `OPENROUTER_API_KEY` na Vercel antes de publicar com `modoTeste: false`. O servidor usa o modelo `openrouter/free` com `max_tokens: 900`. Erros de limite de uso, chave inválida e conexão são exibidos em português.

A chamada solicita raciocínio interno desativado aos modelos compatíveis, reservando o orçamento para a resposta final. Retornos em blocos de texto e erros no corpo de respostas HTTP 200 também são tratados. Respostas vazias ou incompletas não são exibidas como análises concluídas. Os logs técnicos de falha registram apenas códigos e contadores, sem a mensagem enviada, raciocínio interno ou chaves. Não há repetição automática de chamadas, para preservar a cota.

## Histórico — Etapa C

Cada análise concluída salva na tabela **`resposta` (singular)**, onde a dupla criou as políticas: `entrada` contém os campos com seus rótulos e `resposta` contém o texto da IA. O cliente Supabase usa a sessão da pessoa conectada. O código não recebe `user_id` do navegador: o banco deve preenchê-lo com `auth.uid()`. Resultados do modo de teste também são salvos quando esse modo é ativado.

O link **Meu histórico** abre `/historico`, protegido por login. A lista mostra somente a pessoa autenticada, ordena pelas mais recentes, preserva as quebras de linha e mostra data e hora de Brasília. Há paginação de 20 registros. Se o salvamento falhar, a análise continua visível com um aviso para copiá-la; nenhuma nova chamada à IA é feita automaticamente.

A tabela deve ter as colunas `id`, `user_id` (padrão `auth.uid()`), `entrada`, `resposta` e `criado_em`, com RLS ativado. As políticas de SELECT e INSERT devem restringir `auth.uid() = user_id`, conforme a apostila. Não basta apenas filtrar a tela: confirme as políticas no Supabase para proteger também acesso direto ao banco. Não use chave `service_role`.

Para testar no Supabase real: faça duas análises com a conta A e confira as duas no histórico. Em uma janela anônima, faça uma análise com a conta B: ela deve ver somente uma. Sem sessão, `/historico` deve redirecionar para `/login`. Análises feitas antes desta implementação não foram salvas e não aparecerão retroativamente.

Execute `npm test` para validar a configuração do Supabase, o fluxo de análise e o salvamento, ordenação e separação dos históricos. Os testes usam serviços simulados e não utilizam chaves reais nem consomem cota. Eles não substituem a verificação das políticas RLS no projeto Supabase real.
