/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT DOS PEDÁGIOS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarPedagios();
});


/* =========================================================
   DADOS DE EXEMPLO
   ========================================================= */

const pedagiosExemplo = [
    {
        id: 1,
        nome: "Pedágio de Santo Antônio",
        rodovia: "BR-290",
        cidade: "Santo Antônio da Patrulha",
        estado: "RS",
        valor: 8.50,
        distancia: 78
    },

    {
        id: 2,
        nome: "Pedágio de Osório",
        rodovia: "BR-101",
        cidade: "Osório",
        estado: "RS",
        valor: 9.20,
        distancia: 120
    },

    {
        id: 3,
        nome: "Pedágio de Araranguá",
        rodovia: "BR-101",
        cidade: "Araranguá",
        estado: "SC",
        valor: 7.90,
        distancia: 250
    }
];


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarPedagios() {

    const lista =
        document.querySelector(
            "[data-pedagios-lista]"
        );

    if (!lista) {
        return;
    }

    exibirPedagios(
        pedagiosExemplo
    );

    calcularTotalPedagios(
        pedagiosExemplo
    );
}


/* =========================================================
   EXIBIR PEDÁGIOS
   ========================================================= */

function exibirPedagios(
    pedagios
) {

    const lista =
        document.querySelector(
            "[data-pedagios-lista]"
        );

    if (!lista) {
        return;
    }

    lista.innerHTML = "";


    if (pedagios.length === 0) {

        lista.innerHTML = `
            <div class="no-results">

                <div class="no-results-icon">
                    🛣️
                </div>

                <h2>
                    Nenhum pedágio encontrado
                </h2>

                <p>
                    Não encontramos pedágios
                    nessa rota.
                </p>

            </div>
        `;

        return;
    }


    pedagios.forEach(
        (pedagio) => {

            const card =
                criarCardPedagio(
                    pedagio
                );

            lista.appendChild(
                card
            );

        }
    );
}


/* =========================================================
   CARD DO PEDÁGIO
   ========================================================= */

function criarCardPedagio(
    pedagio
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "pedagio-card";


    card.innerHTML = `

        <div class="pedagio-icon">
            🛣️
        </div>


        <div class="pedagio-info">

            <h3>
                ${pedagio.nome}
            </h3>

            <p>
                ${pedagio.rodovia}
                •
                ${pedagio.cidade} -
                ${pedagio.estado}
            </p>

            <small>
                Aproximadamente
                ${pedagio.distancia} km
                do início da rota
            </small>

        </div>


        <div class="pedagio-price">

            <small>
                Valor
            </small>

            <strong>
                ${formatarMoeda(
                    pedagio.valor
                )}
            </strong>

        </div>

    `;

    return card;
}


/* =========================================================
   TOTAL DOS PEDÁGIOS
   ========================================================= */

function calcularTotalPedagios(
    pedagios
) {

    const total =
        pedagios.reduce(
            (
                acumulado,
                pedagio
            ) => {

                return acumulado +
                    pedagio.valor;

            },
            0
        );


    const elemento =
        document.querySelector(
            "[data-total-pedagios]"
        );

    if (!elemento) {
        return total;
    }


    elemento.textContent =
        formatarMoeda(total);


    return total;
}


/* =========================================================
   FORMATAR MOEDA
   ========================================================= */

function formatarMoeda(
    valor
) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


/* =========================================================
   FILTRAR POR RODOVIA
   ========================================================= */

function filtrarPorRodovia(
    rodovia
) {

    if (!rodovia) {

        exibirPedagios(
            pedagiosExemplo
        );

        calcularTotalPedagios(
            pedagiosExemplo
        );

        return;
    }


    const resultados =
        pedagiosExemplo.filter(
            (pedagio) =>
                pedagio.rodovia
                    .toLowerCase()
                    .includes(
                        rodovia.toLowerCase()
                    )
        );


    exibirPedagios(
        resultados
    );

    calcularTotalPedagios(
        resultados
    );
}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.PedagiosGuiaBusao = {

    exibirPedagios,

    calcularTotalPedagios,

    filtrarPorRodovia,

    formatarMoeda

};