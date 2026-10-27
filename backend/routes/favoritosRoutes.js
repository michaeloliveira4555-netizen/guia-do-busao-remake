const express = require("express");
const router = express.Router();

const autenticarUsuario = require("../middlewares/autenticarUsuario");
const controller = require("../controllers/favoritosController");

router.use(autenticarUsuario);

router.get("/", controller.listarFavoritos);
router.post("/", controller.adicionarFavorito);
router.delete("/:id", controller.removerFavorito);

module.exports = router;
