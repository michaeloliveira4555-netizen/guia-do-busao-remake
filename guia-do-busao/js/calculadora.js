/* =========================================================
   GUIA DO BUSÃO
   CALCULADORA
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarCalculadora();
});


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarCalculadora() {

    const formulario =
        document.querySelector("[data-calculadora]");

    if (!formulario) {
        return;
    }

    formulario.addEventListener(
        "submit",
        (evento) => {

            evento.preventDefault();

            calcularViagem();

        }
    );

}


/* =========================================================
   CALCULAR VIAGEM
   ========================================================= */

function calcularViagem() {

    const distancia =
        obterNumero("[data-distancia]");

    const velocidade =
        obterNumero("[data-velocidade]");

    const preco =
        obterNumero("[data-preco]");

    if (!distancia || !velocidade) {

        mostrarMensagemCalculadora(
            "Informe a distância e a velocidade."
        );

        return;
    }

    const duracaoHoras =
        distancia / velocidade;

    const horas =
        Math.floor(duracaoHoras);

    const minutos =
        Math.round(
            (duracaoHoras - horas) * 60
        );

    const resultado = {
        distancia,
        velocidade,
        preco,
        horas,
        minutos
    };

    mostrarResultado(resultado);

}


/* =========================================================
   PEGAR NÚMERO DO INPUT
   ========================================================= */

function obterNumero(seletor) {

    const elemento =
        document.querySelector(seletor);

    if (!elemento) {
        return 0;
    }

    const valor =
        parseFloat(
            elemento.value.replace(",", ".")
        );

    if (Number.isNaN(valor)) {
        return 0;
    }

    return valor;
}


/* =========================================================
   MOSTRAR RESULTADO
   ========================================================= */

function mostrarResultado(resultado) {

    preencher(
        "[data-resultado-distancia]",
        `${resultado.distancia.toFixed(1)} km`
    );

    preencher(
        "[data-resultado-velocidade]",
        `${resultado.velocidade.toFixed(0)} km/h`
    );

    preencher(
        "[data-resultado-duracao]",
        formatarDuracao(
            resultado.horas,
            resultado.minutos
        )
    );

    if (resultado.preco > 0) {

        preencher(
            "[data-resultado-preco]",
            formatarMoeda(
                resultado.preco
            )
        );

    }

}


/* =========================================================
   FORMATAR DURAÇÃO
   ========================================================= */

function formatarDuracao(
    horas,
    minutos
) {

    if (horas === 0) {
        return `${minutos} min`;
    }

    if (minutos === 0) {
        return `${horas}h`;
    }

    return `${horas}h ${minutos}min`;
}


/* =========================================================
   FORMATAR DINHEIRO
   ========================================================= */

function formatarMoeda(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   PREENCHER ELEMENTO
   ========================================================= */

function preencher(
    seletor,
    valor
) {

    const elementos =
        document.querySelectorAll(seletor);

    elementos.forEach(
        (elemento) => {
            elemento.textContent = valor;
        }
    );

}


/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagemCalculadora(
    mensagem
) {

    if (
        window.GuiaBusao &&
        typeof window.GuiaBusao.mostrarMensagem ===
        "function"
    ) {

        window.GuiaBusao.mostrarMensagem(
            mensagem,
            "warning"
        );

        return;
    }

    alert(mensagem);

}


/* =========================================================
   CÁLCULO DE DISTÂNCIA
   ========================================================= */

/*
    Fórmula de Haversine.

    Serve para calcular a distância aproximada
    entre duas coordenadas geográficas.

    Depois podemos usar isso no mapa real.
*/

function calcularDistancia(
    latitude1,
    longitude1,
    latitude2,
    longitude2
) {

    const raioTerra = 6371;

    const lat1 =
        converterParaRadiano(latitude1);

    const lat2 =
        converterParaRadiano(latitude2);

    const diferencaLatitude =
        converterParaRadiano(
            latitude2 - latitude1
        );

    const diferencaLongitude =
        converterParaRadiano(
            longitude2 - longitude1
        );

    const a =
        Math.sin(
            diferencaLatitude / 2
        ) ** 2
        +
        Math.cos(lat1)
        *
        Math.cos(lat2)
        *
        Math.sin(
            diferencaLongitude / 2
        ) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return raioTerra * c;
}


/* =========================================================
   CONVERTER PARA RADIANOS
   ========================================================= */

function converterParaRadiano(
    graus
) {

    return graus * Math.PI / 180;

}


/* =========================================================
   ESTIMAR CUSTO
   ========================================================= */

function calcularCustoPorDistancia(
    distancia,
    valorPorKm
) {

    if (
        distancia <= 0 ||
        valorPorKm <= 0
    ) {
        return 0;
    }

    return distancia * valorPorKm;

}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.CalculadoraGuiaBusao = {

    calcularDistancia,

    calcularCustoPorDistancia,

    formatarDuracao,

    formatarMoeda

};