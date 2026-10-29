# Garimpo de Links — versão para Vercel

Painel privado de curadoria de ofertas de Casa e Beleza do Mercado Livre e da Shopee. Fluxo: **Preparar → Prontas para postar → Publicadas**. Inclui criação de post por link, fotos de anúncios com fallback identificado, texto editável, aprovação obrigatória, cópia e registro de publicação manual.

## Versão 2

- Backend em Vercel Functions, independente do computador do proprietário.
- Acesso por senha e sessão assinada em cookie HttpOnly/Secure/SameSite.
- Persistência em Vercel Blob privado, com revisão e ETag para impedir que duas sessões sobrescrevam alterações silenciosamente.
- Sincronização entre dispositivos, com cópia local durante falhas de rede.
- Quatro acionamentos diários: 08h, 12h, 16h e 20h de Brasília (UTC 11h/15h/19h/23h). Cada cron executa uma vez por dia. No plano Hobby, o disparo pode ocorrer dentro da hora configurada.

**A integração de busca das lojas foi adiada pelo usuário.** Os agendamentos registram `pending_configuration`; não coletam ofertas, não simulam resultados e não enviam mensagens. A integração às fontes será implementada posteriormente. A publicação no WhatsApp continua manual.

## Verificações

Node.js 22+ e pnpm:

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm test
pnpm run check
```

Para testar a aplicação completa, configure as variáveis em `.env.local` (ignorado pelo Git), vincule o projeto à Vercel e execute `vercel dev`. Abrir apenas `dist/index.html` não fornece autenticação nem persistência: a versão 2 exige o backend.

## Publicar

Importe este repositório na Vercel, com a raiz na pasta principal e a saída em `dist`. O `vercel.json` declara build, funções e quatro crons. Não use `dist` como raiz, pois as funções estão em `api/`.

Conecte um **Vercel Blob privado** ao projeto. O SDK utiliza `BLOB_STORE_ID` e a identidade OIDC da função; instalações sem OIDC podem usar `BLOB_READ_WRITE_TOKEN` com acesso apenas ao armazenamento necessário. Nunca use armazenamento público para os dados do usuário.

Configure no ambiente de produção:

| Variável | Uso |
| --- | --- |
| `AUTH_SECRET` | Segredo aleatório de pelo menos 32 caracteres para assinar sessões |
| `ADMIN_PASSWORD` | Senha forte de pelo menos 16 caracteres para o espaço privado |
| `CRON_SECRET` | Segredo aleatório de pelo menos 32 caracteres para o agendamento |
| `BLOB_STORE_ID` | Blob privado conectado ao projeto |

Use valores diferentes para os segredos e não os coloque no código, em variáveis públicas ou em logs. Reimplante após alterar variáveis. Alterar `ADMIN_PASSWORD` invalida sessões anteriores.

Há um único espaço privado por instalação. Quem possuir a senha pode editá-lo. Não há cadastro público, recuperação de senha por e-mail ou multiusuário. A senha é administrada pelas variáveis da Vercel.

## Migrar dados do site anterior

1. No site antigo, use **Exportar meus dados**.
2. No endereço novo, entre com a senha da instalação.
3. Use **Restaurar backup**, confirme a importação e aguarde **Salvo na nuvem**.
4. Confira em outro dispositivo usando a mesma senha.

O domínio novo não pode ler o armazenamento local do antigo. A importação substitui o espaço atual, mediante confirmação. Faça backup antes de restaurar.

Se outra sessão alterar os dados, a gravação é recusada com conflito. Exporte o rascunho local e use **Atualizar da nuvem** para escolher a versão desejada. Falhas de rede ficam identificadas; aguarde “Salvo na nuvem” antes de considerar a alteração sincronizada.

## Arquivos principais

```text
api/session.js           Login e logout
api/workspace.js         Espaço privado
api/cron-*.js            Quatro acionamentos diários
lib/auth.js             Sessões e verificação de origem
lib/model.js            Validação de ofertas e etapas
lib/storage.js          Persistência privada e concorrência por ETag
lib/cron.js             Estado de integração pendente
lib/seed.json           Catálogo inicial, sem dados pessoais
dist/                   Interface, catálogo e fotos
scripts/build.mjs       Catálogo inicial validado
test/cloud.test.mjs     Testes do backend
check-flow.cjs          Testes do fluxo da interface
```

Preços do catálogo são referências pesquisadas, não cotações em tempo real. Confira preço, variação, vendedor e frete antes de divulgar. O formulário por link identifica a loja; título, preço e condições são informados pelo usuário. Os textos usam modelos editáveis, sem IA conectada. As fontes das fotos estão em `dist/photos.js`.
