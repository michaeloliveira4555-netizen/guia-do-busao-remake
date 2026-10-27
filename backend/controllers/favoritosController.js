const db = require("../database/db");

function validarTexto(valor, limite = 200) {
    return typeof valor === "string" &&
        valor.trim().length > 0 &&
        valor.trim().length <= limite;
}

function validarData(data) {
    if (data == null || data === "") return true;

    return typeof data === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(data) &&
        !Number.isNaN(Date.parse(`${data}T00:00:00Z`)) &&
        new Date(`${data}T00:00:00Z`).toISOString().slice(0, 10) === data;
}

function validarHorario(horario) {
    return horario == null || horario === "" ||
        (typeof horario === "string" &&
         /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(horario));
}

async function listarFavoritos(req, res) {
    try {
        const resultado = await db.query(
            `SELECT id, rota_id, empresa, origem, destino,
                    data_viagem, horario, preco, criada_em
             FROM favoritos
             WHERE usuario_id = $1
             ORDER BY criada_em DESC`,
            [req.usuarioId]
        );

        return res.json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao listar favoritos:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível carregar seus favoritos."
        });
    }
}

async function adicionarFavorito(req, res) {
    const {
        rota_id,
        empresa,
        origem,
        destino,
        data_viagem,
        horario,
        preco
    } = req.body;

    if (!validarTexto(origem) || !validarTexto(destino)) {
        return res.status(400).json({
            erro: "Informe uma origem e um destino válidos."
        });
    }

    if (origem.trim().toLowerCase() === destino.trim().toLowerCase()) {
        return res.status(400).json({
            erro: "A origem e o destino precisam ser diferentes."
        });
    }

    if (!validarData(data_viagem) || !validarHorario(horario)) {
        return res.status(400).json({
            erro: "A data ou o horário da viagem são inválidos."
        });
    }

    if (
        preco != null &&
        preco !== "" &&
        (!Number.isFinite(Number(preco)) || Number(preco) < 0)
    ) {
        return res.status(400).json({
            erro: "O preço informado é inválido."
        });
    }

    if (empresa != null && !validarTexto(empresa)) {
        return res.status(400).json({
            erro: "O nome da empresa é inválido."
        });
    }

    try {
        const resultado = await db.query(
            `INSERT INTO favoritos
                (usuario_id, rota_id, empresa, origem, destino,
                 data_viagem, horario, preco)
             VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8
             )
             ON CONFLICT DO NOTHING
             RETURNING id, rota_id, empresa, origem, destino,
                       data_viagem, horario, preco, criada_em`,
            [
                req.usuarioId,
                rota_id == null ? null : String(rota_id).slice(0, 200),
                empresa ? empresa.trim() : null,
                origem.trim(),
                destino.trim(),
                data_viagem || null,
                horario || null,
                preco == null || preco === "" ? null : Number(preco)
            ]
        );

        if (resultado.rows.length === 0) {
            const existente = await db.query(
                `SELECT id, rota_id, empresa, origem, destino,
                        data_viagem, horario, preco, criada_em
                 FROM favoritos
                 WHERE usuario_id = $1
                   AND LOWER(origem) = LOWER($2)
                   AND LOWER(destino) = LOWER($3)
                   AND COALESCE(data_viagem, DATE '1900-01-01')
                       = COALESCE($4::date, DATE '1900-01-01')
                   AND COALESCE(horario, TIME '00:00:00')
                       = COALESCE($5::time, TIME '00:00:00')
                 LIMIT 1`,
                [
                    req.usuarioId,
                    origem.trim(),
                    destino.trim(),
                    data_viagem || null,
                    horario || null
                ]
            );

            return res.status(200).json({
                mensagem: "Essa viagem já está nos seus favoritos.",
                favorito: existente.rows[0] || null
            });
        }

        return res.status(201).json({
            mensagem: "Viagem adicionada aos favoritos!",
            favorito: resultado.rows[0]
        });
    } catch (erro) {
        console.error("Erro ao adicionar favorito:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível adicionar a viagem aos favoritos."
        });
    }
}

async function removerFavorito(req, res) {
    const id = req.params.id;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
        return res.status(400).json({
            erro: "ID de favorito inválido."
        });
    }

    try {
        const resultado = await db.query(
            `DELETE FROM favoritos
             WHERE id = $1 AND usuario_id = $2
             RETURNING id`,
            [id, req.usuarioId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Favorito não encontrado na sua conta."
            });
        }

        return res.json({
            mensagem: "Viagem removida dos favoritos."
        });
    } catch (erro) {
        console.error("Erro ao remover favorito:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível remover o favorito."
        });
    }
}

module.exports = {
    listarFavoritos,
    adicionarFavorito,
    removerFavorito
};
