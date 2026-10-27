const express = require("express");
const router = express.Router();

const autenticarUsuario = require("../middlewares/autenticarUsuario");
const controller = require("../controllers/rotasSalvasController");

router.use(autenticarUsuario);

router.get("/", controller.listarRotasSalvas);
router.post("/", controller.salvarRota);
router.put("/:id", controller.editarRota);
router.delete("/:id", controller.excluirRota);

module.exports = router;
