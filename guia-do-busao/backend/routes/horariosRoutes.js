const express = require("express");

const router = express.Router();

const horariosController = require("../controllers/horariosController");

// Todos os horários
router.get("/", horariosController.listarHorarios);

// Horários de uma linha específica
router.get(
    "/linha/:linhaId",
    horariosController.buscarHorariosPorLinha
);

// Horário específico pelo ID
router.get("/:id", horariosController.buscarHorario);

module.exports = router;