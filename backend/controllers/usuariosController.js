
const usuariosService = require("../services/usuariosService");

async function cadastrarUsuario(req, res) {
    try {
        const { nome, email, telefone, senha } = req.body;

        if (!nome || !email || !telefone || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos!"
            });
        }

        const novoUsuario = await usuariosService.cadastrarUsuario(
            nome,
            telefone,
            email,
            senha
        );

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: novoUsuario
        });
    } catch (erro) {
        console.error("Erro no cadastro:", erro);

        if (erro.code === "23505") {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário."
        });
    }
}

async function loginUsuario(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos!"
            });
        }

        const resultado = await usuariosService.loginUsuario(email, senha);

        if (!resultado) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos!"
            });
        }

        return res.status(200).json(resultado);
    } catch (erro) {
        console.error("Erro no login:", erro);

        return res.status(500).json({
            mensagem: "Erro interno no servidor."
        });
    }
}

async function loginGoogle(req, res) {
    try {
        const { credential } = req.body;

        if (!credential || typeof credential !== "string") {
            return res.status(400).json({
                mensagem: "Credencial Google não informada."
            });
        }

        const resultado = await usuariosService.loginGoogle(credential);

        return res.status(200).json(resultado);
    } catch (erro) {
        if (erro.status === 401 || erro.status === 409) {
            return res.status(erro.status).json({
                mensagem: erro.message
            });
        }

        console.error("Erro no login Google:", erro);

        return res.status(401).json({
            mensagem: "Não foi possível autenticar com o Google."
        });
    }
}

async function atualizarPerfil(req, res) {
    try {
        const { nome, telefone } = req.body;

        if (typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({
                mensagem: "Informe seu nome."
            });
        }

        if (
            telefone !== undefined &&
            telefone !== null &&
            typeof telefone !== "string"
        ) {
            return res.status(400).json({
                mensagem: "Telefone inválido."
            });
        }

        const nomeLimpo = nome.trim();
        const telefoneLimpo = String(telefone ?? "").trim();

        if (nomeLimpo.length > 120 || telefoneLimpo.length > 30) {
            return res.status(400).json({
                mensagem: "Nome ou telefone excede o limite permitido."
            });
        }

        const usuario = await usuariosService.atualizarPerfil(
            req.usuarioId,
            nomeLimpo,
            telefoneLimpo
        );

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Perfil atualizado com sucesso!",
            usuario
        });
    } catch (erro) {
        console.error("Erro ao atualizar perfil:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar o perfil."
        });
    }
}

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    loginGoogle,
    atualizarPerfil
};
