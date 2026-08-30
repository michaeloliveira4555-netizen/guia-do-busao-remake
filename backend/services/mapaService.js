// importa a conexão do banco de dados
const db = require("../database/db");

// função async
async function listarCidades() {
    const resultado = await db.query('SELECT * FROM cidades ORDER BY nome ASC')
    return resultado.rows;
}

async function buscarCidadePorId(id) {
    const query = 'SELECT * FROM cidades WHERE id = $1';
    const valores = [id];

    const resultado = await db.query(query, valores);

    if (resultado.rows.length === 0) {
        return null
    }
    return resultado.rows[0];
}

module.exports = {
    listarCidades,
    buscarCidadePorId
};