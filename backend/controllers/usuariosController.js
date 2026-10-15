const usuariosService = require("../services/usuariosService")

async function cadastrarUsuario(req, res) {
    try {
        const { nome, email, telefone, senha } = req.body

        if (!nome || !email || !telefone || !senha) {
            return res.status(400).json({ mensagem: "Preencha todos os campos!" })
        }

        const novoUsuario = await usuariosService.cadastrarUsuario(nome, telefone, email, senha)

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: novoUsuario
        })
    } catch (erro) {
        console.error("Erro no cadastro:", erro)
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." })
    }
}

async function loginUsuario(req, res) {
    try {
        const { email, senha } = req.body

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Preencha todos os campos!" })
        }

        const resultado = await usuariosService.loginUsuario(email, senha)

        if (!resultado) {
            return res.status(401).json({ mensagem: "E-mail ou senha incorretos!" })
        }

        return res.status(200).json(resultado)
    } catch (erro) {
        console.error("Erro no login:", erro)
        return res.status(500).json({ mensagem: "Erro interno no servidor." })
    }
}

module.exports = {
    cadastrarUsuario,
    loginUsuario
}