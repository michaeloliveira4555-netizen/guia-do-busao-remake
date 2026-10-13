const database = require("../database/db");

async function listarRotas() {
    const resposta = await database.query(`
    SELECT 
        r.id, 
        r.origem_id, 
        c_origem.nome AS origem_nome, 
        c_origem.uf AS origem_uf, 
        r.destino_id, 
        c_destino.nome AS destino_nome, 
        c_destino.uf AS destino_uf 
    FROM rotas r 
    JOIN cidades c_origem ON r.origem_id = c_origem.id 
    JOIN cidades c_destino ON r.destino_id = c_destino.id;
`)

    return resposta.rows.map(r => ({
        id: r.id,
        origem: {
            cidade: {
                id: r.origem_id,
                nome: r.origem_nome,
                estado: r.origem_uf
            }
        },
        destino: {
            cidade: {
                id: r.destino_id,
                nome: r.destino_nome,
                estado: r.destino_uf
            }
        }
    }));
}

async function buscarRotaPorId(id) {
    const linhas = await database.query(`
        SELECT
            r.id,
            c_origem.nome AS origem,
            c_origem.uf AS uf_origem,
            c_destino.nome AS destino,
            c_destino.uf AS uf_destino
        FROM rotas r
        JOIN cidades c_origem ON r.origem_id = c_origem.id
        JOIN cidades c_destino ON r.destino_id = c_destino.id
        WHERE r.id = $1
    `,
        [id]
    );

    const linha = linhas.rows[0]

    if (!linha) {
        return null;
    }

    return linha;
}

async function buscarRotasPorOrigemDestino(origemId, destinoId) {
    const linhas = await database.query(`
        SELECT
            r.id,
            c_origem.nome AS origem,
            c_origem.uf AS uf_origem,
            c_destino.nome AS destino,
            c_destino.uf AS uf_destino
        FROM rotas r
        JOIN cidades c_origem ON r.origem_id = c_origem.id
        JOIN cidades c_destino ON r.destino_id = c_destino.id
        WHERE r.origem_id = $1 AND r.destino_id = $2;
    `,
        [origemId, destinoId]
    );

    return linhas.rows;
}

module.exports = {
    listarRotas,
    buscarRotaPorId,
    buscarRotasPorOrigemDestino
};