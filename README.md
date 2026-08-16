# Build Roulette

Build Roulette é uma aplicação web para gerar ideias aleatórias de produtos/serviços para desenvolvedores, founders e criadores. A proposta é ajudar a encontrar inspiração rápida com combinações entre tipos de produto, nichos e diferenciais.

## Visão geral

O projeto foi construído com Next.js e React, seguindo a estrutura do App Router. Ele gera ideias como:

- "Build a SaaS for dentists"
- "Build a mobile app for photographers"
- "Build an AI tool for restaurants"

Além disso, a interface permite:

- girar/gerar novas ideias
- copiar a ideia para a área de transferência
- salvar ideias favoritas
- compartilhar via Web Share API ou cópia
- ativar rotação automática
- manter histórico local no navegador

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- LocalStorage para persistência no navegador

## Estrutura do projeto

```text
.
├── app/
│   ├── data.ts          # geração de ideias e formatação
│   ├── globals.css      # estilos globais
│   ├── layout.tsx       # layout raiz + metadata
│   ├── page.tsx         # página inicial
│   └── roulette.tsx     # lógica principal da interface e estado
├── public/              # arquivos estáticos
├── package.json         # scripts e dependências
├── next.config.ts       # configuração do Next.js
├── tsconfig.json        # configuração do TypeScript
├── eslint.config.mjs    # configuração do ESLint
├── postcss.config.mjs   # configuração do PostCSS
├── README.md            # documentação do projeto
└── next-env.d.ts        # arquivos do Next.js
```

## Como executar

### 1) Instale as dependências

```bash
npm install
```

### 2) Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 3) Acesse no navegador

Abra em:

```text
http://localhost:3000
```

## Scripts disponíveis

```bash
npm run dev     # inicia o ambiente de desenvolvimento
npm run build   # gera a build de produção
npm run start   # inicia a aplicação em produção
npm run lint    # executa a análise estática com ESLint
```

## Como funciona

A lógica principal está em `app/data.ts`:

- `PRODUCT_TYPES`: tipos de produto
- `NICHES`: nichos de clientes
- `DIFFERENTIATORS`: diferenciais/opções extras
- `generateIdea()`: cria uma combinação aleatória sem repetir o mesmo produto/nicho do item anterior
- `formatIdea()`: monta a frase final em texto legível

A interface em `app/roulette.tsx` gerencia:

- estado da ideia atual
- rotação da ideia
- contador de ideias geradas
- histórico recente
- ideias favoritas
- funcionalidade de compartilhamento e cópia

Os dados são persistidos no `localStorage`, então o usuário mantém histórico e favoritos entre recarregamentos da página.

## Funcionalidades principais

- Geração aleatória de ideias de produtos
- Botão para gerar outra proposta
- Espaço do teclado para girar rapidamente
- Modo de auto-rodar
- Copiar a ideia para clipboard
- Salvar ideias em favoritos
- Histórico das últimas ideias
- Compartilhamento com API nativa do navegador

## Dica de uso

O app funciona melhor como ferramenta de brainstorming. Ideal para:

- validar conceitos iniciais
- encontrar nichos interessantes
- explorar ideias para projetos pessoais
- acelerar o processo de ideação de MVPs

## Observações

- O projeto não possui banco de dados; os dados ficam no navegador do usuário.
- A interface é totalmente client-side, com foco em experiência rápida e interativa.
- O projeto foi pensado como uma ferramenta leve e imediata de ideação.

## Contribuição

Sinta-se à vontade para abrir issues ou pull requests com melhorias, novas categorias de ideias, ajustes de UX ou novos recursos.
