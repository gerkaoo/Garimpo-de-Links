# Garimpo de Links

Plataforma de curadoria de ofertas de **casa e beleza** do Mercado Livre e da Shopee.

[Abrir a plataforma hospedada](https://garimpo-casa-beleza-gerkaoo.sleekauk2.chatgpt.site/)

## Funcionalidades

- Catálogo de achados com link original, preço de referência e origem da pesquisa.
- Fotos recuperadas dos anúncios, com ilustração identificada quando a foto não está disponível.
- Criação de post a partir de um link, com identificação da loja e mensagem editável.
- Fluxo simplificado: **Preparar → Prontas para postar → Publicadas**.
- Aprovação obrigatória antes de copiar a mensagem para publicação manual.
- Histórico, filtros e exportação/restauração de backup JSON.

## Executar

O frontend é HTML, CSS e JavaScript, sem dependências de build. Abra `dist/index.html` no navegador ou sirva a pasta `dist` por HTTP.

Exemplo com Python instalado:

```sh
python -m http.server 4173 --directory dist
```

Abra http://localhost:4173. Também é possível hospedar a pasta `dist` em um serviço de sites estáticos.

## Verificar

Com Node.js instalado:

```sh
node --check dist/app.js
node --check dist/compose.js
node --check dist/simple-flow.js
node check-flow.cjs
```

O teste verifica regras do fluxo, links, aprovação obrigatória, confirmação de publicação manual, persistência e composição de posts. Não substitui testes visuais no navegador.

## Estrutura

```text
dist/
  index.html             Interface e navegação
  app.js                 Ofertas, revisão, aprovação e armazenamento
  catalog.js             Catálogo pesquisado e fontes dos preços
  compose.js             Criação de post por link
  simple-flow.js         Fluxo de três etapas
  photos.js              Associação de fotos e origem das imagens
  assets/                Fotos dos anúncios
  *.css                  Estilos responsivos
check-flow.cjs           Verificações do fluxo
fetch-product-photos.cjs Recuperação das fotos já identificadas
research-images.cjs     Tentativa de leitura dos metadados dos anúncios
```

## Dados e integrações

Os links de afiliado, mensagens e aprovações do usuário ficam no **localStorage do navegador**. Não há sincronização entre dispositivos; use o backup JSON antes de limpar os dados do navegador. Os dados pessoais cadastrados no navegador não fazem parte deste repositório.

O catálogo publicado é uma pesquisa estática: valores podem mudar e precisam ser conferidos no anúncio antes de divulgar. O formulário identifica a loja pelo link, mas o usuário informa título, preço e condições. Os textos são montados por modelo editável, sem IA conectada.

Não há backend, consulta de preços em tempo real, geração de links de afiliado ou envio automático ao WhatsApp. A aprovação e a publicação são manuais. Editar uma oferta aprovada exige nova aprovação.

A busca agendada da instalação original é uma automação externa do Codex. Clonar este repositório não cria nem ativa esse agendamento. Os horários exibidos na interface descrevem aquela instalação. Para execução independente, é necessário implementar um serviço de pesquisa e armazenamento e configurar seu próprio agendamento.

As fotos em `dist/assets` foram recuperadas dos anúncios originais; as URLs de origem estão em `dist/photos.js`. Cores, composição e quantidade dependem da variação escolhida no anúncio.
