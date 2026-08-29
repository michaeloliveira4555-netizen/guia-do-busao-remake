const express = require("express");

const router = express.Router();

const usuariosController = require("../../Login/usuariosController");

router.get("/", usuariosController.listarUsuarios);

module.exports = router;