const database = require("../database/database");

function listarCidades() {
    return database.getCidades();
}

function buscarCidadePorId(id) {
    const cidades = database.getCidades();

    return cidades.find(
        cidade => cidade.id === Number(id)
    ) || null;
}

function listarBairros() {
    return database.getBairros();
}

function buscarBairroPorId(id) {
    const bairros = database.getBairros();

    return bairros.find(
        bairro => bairro.id === Number(id)
    ) || null;
}

function buscarBairrosPorCidade(cidadeId) {
    const bairros = database.getBairros();

    return bairros.filter(
        bairro => bairro.cidadeId === Number(cidadeId)
    );
}

function listarLocalidades() {
    const cidades = database.getCidades();
    const bairros = database.getBairros();

    return cidades.map(cidade => ({
        ...cidade,

        bairros: bairros.filter(
            bairro => bairro.cidadeId === cidade.id
        )
    }));
}

module.exports = {
    listarCidades,
    buscarCidadePorId,
    listarBairros,
    buscarBairroPorId,
    buscarBairrosPorCidade,
    listarLocalidades
};