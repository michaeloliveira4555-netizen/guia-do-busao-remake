# 🚌 Guia do Busão

[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Aiven-blue.svg)](https://aiven.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D.svg)](http://localhost:3000/api-docs)

> **Projeto de Conclusão de Curso (TCC) — Codifica Edu**  
> Aplicação Web Full Stack completa para consulta, planejamento de rotas, itinerários e horários de transporte rodoviário e metropolitano.

---

## 📌 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Diferenciais Implementados](#-diferenciais-implementados)
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Executar o Projeto](#-como-executar-o-projeto)
  - [Opção 1: Com Docker Compose (Recomendado)](#opção-1-execução-com-docker-compose-recomendado)
  - [Opção 2: Execução Local com Node.js](#opção-2-execução-local-com-nodejs)
- [Documentação das APIs (Swagger)](#-documentação-das-apis-swagger)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Equipe e Rastreabilidade](#-equipe-e-rastreabilidade)

---

## 🎯 Sobre o Projeto

O **Guia do Busão** foi desenvolvido para solucionar a fragmentação e dificuldade de acesso às informações de transporte rodoviário. O sistema integra dados reais de rotas, horários de partidas, preços e empresas de transporte (incluindo integração com base ANTT), permitindo que qualquer usuário consulte viagens sem barreiras e que passageiros cadastrados salvem seus trajetos favoritos.

---

## ✨ Funcionalidades Principais

- 🔍 **Busca Inteligente de Rotas:** Autocomplete de cidades de origem e destino alimentado diretamente pelo banco de dados.
- 🕒 **Quadro de Horários e Tarifas:** Exibição detalhada de horários de partida, chegada, preços e viações responsáveis.
- 🚍 **Integração ANTT:** Consulta adicional de horários e itinerários interestaduais da Agência Nacional de Transportes Terrestres.
- 🔐 **Autenticação Segura de Usuários:**
  - Cadastro com senha criptografada via **Bcrypt** (10 salt rounds).
  - Autenticação e emissão de **Tokens JWT** (JSON Web Token).
  - Suporte a autenticação via Google OAuth.
- ⭐ **Favoritos e Rotas Salvas:** Usuários autenticados podem favoritar linhas recorrentes e cadastrar observações personalizadas de itinerários.
- 📱 **Interface 100% Responsiva:** Desenvolvida em HTML5, CSS3 moderno e JavaScript puro, otimizada para celulares, tablets e computadores.

---

## 🏆 Diferenciais Implementados

Em conformidade com os adicionais sugeridos para conclusão de curso:

1. **🐳 Docker e Docker Compose:**
   - Implantação simplificada com `Dockerfile` (Node 24 Slim) em multi-camadas e `compose.yaml`.
   - Padronização total do ambiente de execução, eliminando variações de sistema operacional.
2. **📖 Documentação Interativa com Swagger (OpenAPI 3.0):**
   - Disponível no endpoint `/api-docs` com interface gráfica interativa para explorar e testar todas as rotas da API em tempo de execução.

---

## 🛠️ Arquitetura e Tecnologias

- **Frontend:** HTML5 semântico, CSS3 (variáveis, flexbox, grid, responsividade) e Vanilla JavaScript (Fetch API, manipulação de DOM).
- **Backend:** Node.js (v24), Express 5, CORS, Dotenv, JWT (`jsonwebtoken`) e Hashing de senhas (`bcryptjs`).
- **Banco de Dados:** PostgreSQL hospedado na nuvem (Aiven) com Pool de conexões seguro via SSL.
- **Containerização:** Docker e Docker Compose.
- **Documentação de API:** Swagger UI (`swagger-ui-express`) e OpenAPI 3.0.

---

## 📂 Estrutura do Repositório

```text
guia-do-busao-remake/
├── .dockerignore                 # Arquivos ignorados pelo build do Docker
├── .gitignore                    # Arquivos e variáveis ignorados pelo Git
├── Dockerfile                    # Receita da imagem Docker (Node 24 Slim)
├── compose.yaml                  # Orquestração do container via Docker Compose
├── package.json                  # Dependências e scripts do projeto
├── README.md                     # Documentação oficial do projeto
├── TAREFAS.md                    # Histórico e divisão de squads/tarefas
├── backend/
│   ├── .env.example              # Exemplo de configuração de variáveis
│   ├── server.js                 # Ponto de entrada do servidor Express
│   ├── controllers/              # Controladores das requisições HTTP
│   ├── database/                 # Conexão e pool do PostgreSQL
│   ├── docs/                     # Especificação OpenAPI (swagger.json)
│   ├── middlewares/              # Validação de token JWT e segurança
│   ├── routes/                   # Definição das rotas e endpoints
│   ├── scripts/                  # Scripts de carga e população do banco
│   └── services/                 # Regras de negócio e consultas SQL (JOINs)
└── frontend/
    ├── index.html                # Tela inicial e busca de rotas
    ├── resultado.html            # Resultados das buscas com opções de ônibus
    ├── rota.html                 # Detalhes do trajeto e horários
    ├── login.html / cadastro.html# Telas de autenticação
    ├── favoritos.html            # Linhas favoritas do passageiro
    ├── rotas-salvas.html         # Itinerários salvos pelo usuário
    ├── css/                      # Folhas de estilo modulares
    └── js/                       # Scripts e integração com as APIs
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Git](https://git-scm.com/) instalado.
- [Node.js](https://nodejs.org/) (versão 20 ou superior) **OU** [Docker Desktop](https://www.docker.com/) instalado.

---

### Opção 1: Execução com Docker Compose (Recomendado)

Esta opção não requer instalação manual de dependências do Node na sua máquina.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/michaeloliveira4555-netizen/guia-do-busao-remake.git
   cd guia-do-busao-remake
   ```

2. **Configure as variáveis de ambiente:**
   Copie o arquivo de exemplo para criar o seu `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(Preencha a `DATABASE_URL` com as credenciais do PostgreSQL ou utilize a base na nuvem).*

3. **Suba os containers:**
   ```bash
   docker compose up --build
   ```

4. **Acesse no navegador:**
   - **Aplicação Web:** [http://localhost:3000](http://localhost:3000)
   - **Documentação Swagger:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

### Opção 2: Execução Local com Node.js

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/michaeloliveira4555-netizen/guia-do-busao-remake.git
   cd guia-do-busao-remake
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp backend/.env.example backend/.env
   ```

4. **Inicie o servidor:**
   ```bash
   npm start
   ```

5. **Acesse no navegador:**
   - **Aplicação:** [http://localhost:3000](http://localhost:3000)
   - **Documentação Swagger:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📑 Documentação das APIs (Swagger)

A API do Guia do Busão é completamente documentada no padrão OpenAPI 3.0. Quando o servidor estiver em execução, acesse **`http://localhost:3000/api-docs`** para consultar a documentação interativa com descrição de payloads, códigos de status e formulários de teste.

### Resumo dos Principais Endpoints:
| Método | Endpoint | Descrição | Autenticação |
| :--- | :--- | :--- | :---: |
| `GET` | `/api` | Verifica a saúde e status da API | Não |
| `GET` | `/api/rotas` | Lista todas as rotas com cidades de origem e destino | Não |
| `GET` | `/api/rotas/buscar` | Busca rotas filtradas por origem e destino | Não |
| `GET` | `/api/rotas/:id` | Detalhes de uma rota específica | Não |
| `GET` | `/api/horarios/linha/:linhaId` | Horários, preços e viações de uma linha | Não |
| `GET` | `/api/horarios/antt` | Consulta horários na base interestadual ANTT | Não |
| `POST` | `/api/usuarios` | Cadastro de novo usuário (senha protegida com Bcrypt) | Não |
| `POST` | `/api/usuarios/login` | Login com autenticação e retorno de Token JWT | Não |
| `PUT` | `/api/usuarios/perfil` | Atualização de dados cadastrais e senha | Sim (Bearer) |
| `GET` | `/api/favoritos` | Lista rotas favoritadas pelo usuário logado | Sim (Bearer) |
| `POST` | `/api/favoritos` | Adiciona uma rota aos favoritos | Sim (Bearer) |
| `DELETE` | `/api/favoritos/:id` | Remove uma rota dos favoritos | Sim (Bearer) |
| `GET` | `/api/rotas-salvas` | Lista anotações de rotas personalizadas do usuário | Sim (Bearer) |
| `POST` | `/api/rotas-salvas` | Cria uma rota salva personalizada | Sim (Bearer) |

---

## 🔐 Variáveis de Ambiente

As configurações sensíveis são isoladas no arquivo `backend/.env`:

```env
# URL de conexão com o PostgreSQL
DATABASE_URL=postgres://usuario:senha@host:porta/nomedobanco

# Porta do servidor HTTP
PORT=3000

# Chave secreta para criptografia e validação de tokens JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui
```

---

## 👥 Equipe e Rastreabilidade

O projeto foi construído de forma colaborativa com divisão em squads e fluxo profissional de versionamento via Git (Branches temáticas, Pull Requests revisados e Commits padronizados):

- **🎨 Frontend Squad:** Criação das telas responsivas, estilização CSS e consumo de endpoints via JavaScript Vanilla.
- **💻 Backend Squad:** Arquitetura MVC (Routes, Controllers, Services), segurança (Bcrypt/JWT), documentação Swagger e servidor Express.
- **🗄️ Banco de Dados Squad:** Modelagem relacional, população com dados reais na nuvem (Aiven PostgreSQL) e otimização de queries com JOINs.
