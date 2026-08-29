const database = require("../database/database");

function buscarLocalizacao(cidadeId, bairroId) {
    const cidades = database.getCidades();
    const bairros = database.getBairros();

    const cidade = cidades.find(
        item => item.id === Number(cidadeId)
    );

    if (!cidade) {
        return null;
    }

    const bairro = bairros.find(
        item =>
            item.id === Number(bairroId) &&
            item.cidadeId === cidade.id
    );

    if (!bairro) {
        return null;
    }

    return {
        cidade: {
            id: cidade.id,
            nome: cidade.nome,
            estado: cidade.estado
        },

        bairro: {
            id: bairro.id,
            nome: bairro.nome,
            cidadeId: bairro.cidadeId
        }
    };
}

function listarLocalizacoes() {
    const cidades = database.getCidades();
    const bairros = database.getBairros();

    return bairros.map(bairro => {
        const cidade = cidades.find(
            item => item.id === bairro.cidadeId
        );

        return {
            cidade: cidade || null,
            bairro: bairro
        };
    });
}

function buscarBairrosDaLocalizacao(cidadeId) {
    const bairros = database.getBairros();

    return bairros.filter(
        bairro => bairro.cidadeId === Number(cidadeId)
    );
}

module.exports = {
    buscarLocalizacao,
    listarLocalizacoes,
    buscarBairrosDaLocalizacao
};