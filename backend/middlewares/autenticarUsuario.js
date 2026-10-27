const jwt = require("jsonwebtoken");
require("dotenv").config();

function autenticarUsuario(req, res, next) {
    const autorizacao = req.headers.authorization;

    if (!autorizacao || !autorizacao.startsWith("Bearer ")) {
        return res.status(401).json({
            mensagem: "Faça login para atualizar seu perfil."
        });
    }

    const token = autorizacao.slice(7);

    try {
        const segredo = process.env.JWT_SECRET || "segredo_guia_busao";
        const payload = jwt.verify(token, segredo);

        if (!payload.id) {
            return res.status(401).json({
                mensagem: "Token inválido."
            });
        }

        req.usuarioId = payload.id;
        next();
    } catch (erro) {
        return res.status(401).json({
            mensagem: "Sessão expirada ou token inválido. Entre novamente."
        });
    }
}

module.exports = autenticarUsuario;
