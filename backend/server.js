const express = require("express")
const cors = require("cors")
const path = require("path")
const db = require("./database/db")

const rotasRoutes = require("./routes/rotasRoutes")
const horariosRoutes = require("./routes/horariosRoutes")
const usuariosRoutes = require("./routes/usuariosRoutes")
const anttRoutes = require("./routes/anttRoutes")
const rotasSalvasRoutes = require("./routes/rotasSalvasRoutes");
const favoritosRoutes = require("./routes/favoritosRoutes");

const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const migrarBanco = require("./database/migrar")

const app = express()

const PORT = process.env.PORT || 3000

// Desabilitar cabeçalho identificador do Express
app.disable("x-powered-by")

// Configurar Helmet com Content Security Policy permissiva para serviços essenciais (Google, Leaflet, OSM)
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://accounts.google.com",
                    "https://unpkg.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://unpkg.com"
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https://*.tile.openstreetmap.org",
                    "https://unpkg.com",
                    "https://*.googleusercontent.com"
                ],
                connectSrc: [
                    "'self'",
                    "https://accounts.google.com",
                    "https://*.tile.openstreetmap.org"
                ],
                frameSrc: [
                    "https://accounts.google.com"
                ],
                upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
            }
        },
        crossOriginEmbedderPolicy: false
    })
)

// CORS restrito a origens conhecidas e desenvolvimento local
const origensPermitidas = [
    "https://guia-do-busao-remake.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.use(
    cors({
        origin: (origem, callback) => {
            if (!origem || origensPermitidas.includes(origem) || /^http:\/\/localhost:\d+$/.test(origem)) {
                callback(null, true)
            } else {
                callback(new Error("Origem não permitida pelo CORS"))
            }
        },
        credentials: true
    })
)

// Limitador de taxa contra ataques de força bruta em autenticação
const limitadorAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { erro: "Muitas tentativas de autenticação. Tente novamente em 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require("./docs/swagger.json")

// Servir arquivos estáticos do Frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../frontend")))

// Documentação da API com Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Rota de status da API
app.get("/api", (req, res) => {
    res.status(200).json({
        mensagem: "API Guia do Busão funcionando!"
    })
})

// Rotas
app.use("/api/rotas", rotasRoutes)
app.use("/api/rotas-salvas", rotasSalvasRoutes)
app.use("/api/favoritos", favoritosRoutes)
app.use("/api/horarios", horariosRoutes)
app.use("/api/usuarios/login", limitadorAuth)
app.use("/api/usuarios/google", limitadorAuth)
app.use("/api/usuarios", usuariosRoutes)
app.use("/api/horarios/antt", anttRoutes)

// Rota inexistente
app.use((req, res) => {
    res.status(404).json({
        erro: "Rota não encontrada"
    });
});

// Erros
app.use((erro, req, res, next) => {
    console.error("Erro no servidor:", erro);

    res.status(500).json({
        erro: "Erro interno do servidor"
    });
});

app.listen(PORT, async () => {
    console.log("=================================");
    console.log("      GUIA DO BUSÃO - API");
    console.log("=================================");
    console.log(`Servidor iniciado na porta ${PORT}`);
    try {
        await migrarBanco()
    } catch (erroMigracao) {
        console.error("Aviso: Falha ao executar migrações automáticas:", erroMigracao.message)
    }
});