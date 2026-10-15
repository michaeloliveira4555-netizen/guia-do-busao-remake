const API_URL = "http://localhost:3000/api";


async function requisicaoAPI(endpoint) {

    const resposta = await fetch(
        `${API_URL}${endpoint}`
    );

    if (!resposta.ok) {

        let erro = "Erro na API";

        try {
            const dados = await resposta.json();

            if (dados.erro) {
                erro = dados.erro;
            }

        } catch (e) {
            // ignora erro de leitura
        }

        throw new Error(erro);
    }

    return await resposta.json();
}


/* =========================================================
   ROTAS
   ========================================================= */

async function listarRotas() {
    return requisicaoAPI("/rotas");
}


async function buscarRota(id) {
    return requisicaoAPI(`/rotas/${id}`);
}


async function buscarRotasPorOrigemDestino(
    origem,
    destino
) {

    return requisicaoAPI(
        `/rotas/buscar?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}`
    );
}


/* =========================================================
   HORÁRIOS
   ========================================================= */

async function listarHorarios() {
    return requisicaoAPI("/horarios");
}


async function buscarHorario(id) {
    return requisicaoAPI(`/horarios/${id}`);
}


async function buscarHorariosDaLinha(linhaId) {

    return requisicaoAPI(
        `/horarios/linha/${linhaId}`
    );
}


/* =========================================================
   USUÁRIOS
   ========================================================= */

async function listarUsuarios() {
    return requisicaoAPI("/usuarios");
}