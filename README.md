# Meu Cine

Catálogo de filmes e séries em alta, construído com as tecnologias mais recentes para uma experiência rápida e fluida.

## 🚀 Sobre o Projeto

O **Meu Cine** é um catálogo interativo que permite explorar filmes e séries em tendência, buscar títulos específicos, favoritar (Gostei/Não Gostei) e gerenciar uma lista de "Assistir Depois" (Watchlist).

### 🛠 Tecnologias Utilizadas

- **Framework:** Next.js 16 (App Router + Turbopack + Cache Components + PPR)
- **Estilização:** Tailwind CSS (v4)
- **Autenticação e Banco:** Supabase
- **API de Dados:** The Movie Database (TMDB)
- **Linguagem:** TypeScript

## ⚙️ Como rodar localmente

Para executar este projeto em sua máquina local, siga os passos abaixo:

### Pré-requisitos
- Node.js (versão 20 ou superior recomendada)
- Git

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/fernandoeliojr/meu-cine.git
   cd meu-cine
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Preencha as chaves (`NEXT_PUBLIC_TMDB_API_KEY`, `SUPABASE_URL`, etc.) com suas credenciais do TMDB e Supabase.
4. Rode o projeto:
   ```bash
   npm run dev
   ```
5. Acesse o projeto em: `http://localhost:3000`

---
