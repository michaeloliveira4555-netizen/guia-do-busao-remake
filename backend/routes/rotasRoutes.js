const express = require("express");

const router = express.Router();

const rotasController = require("../controllers/rotasController");

router.get("/", rotasController.listarRotas);

router.get(
    "/buscar",
    rotasController.buscarRotasPorOrigemDestino
);

router.get("/:id", rotasController.buscarRota);

module.exports = router;