/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT DOS POSTOS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarPostos();
});


/* =========================================================
   DADOS DE EXEMPLO
   ========================================================= */

const postosExemplo = [
    {
        id: 1,
        nome: "Posto Ipiranga",
        cidade: "Porto Alegre",
        estado: "RS",
        endereco: "Av. Assis Brasil, 1200",
        distancia: 2.4,
        combustivel: ["Gasolina", "Etanol", "Diesel"],
        aberto: true
    },

    {
        id: 2,
        nome: "Posto Shell",
        cidade: "Canoas",
        estado: "RS",
        endereco: "Av. Getúlio Vargas, 850",
        distancia: 5.8,
        combustivel: ["Gasolina", "Etanol", "Diesel"],
        aberto: true
    },

    {
        id: 3,
        nome: "Posto BR",
        cidade: "Gravataí",
        estado: "RS",
        endereco: "Rodovia BR-290, Km 80",
        distancia: 12.3,
        combustivel: ["Gasolina", "Diesel"],
        aberto: true
    }
];


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarPostos() {

    const container =
        document.querySelector("[data-postos-lista]");

    if (!container) {
        return;
    }

    exibirPostos(postosExemplo);

    inicializarBuscaPostos();

    inicializarFiltroCombustivel();

}


/* =========================================================
   EXIBIR POSTOS
   ========================================================= */

function exibirPostos(postos) {

    const container =
        document.querySelector("[data-postos-lista]");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (postos.length === 0) {

        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    ⛽
                </div>

                <h2>Nenhum posto encontrado</h2>

                <p>
                    Não encontramos postos para essa pesquisa.
                </p>
            </div>
        `;

        return;
    }


    postos.forEach((posto) => {

        const card =
            criarCardPosto(posto);

        container.appendChild(card);

    });

}


/* =========================================================
   CRIAR CARD
   ========================================================= */

function criarCardPosto(posto) {

    const card =
        document.createElement("article");

    card.className = "posto-card";

    const combustiveis =
        posto.combustivel
            .map(
                (item) =>
                    `<span>${item}</span>`
            )
            .join("");


    card.innerHTML = `
        <div class="posto-icon">
            ⛽
        </div>

        <div class="posto-info">

            <div class="posto-title">

                <h3>
                    ${posto.nome}
                </h3>

                ${
                    posto.aberto
                        ? `<span class="posto-aberto">
                            Aberto
                           </span>`
                        : `<span class="posto-fechado">
                            Fechado
                           </span>`
                }

            </div>

            <p>
                ${posto.endereco}
            </p>

            <small>
                ${posto.cidade} - ${posto.estado}
            </small>

            <div class="posto-combustiveis">
                ${combustiveis}
            </div>

        </div>

        <div class="posto-distance">

            <strong>
                ${formatarDistancia(
                    posto.distancia
                )}
            </strong>

            <button
                type="button"
                class="posto-route-button"
                data-posto-rota="${posto.id}"
            >
                Ver rota
            </button>

        </div>
    `;


    const botao =
        card.querySelector(
            "[data-posto-rota]"
        );


    botao.addEventListener(
        "click",
        () => {

            abrirRotaPosto(posto);

        }
    );


    return card;
}


/* =========================================================
   BUSCA
   ========================================================= */

function inicializarBuscaPostos() {

    const campo =
        document.querySelector(
            "[data-busca-posto]"
        );

    if (!campo) {
        return;
    }

    campo.addEventListener(
        "input",
        () => {

            const termo =
                campo.value
                    .trim()
                    .toLowerCase();

            pesquisarPostos(termo);

        }
    );

}


function pesquisarPostos(termo) {

    if (!termo) {

        exibirPostos(
            postosExemplo
        );

        return;
    }


    const resultados =
        postosExemplo.filter(
            (posto) => {

                const texto =
                    `
                    ${posto.nome}
                    ${posto.cidade}
                    ${posto.estado}
                    ${posto.endereco}
                    ${posto.combustivel.join(" ")}
                    `.toLowerCase();

                return texto.includes(
                    termo
                );

            }
        );


    exibirPostos(
        resultados
    );

}


/* =========================================================
   FILTRO DE COMBUSTÍVEL
   ========================================================= */

function inicializarFiltroCombustivel() {

    const filtro =
        document.querySelector(
            "[data-filtro-combustivel]"
        );

    if (!filtro) {
        return;
    }

    filtro.addEventListener(
        "change",
        () => {

            const valor =
                filtro.value;

            if (!valor) {

                exibirPostos(
                    postosExemplo
                );

                return;
            }


            const resultados =
                postosExemplo.filter(
                    (posto) =>
                        posto.combustivel.includes(
                            valor
                        )
                );


            exibirPostos(
                resultados
            );

        }
    );

}


/* =========================================================
   DISTÂNCIA
   ========================================================= */

function formatarDistancia(
    distancia
) {

    if (distancia < 1) {

        return `${Math.round(
            distancia * 1000
        )} m`;

    }

    return `${distancia.toFixed(1)} km`;

}


/* =========================================================
   ROTA ATÉ O POSTO
   ========================================================= */

function abrirRotaPosto(posto) {

    localStorage.setItem(
        "guiaBusaoPostoSelecionado",
        JSON.stringify(posto)
    );


    /*
     * Por enquanto mostramos uma mensagem.
     *
     * Depois podemos mandar o usuário
     * diretamente para o mapa com a rota.
     */

    if (
        window.GuiaBusao &&
        typeof window.GuiaBusao.mostrarMensagem ===
        "function"
    ) {

        window.GuiaBusao.mostrarMensagem(
            `Calculando rota até ${posto.nome}...`,
            "info"
        );

    }


    console.log(
        "Posto selecionado:",
        posto
    );

}


/* =========================================================
   POSTO SELECIONADO
   ========================================================= */

function obterPostoSelecionado() {

    const dados =
        localStorage.getItem(
            "guiaBusaoPostoSelecionado"
        );

    if (!dados) {
        return null;
    }

    try {

        return JSON.parse(
            dados
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar posto:",
            erro
        );

        return null;
    }

}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.PostosGuiaBusao = {

    pesquisarPostos,

    obterPostoSelecionado,

    formatarDistancia

};