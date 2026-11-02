# 📋 Tarefas do Projeto: Guia do Busão

Este documento registra o status final do projeto e o cumprimento dos requisitos de conclusão de curso.

---

## 🗄️ Equipe Banco de Dados (Dados e Modelagem) — 100% CONCLUÍDO ✅
- [x] **Escolher a Tecnologia:** PostgreSQL hospedado na nuvem (Aiven) com SSL ativo.
- [x] **Modelar o Schema:** Tabelas criadas (`cidades`, `rotas`, `viacoes`, `horarios`, `usuarios`, `favoritos`).
- [x] **Preencher Dados Reais:** Banco populado com 36 cidades, 71 rotas reais e 239 horários de ônibus (além de base complementar ANTT).
- [x] **Conexão com o Backend:** Arquivo `backend/database/db.js` configurado com pool de conexões e variáveis de ambiente no `.env`.

---

## 💻 Equipe Backend (Servidor e API) — 100% CONCLUÍDO ✅
- [x] **Configurar o Servidor Base (`server.js`):** Express rodando na porta 3000 com CORS e parser JSON.
- [x] **Servir Arquivos do Frontend:** Middleware `express.static` configurado para abrir o site direto em `http://localhost:3000`.
- [x] **APIs de Rotas (`rotaService` / `rotasController`):** Endpoints `/api/rotas`, `/api/rotas/:id` e `/api/rotas/buscar` integrados ao PostgreSQL via `JOIN`.
- [x] **APIs de Horários (`horariosService` / `horariosController`):** Endpoint `/api/horarios/linha/:linhaId` trazendo horários, viações e tarifas reais.
- [x] **Base de Horários Interestaduais ANTT:** Endpoint `/api/horarios/antt` com consulta integrada.
- [x] **Autenticação Segura (`usuariosService` / `usuariosController`):**
  - Cadastro com senha criptografada via **Bcrypt** (Salt rounds = 10) em `POST /api/usuarios`.
  - Login seguro com comparação de hash e emissão de **Token JWT** em `POST /api/usuarios/login`.
  - Suporte a login via Google OAuth e endpoint de edição de perfil.
- [x] **Favoritos e Rotas Salvas:** Endpoints protegidos por middleware de autenticação (`/api/favoritos`, `/api/rotas-salvas`).
- [x] **Diferencial 2 (Swagger):** Documentação interativa OpenAPI 3.0 configurada em `/api-docs`.

---

## 🎨 Equipe Frontend (Interface e Integração) — 100% CONCLUÍDO ✅
- [x] **Estrutura de Telas (HTML/CSS):** Início, Pesquisa, Resultados, Rota, Cadastro, Login, Favoritos, Rotas Salvas e Perfil.
- [x] **Consumo de Rotas na Home (`main.js`):** Autocomplete da busca consumindo e listando as cidades reais do backend.
- [x] **Exibição de Resultados (`resultado.js` / `resultado.html`):**
  - Listagem dos ônibus encontrados com horários, viações e preços.
- [x] **Tela de Detalhes da Linha (`rota.html` / `rota-detalhes.js`):**
  - Exibição do itinerário completo, empresas e paradas.
- [x] **Autenticação no Frontend (`login.js` / `cadastro.js`):**
  - Armazenamento de sessão e token no `localStorage`.

---

## 🐳 Infraestrutura e DevOps — 100% CONCLUÍDO ✅
- [x] **Diferencial 1 (Docker):** `Dockerfile` com Node 24 Debian Slim otimizado.
- [x] **Orquestração de Containers:** `compose.yaml` com mapeamento de portas e injeção de variáveis de ambiente.
- [x] **Ambiente Padronizado:** Arquivo `.env.example` para replicação simples por avaliadores.
