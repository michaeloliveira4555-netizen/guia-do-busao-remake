const database = require("../database/db");

async function horario(rotaId){
    const horarios = await database.query('SELECT h.id, h.hora_partida, h.hora_chegada, h.preco, v.nome AS viacao FROM horarios h JOIN viacoes v ON h.viacao_id = v.id WHERE h.rota_id = $1;', [rotaId])

    return horarios.rows;
} 

module.exports = {
    horario
}