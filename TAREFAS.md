# 📋 Tarefas do Projeto: Guia do Busão

Este documento organiza o que cada equipe precisa fazer para entregar a versão inicial (MVP) do nosso projeto. Cada item deve se tornar um cartão no nosso quadro Kanban (GitHub Projects).

---

## 🎨 Equipe Frontend (Interface)
**Objetivo:** Garantir que o site funcione bem no celular, tenha botões interativos e mostre os dados que virão do banco de dados de forma bonita.

- [ ] **Arrumar Links Quebrados (Urgente):** A pasta `css`, `js` e `assets` mudou de lugar. Abrir os arquivos HTML (`index.html`, `pesquisa.html`, etc.) e trocar todos os caminhos que começam com `../` para `./` (Exemplo: `./css/style.css`).
- [ ] **Padronizar Estilos:** Revisar o `style.css` para garantir que as fontes, cores e botões sigam um único padrão.
- [ ] **Criar a Tela Home (`index.html`):** Onde o usuário digita de onde ele quer sair e para onde quer ir.
- [ ] **Criar Tela de Resultados (`pesquisa.html`):** Deve mostrar uma lista das opções de ônibus disponíveis após a busca.
- [ ] **Criar Tela de Detalhes (`rota.html`):** Mostrar o itinerário completo e os horários de uma linha específica clicada.
- [ ] **Preparar o JavaScript (`main.js`):** Criar funções usando `fetch` para se conectar com a API que a equipe Backend vai construir (Ex: `fetch('http://localhost:3000/api/linhas')`).

---

## 💻 Equipe Backend (Servidor e API)
**Objetivo:** Criar o "cérebro" do projeto. O servidor que vai receber as perguntas do Frontend, buscar a resposta no Banco de Dados e devolver para a tela.

- [ ] **Configurar o Servidor Base:** Escrever o código inicial no `backend/server.js` usando Express para rodar o projeto na porta 3000. Testar com um simples "Hello World".
- [ ] **Servir os Arquivos do Frontend:** Configurar o Express (`express.static`) para conseguir exibir os arquivos da pasta `frontend/` pelo navegador usando `localhost:3000`.
- [ ] **Criar Rota (Endpoint) de Listagem:** Criar o código em `backend/routes/` para o endpoint `GET /api/linhas`. Ele deve devolver uma lista JSON com todos os ônibus.
- [ ] **Criar Rota (Endpoint) de Busca:** Criar o endpoint `GET /api/busca?origem=A&destino=B` para filtrar ônibus específicos.
- [ ] **Criar Regras de Negócio (Controllers):** Fazer a lógica em `backend/controllers/` que recebe a requisição, fala com o Banco de Dados e valida erros.

---

## 🗄️ Equipe Banco de Dados (Dados e Modelagem)
**Objetivo:** Decidir onde os dados ficarão salvos e preencher o sistema com as informações das linhas, paradas e horários.

- [ ] **Escolher a Tecnologia:** Decidir se usaremos MongoDB (ideal para JavaScript/Node), PostgreSQL ou SQLite. (Para o MVP, podemos até começar com um arquivo `data.json` local).
- [ ] **Modelar o Schema (A Estrutura dos Dados):** Definir exatamente quais informações um Ônibus tem. 
  - *Exemplo:* Nome da linha, Número, Preço, Horários de Saída, Array de Paradas.
- [ ] **Preencher Dados de Teste (Seed):** Levantar dados reais (ou inventados) de 5 a 10 linhas de ônibus principais da cidade e inseri-las no banco. Sem isso, o sistema fica vazio.
- [ ] **Conectar Banco ao Backend:** Ajudar a equipe Backend a escrever a conexão (`backend/database/connection.js`) garantindo que o `server.js` consiga ler e gravar informações no banco de dados com segurança.
