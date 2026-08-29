/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT DOS HORÁRIOS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarHorarios();
});


/* =========================================================
   DADOS DE TESTE
   ========================================================= */

const horariosExemplo = [
    {
        id: 1,
        empresa: "Expresso Sul",
        origem: "Porto Alegre",
        destino: "Balneário Camboriú",
        data: "15/08/2026",
        saida: "07:30",
        chegada: "13:45",
        duracao: "6h 15min",
        tipo: "Convencional",
        preco: 129.90
    },

    {
        id: 2,
        empresa: "Viação Brasil",
        origem: "Porto Alegre",
        destino: "Balneário Camboriú",
        data: "15/08/2026",
        saida: "10:15",
        chegada: "16:20",
        duracao: "6h 05min",
        tipo: "Executivo",
        preco: 149.90
    },

    {
        id: 3,
        empresa: "SulBus",
        origem: "Porto Alegre",
        destino: "Balneário Camboriú",
        data: "15/08/2026",
        saida: "14:40",
        chegada: "21:00",
        duracao: "6h 20min",
        tipo: "Convencional",
        preco: 119.90
    }
];


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarHorarios() {

    const lista =
        document.querySelector(
            "[data-horarios-lista]"
        );

    if (!lista) {
        return;
    }


    const pesquisa =
        obterPesquisaHorarios();


    if (!pesquisa) {

        mostrarMensagemSemPesquisa();

        return;
    }


    preencherInformacoesHorario(
        pesquisa
    );


    buscarHorarios(
        pesquisa
    );

}


/* =========================================================
   OBTER PESQUISA
   ========================================================= */

function obterPesquisaHorarios() {

    const dados =
        localStorage.getItem(
            "guiaBusaoPesquisa"
        );


    if (!dados) {
        return null;
    }


    try {

        return JSON.parse(dados);

    } catch (erro) {

        console.error(
            "Erro ao carregar pesquisa:",
            erro
        );

        return null;
    }
}


/* =========================================================
   BUSCAR HORÁRIOS
   ========================================================= */

function buscarHorarios(
    pesquisa
) {

    let resultados =
        horariosExemplo.filter(
            (horario) => {

                const mesmaData =
                    horario.data ===
                    formatarDataBusca(
                        pesquisa.data
                    );


                const mesmaOrigem =
                    normalizarHorario(
                        horario.origem
                    ) ===
                    normalizarHorario(
                        pesquisa.origem
                    );


                const mesmoDestino =
                    normalizarHorario(
                        horario.destino
                    ) ===
                    normalizarHorario(
                        pesquisa.destino
                    );


                return (
                    mesmaData &&
                    mesmaOrigem &&
                    mesmoDestino
                );

            }
        );


    /*
     * Se o usuário escolheu um horário,
     * mostramos somente horários depois
     * daquele horário.
     */

    if (pesquisa.horario) {

        resultados =
            resultados.filter(
                (horario) =>
                    horario.saida >=
                    pesquisa.horario
            );

    }


    exibirHorarios(
        resultados,
        pesquisa
    );

}


/* =========================================================
   EXIBIR HORÁRIOS
   ========================================================= */

function exibirHorarios(
    horarios,
    pesquisa
) {

    const lista =
        document.querySelector(
            "[data-horarios-lista]"
        );


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    if (horarios.length === 0) {

        mostrarNenhumHorario(
            lista,
            pesquisa
        );

        procurarProximasDatas(
            pesquisa
        );

        return;
    }


    horarios.forEach(
        (horario) => {

            const card =
                criarCardHorario(
                    horario
                );


            lista.appendChild(
                card
            );

        }
    );


    atualizarQuantidadeHorarios(
        horarios.length
    );

}


/* =========================================================
   CARD DO HORÁRIO
   ========================================================= */

function criarCardHorario(
    horario
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "horario-card";


    card.innerHTML = `

        <div class="horario-empresa">

            <strong>
                ${horario.empresa}
            </strong>

            <span>
                ${horario.tipo}
            </span>

        </div>


        <div class="horario-rota">

            <div class="horario-ponto">

                <strong>
                    ${horario.saida}
                </strong>

                <small>
                    ${horario.origem}
                </small>

            </div>


            <div class="horario-duracao">

                <span>
                    ${horario.duracao}
                </span>

                <span>
                    →
                </span>

            </div>


            <div class="horario-ponto">

                <strong>
                    ${horario.chegada}
                </strong>

                <small>
                    ${horario.destino}
                </small>

            </div>

        </div>


        <div class="horario-footer">

            <strong>
                ${formatarMoedaHorario(
                    horario.preco
                )}
            </strong>


            <button
                type="button"
                data-selecionar-horario="${horario.id}"
            >
                Selecionar
            </button>

        </div>

    `;


    const botao =
        card.querySelector(
            "[data-selecionar-horario]"
        );


    botao.addEventListener(
        "click",
        () => {

            selecionarHorario(
                horario
            );

        }
    );


    return card;

}


/* =========================================================
   SELECIONAR HORÁRIO
   ========================================================= */

function selecionarHorario(
    horario
) {

    localStorage.setItem(
        "guiaBusaoRotaSelecionada",
        JSON.stringify(
            horario
        )
    );


    window.location.href =
        "rota.html";

}


/* =========================================================
   NENHUM HORÁRIO
   ========================================================= */

function mostrarNenhumHorario(
    lista,
    pesquisa
) {

    lista.innerHTML = `

        <div class="sem-horarios">

            <div class="sem-horarios-icon">
                🚌
            </div>

            <h2>
                Não encontramos ônibus
                para esse dia.
            </h2>

            <p>
                Não encontramos horários de
                <strong>
                    ${pesquisa.origem}
                </strong>
                para
                <strong>
                    ${pesquisa.destino}
                </strong>
                em
                <strong>
                    ${formatarDataHorario(
                        pesquisa.data
                    )}
                </strong>.
            </p>

        </div>

    `;

}


/* =========================================================
   PRÓXIMAS DATAS
   ========================================================= */

function procurarProximasDatas(
    pesquisa
) {

    const container =
        document.querySelector(
            "[data-proximas-datas]"
        );


    if (!container) {
        return;
    }


    /*
     * TEMPORÁRIO.
     *
     * Quando o backend estiver pronto,
     * essas datas virão dos dados reais.
     */

    const proximasDatas = [
        "16/08/2026",
        "17/08/2026",
        "18/08/2026"
    ];


    container.innerHTML = `

        <div class="proximas-datas">

            <h3>
                Veja outras datas
            </h3>

            <p>
                Encontramos possíveis
                datas próximas:
            </p>

            <div class="datas-horarios">

                ${proximasDatas
                    .map(
                        (data) => `

                            <button
                                type="button"
                                data-data-horario="${data}"
                            >
                                ${data}
                            </button>

                        `
                    )
                    .join("")}

            </div>

        </div>

    `;


    container
        .querySelectorAll(
            "[data-data-horario]"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        alterarDataHorario(
                            pesquisa,
                            botao.dataset.dataHorario
                        );

                    }
                );

            }
        );

}


/* =========================================================
   ALTERAR DATA
   ========================================================= */

function alterarDataHorario(
    pesquisa,
    novaData
) {

    const novaPesquisa = {

        ...pesquisa,

        data:
            converterDataISO(
                novaData
            ),

        horario:
            null

    };


    localStorage.setItem(
        "guiaBusaoPesquisa",
        JSON.stringify(
            novaPesquisa
        )
    );


    window.location.reload();

}


/* =========================================================
   INFORMAÇÕES DA PESQUISA
   ========================================================= */

function preencherInformacoesHorario(
    pesquisa
) {

    preencherHorario(
        "[data-horario-origem]",
        pesquisa.origem
    );


    preencherHorario(
        "[data-horario-destino]",
        pesquisa.destino
    );


    preencherHorario(
        "[data-horario-data]",
        formatarDataHorario(
            pesquisa.data
        )
    );

}


/* =========================================================
   QUANTIDADE
   ========================================================= */

function atualizarQuantidadeHorarios(
    quantidade
) {

    const elemento =
        document.querySelector(
            "[data-total-horarios]"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        `${quantidade} ${
            quantidade === 1
                ? "horário encontrado"
                : "horários encontrados"
        }`;

}


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

function normalizarHorario(
    texto
) {

    return String(texto)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase();

}


function formatarDataBusca(
    data
) {

    if (!data) {
        return "";
    }


    const partes =
        data.split("-");


    if (partes.length !== 3) {
        return data;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function converterDataISO(
    data
) {

    const partes =
        data.split("/");


    if (partes.length !== 3) {
        return data;
    }


    return `${partes[2]}-${partes[1]}-${partes[0]}`;

}


function formatarDataHorario(
    data
) {

    if (!data) {
        return "-";
    }


    const objeto =
        new Date(
            `${data}T00:00:00`
        );


    if (
        Number.isNaN(
            objeto.getTime()
        )
    ) {

        return data;

    }


    return objeto.toLocaleDateString(
        "pt-BR"
    );

}


function formatarMoedaHorario(
    valor
) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function preencherHorario(
    seletor,
    valor
) {

    document
        .querySelectorAll(seletor)
        .forEach(
            (elemento) => {

                elemento.textContent =
                    valor || "-";

            }
        );

}


function mostrarMensagemSemPesquisa() {

    const lista =
        document.querySelector(
            "[data-horarios-lista]"
        );


    if (!lista) {
        return;
    }


    lista.innerHTML = `

        <div class="sem-horarios">

            <h2>
                Nenhuma pesquisa encontrada
            </h2>

            <p>
                Faça uma pesquisa para
                consultar os horários.
            </p>

            <a href="index.html">
                Fazer pesquisa
            </a>

        </div>

    `;

}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.HorariosGuiaBusao = {

    buscarHorarios,

    exibirHorarios,

    selecionarHorario,

    obterPesquisaHorarios

};