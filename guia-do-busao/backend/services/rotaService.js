const database = require("../database/database");

function listarRotas() {
    const linhas = database.getLinhas();

    return linhas.map(linha => montarRota(linha));
}

function buscarRotaPorId(id) {
    const linhas = database.getLinhas();

    const linha = linhas.find(
        item => item.id === Number(id)
    );

    if (!linha) {
        return null;
    }

    return montarRota(linha);
}

function buscarRotasPorOrigemDestino(origemId, destinoId) {
    const linhas = database.getLinhas();

    const resultado = linhas.filter(linha => {
        return (
            linha.origem.bairroId === Number(origemId) &&
            linha.destino.bairroId === Number(destinoId)
        );
    });

    return resultado.map(linha => montarRota(linha));
}

function montarRota(linha) {
    const cidades = database.getCidades();
    const bairros = database.getBairros();
    const horarios = database.getHorarios();

    const cidadeOrigem = cidades.find(
        cidade => cidade.id === linha.origem.cidadeId
    );

    const bairroOrigem = bairros.find(
        bairro => bairro.id === linha.origem.bairroId
    );

    const cidadeDestino = cidades.find(
        cidade => cidade.id === linha.destino.cidadeId
    );

    const bairroDestino = bairros.find(
        bairro => bairro.id === linha.destino.bairroId
    );

    const horariosDaLinha = horarios.filter(
        horario => linha.horariosId.includes(horario.id)
    );

    return {
        ...linha,

        origem: {
            cidade: cidadeOrigem || null,
            bairro: bairroOrigem || null
        },

        destino: {
            cidade: cidadeDestino || null,
            bairro: bairroDestino || null
        },

        horarios: horariosDaLinha
    };
}

module.exports = {
    listarRotas,
    buscarRotaPorId,
    buscarRotasPorOrigemDestino
};