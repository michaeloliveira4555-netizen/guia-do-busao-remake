const express = require("express");

const router = express.Router();

const horariosController = require("../controllers/horariosController");

router.get(
    "/linha/:linhaId",
    horariosController.buscarHorariosPorLinha
);

module.exports = router;