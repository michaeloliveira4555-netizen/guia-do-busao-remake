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

const app = express()

const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
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
app.use("/api/rotas", rotasRoutes);
app.use("/api/rotas-salvas", rotasSalvasRoutes);
app.use("/api/favoritos", favoritosRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/horarios/antt", anttRoutes);

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

app.listen(PORT, () => {
    console.log("=================================");
    console.log("      GUIA DO BUSÃO - API");
    console.log("=================================");
    console.log(`Servidor iniciado na porta ${PORT}`);
});