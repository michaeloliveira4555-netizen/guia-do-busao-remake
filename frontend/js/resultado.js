/* =========================================================
   GUIA DO BUSÃO
   ROTA / VIAGEM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarRota();
});


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CUSTO_VIAGEM_PEDAGIOS = 129.90;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarRota() {

    const viagem =
        carregarDados(
            "guiaBusaoRotaSelecionada"
        );

    if (!viagem) {
        mostrarErro(
            "Nenhuma viagem foi selecionada."
        );
        return;
    }


    console.log(
        "Viagem selecionada:",
        viagem
    );


    preencherDadosViagem(
        viagem
    );


    inicializarBotaoVoltar();

}


/* =========================================================
   PREENCHER VIAGEM
   ========================================================= */

function preencherDadosViagem(
    viagem
) {

    /*
     * Linha
     */

    preencherTodos(
        [
            "[data-linha]",
            "[data-numero-linha]",
            "[data-viagem-linha]"
        ],
        viagem.linha
            ? `Linha ${viagem.linha}`
            : "Linha"
    );


    /*
     * Nome da linha
     */

    preencherTodos(
        [
            "[data-nome-linha]",
            "[data-viagem-nome]"
        ],
        viagem.nomeLinha ||
        "Ônibus"
    );


    /*
     * Origem
     */

    preencherTodos(
        [
            "[data-origem]",
            "[data-viagem-origem]"
        ],
        viagem.origem ||
        "-"
    );


    /*
     * Destino
     */

    preencherTodos(
        [
            "[data-destino]",
            "[data-viagem-destino]"
        ],
        viagem.destino ||
        "-"
    );


    /*
     * Horário de saída
     */

    preencherTodos(
        [
            "[data-saida]",
            "[data-horario-saida]",
            "[data-viagem-saida]"
        ],
        viagem.saida ||
        "--:--"
    );


    /*
     * Horário de chegada
     */

    preencherTodos(
        [
            "[data-chegada]",
            "[data-horario-chegada]",
            "[data-viagem-chegada]"
        ],
        viagem.chegada ||
        "--:--"
    );


    /*
     * Duração
     */

    preencherTodos(
        [
            "[data-duracao]",
            "[data-viagem-duracao]"
        ],
        viagem.duracao ||
        "--"
    );


    /*
     * Dia da viagem
     */

    preencherTodos(
        [
            "[data-dia]",
            "[data-dia-viagem]"
        ],
        viagem.dia ||
        "-"
    );


    /*
     * Data
     */

    preencherTodos(
        [
            "[data-data]",
            "[data-data-viagem]"
        ],
        formatarData(
            viagem.data
        )
    );


    /*
     * Tipo
     */

    preencherTodos(
        [
            "[data-tipo]",
            "[data-tipo-transporte]"
        ],
        viagem.tipo ||
        "Ônibus"
    );


    /*
     * Preço
     */

    const preco =
        viagem.preco !== undefined
            ? viagem.preco
            : CUSTO_VIAGEM_PEDAGIOS;


    preencherTodos(
        [
            "[data-preco]",
            "[data-valor]",
            "[data-custo-viagem]"
        ],
        formatarMoeda(
            preco
        )
    );


    /*
     * Texto explicativo do preço.
     */

    preencherTodos(
        [
            "[data-preco-descricao]",
            "[data-custo-descricao]"
        ],
        "Viagem + pedágios"
    );


    /*
     * Guarda novamente os dados
     * para outras partes da página.
     */

    window.viagemSelecionada =
        viagem;
}


/* =========================================================
   MAPA / LOCALIZAÇÃO
   ========================================================= */

function prepararMapa(
    viagem
) {

    /*
     * Se futuramente o mapaService.js
     * estiver conectado, ele poderá
     * usar esses dados.
     */

    const mapa =
        document.querySelector(
            "[data-mapa]"
        );

    if (!mapa) {
        return;
    }


    mapa.dataset.origem =
        viagem.origem || "";


    mapa.dataset.destino =
        viagem.destino || "";


    mapa.dataset.linha =
        viagem.linha || "";
}


/* =========================================================
   BOTÃO VOLTAR
   ========================================================= */

function inicializarBotaoVoltar() {

    const botoes =
        document.querySelectorAll(
            "[data-voltar]"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    window.history.back();

                }
            );

        }
    );
}


/* =========================================================
   CARREGAR DADOS
   ========================================================= */

function carregarDados(
    chave
) {

    try {

        const dados =
            localStorage.getItem(
                chave
            );


        if (!dados) {
            return null;
        }


        return JSON.parse(
            dados
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

        return null;
    }
}


/* =========================================================
   FORMATAR MOEDA
   ========================================================= */

function formatarMoeda(
    valor
) {

    const numero =
        Number(valor);


    if (
        Number.isNaN(
            numero
        )
    ) {

        return "R$ 129,90";

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


/* =========================================================
   FORMATAR DATA
   ========================================================= */

function formatarData(
    data
) {

    if (!data) {
        return "-";
    }


    const dataObj =
        new Date(
            `${data}T00:00:00`
        );


    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {

        return data;

    }


    return dataObj.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =========================================================
   PREENCHER ELEMENTOS
   ========================================================= */

function preencherTodos(
    seletores,
    valor
) {

    seletores.forEach(
        seletor => {

            document
                .querySelectorAll(
                    seletor
                )
                .forEach(
                    elemento => {

                        elemento.textContent =
                            valor;

                    }
                );

        }
    );
}


/* =========================================================
   MOSTRAR ERRO
   ========================================================= */

function mostrarErro(
    mensagem
) {

    console.error(
        mensagem
    );


    const container =
        document.querySelector(
            "[data-rota-container]"
        ) ||
        document.querySelector(
            "main"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="sem-viagem">

            <div class="sem-viagem-icon">
                🚌
            </div>

            <h2>
                Viagem não encontrada
            </h2>

            <p>
                ${escaparHTML(
                    mensagem
                )}
            </p>

            <a
                href="resultado.html"
                class="btn-voltar"
            >
                Voltar para resultados
            </a>

        </div>

    `;
}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escaparHTML(
    texto
) {

    return String(
        texto || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.RotaGuiaBusao = {

    inicializarRota,

    carregarDados,

    formatarMoeda,

    formatarData

};