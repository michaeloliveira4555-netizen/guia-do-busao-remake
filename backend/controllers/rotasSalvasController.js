const db = require("../database/db");

const preferenciasValidas = [
    "fastest",
    "cheapest",
    "fewer-connections"
];

function validarTexto(valor, limite = 200) {
    return typeof valor === "string" &&
        valor.trim().length > 0 &&
        valor.trim().length <= limite;
}

function validarData(data) {
    return typeof data === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(data) &&
        !Number.isNaN(Date.parse(`${data}T00:00:00Z`)) &&
        new Date(`${data}T00:00:00Z`).toISOString().slice(0, 10) === data;
}

function validarHorario(horario) {
    return horario == null ||
        horario === "" ||
        (typeof horario === "string" &&
         /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(horario));
}

function validarPreferencia(preferencia) {
    return preferenciasValidas.includes(preferencia);
}

async function listarRotasSalvas(req, res) {
    try {
        const resultado = await db.query(
            `SELECT id, origem, destino, data_viagem, horario,
                    preferencia, criada_em, atualizada_em
             FROM rotas_salvas
             WHERE usuario_id = $1
             ORDER BY criada_em DESC`,
            [req.usuarioId]
        );

        return res.json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao listar rotas salvas:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível carregar suas rotas salvas."
        });
    }
}

async function salvarRota(req, res) {
    const { origem, destino, data_viagem, horario, preferencia } = req.body;

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

    if (!validarData(data_viagem)) {
        return res.status(400).json({
            erro: "Informe uma data válida para a viagem."
        });
    }

    if (!validarHorario(horario)) {
        return res.status(400).json({
            erro: "Informe um horário válido."
        });
    }

    const pref = preferencia || "fastest";

    if (!validarPreferencia(pref)) {
        return res.status(400).json({
            erro: "A preferência de viagem é inválida."
        });
    }

    try {
        const resultado = await db.query(
            `INSERT INTO rotas_salvas
                (usuario_id, origem, destino, data_viagem, horario, preferencia)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, origem, destino, data_viagem, horario,
                       preferencia, criada_em, atualizada_em`,
            [
                req.usuarioId,
                origem.trim(),
                destino.trim(),
                data_viagem,
                horario || null,
                pref
            ]
        );

        return res.status(201).json({
            mensagem: "Rota salva com sucesso!",
            rota: resultado.rows[0]
        });
    } catch (erro) {
        console.error("Erro ao salvar rota:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível salvar a rota."
        });
    }
}

async function editarRota(req, res) {
    const id = req.params.id;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
        return res.status(400).json({ erro: "ID de rota inválido." });
    }

    let rotaAtual;

    try {
        const consulta = await db.query(
            "SELECT origem, destino FROM rotas_salvas WHERE id = $1 AND usuario_id = $2",
            [id, req.usuarioId]
        );

        if (consulta.rows.length === 0) {
            return res.status(404).json({
                erro: "Rota não encontrada na sua conta."
            });
        }

        rotaAtual = consulta.rows[0];
    } catch (erro) {
        console.error("Erro ao consultar rota:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível consultar a rota."
        });
    }

    const origemFinal = req.body.origem ?? rotaAtual.origem;
    const destinoFinal = req.body.destino ?? rotaAtual.destino;

    if (
        typeof origemFinal !== "string" ||
        typeof destinoFinal !== "string" ||
        origemFinal.trim().toLowerCase() ===
            destinoFinal.trim().toLowerCase()
    ) {
        return res.status(400).json({
            erro: "A origem e o destino precisam ser diferentes."
        });
    }

    const campos = {
        origem: req.body.origem,
        destino: req.body.destino,
        data_viagem: req.body.data_viagem,
        horario: req.body.horario,
        preferencia: req.body.preferencia
    };

    const atualizacoes = [];
    const valores = [];
    const enviar = (coluna, valor) => {
        valores.push(valor);
        atualizacoes.push(`${coluna} = $${valores.length}`);
    };

    if (campos.origem !== undefined) {
        if (!validarTexto(campos.origem)) {
            return res.status(400).json({ erro: "Origem inválida." });
        }
        enviar("origem", campos.origem.trim());
    }

    if (campos.destino !== undefined) {
        if (!validarTexto(campos.destino)) {
            return res.status(400).json({ erro: "Destino inválido." });
        }
        enviar("destino", campos.destino.trim());
    }

    if (campos.data_viagem !== undefined) {
        if (!validarData(campos.data_viagem)) {
            return res.status(400).json({ erro: "Data inválida." });
        }
        enviar("data_viagem", campos.data_viagem);
    }

    if (campos.horario !== undefined) {
        if (!validarHorario(campos.horario)) {
            return res.status(400).json({ erro: "Horário inválido." });
        }
        enviar("horario", campos.horario || null);
    }

    if (campos.preferencia !== undefined) {
        if (!validarPreferencia(campos.preferencia)) {
            return res.status(400).json({ erro: "Preferência inválida." });
        }
        enviar("preferencia", campos.preferencia);
    }

    if (atualizacoes.length === 0) {
        return res.status(400).json({
            erro: "Informe ao menos um campo para atualizar."
        });
    }

    atualizacoes.push("atualizada_em = NOW()");
    valores.push(id);
    valores.push(req.usuarioId);

    try {
        const resultado = await db.query(
            `UPDATE rotas_salvas
             SET ${atualizacoes.join(", ")}
             WHERE id = $${valores.length - 1}
               AND usuario_id = $${valores.length}
             RETURNING id, origem, destino, data_viagem, horario,
                       preferencia, criada_em, atualizada_em`,
            valores
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Rota não encontrada na sua conta."
            });
        }

        const rota = resultado.rows[0];

        if (rota.origem.trim().toLowerCase() ===
            rota.destino.trim().toLowerCase()) {
            return res.status(400).json({
                erro: "A origem e o destino precisam ser diferentes."
            });
        }

        return res.json({
            mensagem: "Rota atualizada com sucesso!",
            rota
        });
    } catch (erro) {
        console.error("Erro ao editar rota:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível atualizar a rota."
        });
    }
}

async function excluirRota(req, res) {
    const id = req.params.id;

    if (!/^\d+$/.test(id) || Number(id) <= 0) {
        return res.status(400).json({ erro: "ID de rota inválido." });
    }

    try {
        const resultado = await db.query(
            `DELETE FROM rotas_salvas
             WHERE id = $1 AND usuario_id = $2
             RETURNING id`,
            [id, req.usuarioId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Rota não encontrada na sua conta."
            });
        }

        return res.json({ mensagem: "Rota excluída com sucesso!" });
    } catch (erro) {
        console.error("Erro ao excluir rota:", erro.message);
        return res.status(500).json({
            erro: "Não foi possível excluir a rota."
        });
    }
}

module.exports = {
    listarRotasSalvas,
    salvarRota,
    editarRota,
    excluirRota
};
