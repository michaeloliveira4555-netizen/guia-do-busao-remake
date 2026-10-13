const database = require("../database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();


async function cadastrarUsuario(nome, telefone, email, senha) {
    const senhaHash = await bcrypt.hash(senha, 10);

    const resposta = await database.query('INSERT INTO usuarios (nome, telefone, email, senha) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, telefone;', [nome, telefone, email, senhaHash]);

    return resposta.rows[0];
}

async function loginUsuario(email, senha) {
    const linhas = await database.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    const usuario = linhas.rows[0];

    if (!usuario) {
        return null;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
        return null;
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET || "segredo_guia_busao", { expiresIn: "1d" });

    return {
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
        }
    };
}

module.exports = {
    cadastrarUsuario,
    loginUsuario    
};