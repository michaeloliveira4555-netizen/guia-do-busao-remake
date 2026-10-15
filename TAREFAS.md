# 📋 Tarefas do Projeto: Guia do Busão

Este documento organiza o status do projeto e o que cada equipe precisa fazer para entregar a versão final (MVP). Os cartões no GitHub Projects devem refletir este arquivo.

---

## 🗄️ Equipe Banco de Dados (Dados e Modelagem) — 100% CONCLUÍDO ✅
**Status:** Todas as etapas foram finalizadas com dados reais na nuvem.

- [x] **Escolher a Tecnologia:** PostgreSQL hospedado na nuvem (Aiven) com SSL ativo.
- [x] **Modelar o Schema:** Tabelas criadas (`cidades`, `rotas`, `viacoes`, `horarios`, `usuarios`, `favoritos`).
- [x] **Preencher Dados Reais:** Banco populado com 36 cidades, 71 rotas reais e 239 horários de ônibus.
- [x] **Conexão com o Backend:** Arquivo `backend/database/db.js` configurado com pool de conexões e variáveis de ambiente no `.env`.

---

## 💻 Equipe Backend (Servidor e API) — 100% CONCLUÍDO ✅
**Status:** Toda a camada de negócios, segurança e rotas está pronta e funcional.

- [x] **Configurar o Servidor Base (`server.js`):** Express rodando na porta 3000 com CORS e parser JSON.
- [x] **Servir Arquivos do Frontend:** Middleware `express.static` configurado para abrir o site direto em `http://localhost:3000`.
- [x] **APIs de Rotas (`rotaService` / `rotasController`):** Endpoints `/api/rotas`, `/api/rotas/:id` e `/api/rotas/buscar` integrados ao PostgreSQL via `JOIN`.
- [x] **APIs de Horários (`horariosService` / `horariosController`):** Endpoint `/api/horarios/linha/:linhaId` trazendo horários, viações e tarifas reais.
- [x] **Autenticação Segura (`usuariosService` / `usuariosController`):**
  - Cadastro com senha criptografada via **Bcrypt** (Salt rounds = 10) em `POST /api/usuarios`.
  - Login seguro com comparação de hash e emissão de **Token JWT** em `POST /api/usuarios/login`.
- [x] **Limpeza de Código:** Remoção de arquivos legados e código morto (`localizacaoService.js`).

---

## 🎨 Equipe Frontend (Interface e Integração) — EM ANDAMENTO ⏳
**Status:** Telas visuais criadas, faltando ajustes de integração e fluxo entre telas.

- [x] **Estrutura de Telas (HTML/CSS):** Telas de Início, Pesquisa, Resultados, Rota, Cadastro e Login desenhadas.
- [x] **Consumo de Rotas na Home (`main.js`):** Autocomplete da busca consumindo e listando as cidades reais do backend.
- [ ] **Corrigir Exibição de Resultados (`resultado.js` / `resultado.html`):**
  - **Urgente:** Ajustar o `resultado.js` para ler a lista de rotas encontradas (`guiaBusaoRotasEncontradas`) em vez de esperar uma única rota (`guiaBusaoRotaSelecionada`), que atualmente causa a mensagem de "Viagem não encontrada".
  - Renderizar os cartões dos ônibus encontrados dentro do container `#resultsList`.
- [ ] **Integrar Tela de Detalhes da Linha (`rota.html`):**
  - Conectar ao clicar em um ônibus na tela de resultados para abrir `rota.html` e exibir seus horários reais consumindo `/api/horarios/linha/:id`.
- [ ] **Validar Fluxo de Cadastro e Login na Interface:**
  - Testar envio dos formulários de `cadastro.html` e `login.html`, salvando o token no `localStorage` e exibindo o usuário conectado no menu.
- [ ] **Limpeza de Arquivos Fora do Escopo:**
  - Remover scripts não utilizados que contêm dados fictícios (`posto.js`, `pedagios.js`, `calculadora.js`).
