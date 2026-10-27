
const database = require("../database/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET || "segredo_guia_busao",
        { expiresIn: "1d" }
    );
}

function formatarUsuario(usuario) {
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone ?? null
    };
}

async function cadastrarUsuario(nome, telefone, email, senha) {
    const senhaHash = await bcrypt.hash(senha, 10);

    const resposta = await database.query(
        `INSERT INTO usuarios (nome, telefone, email, senha)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nome, email, telefone`,
        [nome, telefone, email, senhaHash]
    );

    return resposta.rows[0];
}

async function loginUsuario(email, senha) {
    const resultado = await database.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
    );

    const usuario = resultado.rows[0];

    if (!usuario || !usuario.senha) {
        return null;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
        return null;
    }

    return {
        token: gerarToken(usuario),
        usuario: formatarUsuario(usuario)
    };
}

async function loginGoogle(credential) {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID não configurado no servidor.");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (
        !payload ||
        !payload.sub ||
        !payload.email ||
        payload.email_verified !== true
    ) {
        const erro = new Error(
            "A conta Google não possui e-mail verificado."
        );
        erro.status = 401;
        throw erro;
    }

    const googleSub = payload.sub;
    const email = payload.email.toLowerCase();

    const resultadoGoogle = await database.query(
        "SELECT * FROM usuarios WHERE google_sub = $1",
        [googleSub]
    );

    let usuario = resultadoGoogle.rows[0];

    if (!usuario) {
        const resultadoEmail = await database.query(
            "SELECT * FROM usuarios WHERE LOWER(email) = $1",
            [email]
        );

        if (resultadoEmail.rows.length > 0) {
            const erro = new Error(
                "Este e-mail já possui uma conta. Entre com seu método habitual antes de vincular o Google."
            );
            erro.status = 409;
            throw erro;
        }

        const nome =
            typeof payload.name === "string" && payload.name.trim()
                ? payload.name.trim()
                : email.split("@")[0];

        const novoUsuario = await database.query(
            `INSERT INTO usuarios
                (nome, telefone, email, senha, google_sub)
             VALUES ($1, NULL, $2, NULL, $3)
             RETURNING id, nome, email, telefone, google_sub`,
            [nome, email, googleSub]
        );

        usuario = novoUsuario.rows[0];
    }

    return {
        token: gerarToken(usuario),
        usuario: formatarUsuario(usuario)
    };
}

async function atualizarPerfil(usuarioId, nome, telefone) {
    const resultado = await database.query(
        `UPDATE usuarios
         SET nome = $1, telefone = $2
         WHERE id = $3
         RETURNING id, nome, email, telefone`,
        [nome, telefone || null, usuarioId]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    loginGoogle,
    atualizarPerfil
};
