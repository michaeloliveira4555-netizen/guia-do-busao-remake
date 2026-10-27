const express = require("express");
const router = express.Router();

const usuariosController = require("../controllers/usuariosController");
const autenticarUsuario = require("../middlewares/autenticarUsuario");

router.post("/", usuariosController.cadastrarUsuario);
router.post("/login", usuariosController.loginUsuario);
router.post("/google", usuariosController.loginGoogle);

router.put(
    "/perfil",
    autenticarUsuario,
    usuariosController.atualizarPerfil
);

module.exports = router;
