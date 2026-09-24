/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT DO MAPA
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    carregarRotaNoMapa();
    inicializarControlesMapa();
    inicializarBotaoLocalizacao();
});


/* =========================================================
   CARREGAR ROTA
   ========================================================= */

function carregarRotaNoMapa() {

    const rota = obterRotaMapa();

    if (!rota) {
        return;
    }

    preencherMapaElemento(
        "[data-mapa-origem]",
        rota.origem
    );

    preencherMapaElemento(
        "[data-mapa-destino]",
        rota.destino
    );

    preencherMapaElemento(
        "[data-mapa-data]",
        rota.data
    );

    preencherMapaElemento(
        "[data-mapa-horario]",
        rota.horarioSaida
    );
}


/* =========================================================
   OBTER ROTA
   ========================================================= */

function obterRotaMapa() {

    const dados =
        localStorage.getItem(
            "guiaBusaoRotaSelecionada"
        );

    if (!dados) {
        return criarRotaMapaExemplo();
    }

    try {

        return JSON.parse(dados);

    } catch (erro) {

        console.error(
            "Erro ao carregar dados do mapa:",
            erro
        );

        return criarRotaMapaExemplo();
    }
}


/* =========================================================
   ROTA DE EXEMPLO
   ========================================================= */

function criarRotaMapaExemplo() {

    return {

        origem:
            "Porto Alegre, RS",

        destino:
            "Balneário Camboriú, SC",

        data:
            "15/08/2026",

        horarioSaida:
            "07:30"

    };
}


/* =========================================================
   PREENCHER ELEMENTOS
   ========================================================= */

function preencherMapaElemento(
    seletor,
    valor
) {

    const elementos =
        document.querySelectorAll(seletor);

    elementos.forEach((elemento) => {

        elemento.textContent =
            valor || "-";

    });
}


/* =========================================================
   CONTROLES DO MAPA
   ========================================================= */

function inicializarControlesMapa() {

    const botoes =
        document.querySelectorAll(
            "[data-mapa-controle]"
        );

    botoes.forEach((botao) => {

        botao.addEventListener(
            "click",
            () => {

                const acao =
                    botao.dataset.mapaControle;

                executarControleMapa(
                    acao
                );

            }
        );

    });
}


/* =========================================================
   AÇÕES DO MAPA
   ========================================================= */

function executarControleMapa(acao) {

    switch (acao) {

        case "zoom-in":

            mostrarMensagemMapa(
                "Zoom aproximado."
            );

            break;


        case "zoom-out":

            mostrarMensagemMapa(
                "Zoom afastado."
            );

            break;


        case "rota":

            mostrarMensagemMapa(
                "A rota da viagem está sendo exibida."
            );

            break;


        case "paradas":

            mostrarMensagemMapa(
                "Exibindo paradas da viagem."
            );

            break;


        default:

            console.log(
                "Controle desconhecido:",
                acao
            );

    }
}


/* =========================================================
   LOCALIZAÇÃO DO USUÁRIO
   ========================================================= */

function inicializarBotaoLocalizacao() {

    const botao =
        document.querySelector(
            "[data-minha-localizacao]"
        );

    if (!botao) {
        return;
    }

    botao.addEventListener(
        "click",
        obterLocalizacao
    );
}


function obterLocalizacao() {

    if (!navigator.geolocation) {

        mostrarMensagemMapa(
            "Seu navegador não suporta localização."
        );

        return;
    }

    mostrarMensagemMapa(
        "Obtendo sua localização..."
    );

    navigator.geolocation.getCurrentPosition(

        (posicao) => {

            const latitude =
                posicao.coords.latitude;

            const longitude =
                posicao.coords.longitude;

            console.log(
                "Localização:",
                latitude,
                longitude
            );

            mostrarMensagemMapa(
                "Sua localização foi encontrada."
            );

        },

        (erro) => {

            console.error(
                "Erro de localização:",
                erro
            );

            mostrarMensagemMapa(
                "Não foi possível obter sua localização."
            );

        }

    );
}


/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagemMapa(
    mensagem
) {

    if (
        window.GuiaBusao &&
        typeof window.GuiaBusao.mostrarMensagem ===
        "function"
    ) {

        window.GuiaBusao.mostrarMensagem(
            mensagem,
            "info"
        );

        return;
    }

    console.log(mensagem);
}


/* =========================================================
   FUTURO MAPA REAL
   ========================================================= */

/*
    Aqui futuramente vamos integrar:

    - Mapa do Brasil
    - OpenStreetMap
    - Leaflet
    - Origem
    - Destino
    - Paradas
    - Rota do ônibus
    - Localização do usuário
    - Distância
    - Tempo estimado

    Exemplo futuro:

    inicializarMapaReal();

*/


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.MapaGuiaBusao = {

    obterRotaMapa,

    carregarRotaNoMapa

};