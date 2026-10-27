const express = require("express");
const router = express.Router();
const anttController = require("../controllers/anttController");

router.get("/", anttController.pesquisar);

module.exports = router;
