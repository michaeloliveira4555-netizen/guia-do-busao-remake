const express = require("express");

const router = express.Router();

const rotasController = require("../controllers/rotasController");

// Todas as rotas
router.get("/", rotasController.listarRotas);

// Pesquisa por origem e destino
router.get(
    "/buscar",
    rotasController.buscarRotasPorOrigemDestino
);

// Rota específica pelo ID
router.get("/:id", rotasController.buscarRota);

module.exports = router;