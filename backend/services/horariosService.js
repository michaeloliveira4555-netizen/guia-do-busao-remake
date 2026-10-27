
const database = require("../database/db");

async function horario(rotaId) {
    const horarios = await database.query(
        `SELECT
            h.id,
            h.rota_id,
            h.hora_partida,
            h.hora_chegada,
            h.preco,
            v.nome AS viacao
         FROM horarios h
         JOIN viacoes v ON h.viacao_id = v.id
         WHERE h.rota_id = $1
         ORDER BY h.hora_partida ASC`,
        [rotaId]
    );

    return horarios.rows;
}

async function listarTodos() {
    const horarios = await database.query(
        `SELECT
            h.id,
            h.rota_id,
            h.hora_partida,
            h.hora_chegada,
            h.preco,
            v.nome AS viacao
         FROM horarios h
         JOIN viacoes v ON h.viacao_id = v.id
         ORDER BY h.hora_partida ASC`
    );

    return horarios.rows;
}

module.exports = {
    horario,
    listarTodos
};
