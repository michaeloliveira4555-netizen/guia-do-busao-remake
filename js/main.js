/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT PRINCIPAL
   ========================================================= */


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    inicializarMenuMobile();

    inicializarAno();

    inicializarBotoesVoltar();

    inicializarLinksInternos();

    inicializarPesquisaRota();

});


/* =========================================================
   MENU MOBILE
   ========================================================= */

function inicializarMenuMobile() {

    const menuButton =
        document.querySelector(".menu-mobile") ||
        document.querySelector(".mobile-menu-button");

    const navMenu =
        document.querySelector(".nav-menu") ||
        document.querySelector(".nav");

    if (!menuButton || !navMenu) {
        return;
    }

    menuButton.addEventListener("click", () => {

        navMenu.classList.toggle("active");

        menuButton.classList.toggle("active");

    });

}


/* =========================================================
   ANO
   ========================================================= */

function inicializarAno() {

    const elementosAno =
        document.querySelectorAll("[data-ano]");

    const anoAtual =
        new Date().getFullYear();

    elementosAno.forEach(elemento => {

        elemento.textContent =
            anoAtual;

    });

}


/* =========================================================
   BOTÕES VOLTAR
   ========================================================= */

function inicializarBotoesVoltar() {

    const botoes =
        document.querySelectorAll("[data-voltar]");

    botoes.forEach(botao => {

        botao.addEventListener("click", () => {

            window.history.back();

        });

    });

}


/* =========================================================
   LINKS INTERNOS
   ========================================================= */

function inicializarLinksInternos() {

    const links =
        document.querySelectorAll("[data-link]");

    links.forEach(link => {

        link.addEventListener("click", () => {

            const destino =
                link.dataset.link;

            if (!destino) {
                return;
            }

            window.location.href =
                destino;

        });

    });

}


/* =========================================================
   NOTIFICAÇÃO
   ========================================================= */

function mostrarMensagem(
    mensagem,
    tipo = "info"
) {

    const antiga =
        document.querySelector(
            ".site-notification"
        );

    if (antiga) {
        antiga.remove();
    }

    const notificacao =
        document.createElement("div");

    notificacao.className =
        `site-notification site-notification-${tipo}`;

    notificacao.textContent =
        mensagem;

    document.body.appendChild(
        notificacao
    );

    setTimeout(() => {

        notificacao.classList.add(
            "show"
        );

    }, 10);

    setTimeout(() => {

        notificacao.classList.remove(
            "show"
        );

        setTimeout(() => {

            notificacao.remove();

        }, 300);

    }, 3000);

}


/* =========================================================
   FORMATAÇÃO DE DATA
   ========================================================= */

function formatarData(data) {

    if (!data) {
        return "";
    }

    const dataObj =
        new Date(
            data + "T00:00:00"
        );

    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {
        return "";
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
   FORMATAÇÃO DE HORÁRIO
   ========================================================= */

function formatarHorario(data) {

    if (!data) {
        return "";
    }

    const dataObj =
        new Date(data);

    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {
        return "";
    }

    return dataObj.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function salvarDados(chave, dados) {

    try {

        localStorage.setItem(
            chave,
            JSON.stringify(dados)
        );

        return true;

    } catch (erro) {

        console.error(
            "Erro ao salvar dados:",
            erro
        );

        return false;

    }

}


function carregarDados(chave) {

    try {

        const dados =
            localStorage.getItem(
                chave
            );

        if (!dados) {
            return null;
        }

        return JSON.parse(dados);

    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

        return null;

    }

}


function removerDados(chave) {

    localStorage.removeItem(
        chave
    );

}


/* =========================================================
   USUÁRIO
   ========================================================= */

function usuarioEstaLogado() {

    return Boolean(
        localStorage.getItem(
            "guiaBusaoUsuario"
        )
    );

}


function obterUsuario() {

    return carregarDados(
        "guiaBusaoUsuario"
    );

}


function salvarUsuario(usuario) {

    return salvarDados(
        "guiaBusaoUsuario",
        usuario
    );

}


function sairDaConta() {

    removerDados(
        "guiaBusaoUsuario"
    );

    window.location.href =
        "login.html";

}


/* =========================================================
   PESQUISAS
   ========================================================= */

function salvarPesquisa(pesquisa) {

    let pesquisas =
        carregarDados(
            "guiaBusaoPesquisas"
        );

    if (!Array.isArray(pesquisas)) {

        pesquisas = [];

    }

    pesquisas.unshift(
        pesquisa
    );

    pesquisas =
        pesquisas.slice(0, 5);

    salvarDados(
        "guiaBusaoPesquisas",
        pesquisas
    );

}


function obterPesquisasRecentes() {

    const pesquisas =
        carregarDados(
            "guiaBusaoPesquisas"
        );

    return Array.isArray(pesquisas)
        ? pesquisas
        : [];

}


function limparPesquisas() {

    removerDados(
        "guiaBusaoPesquisas"
    );

}


/* =========================================================
   PESQUISA DE ROTAS
   ========================================================= */

let todasAsRotas = [];

let origemSelecionada = null;

let destinoSelecionado = null;


async function inicializarPesquisaRota() {

    const formulario =
        document.querySelector(
            "#routeForm"
        );

    if (!formulario) {
        return;
    }

    const origemInput =
        document.querySelector(
            "#origin"
        );

    const destinoInput =
        document.querySelector(
            "#destination"
        );

    const origemSuggestions =
        document.querySelector(
            "#originSuggestions"
        );

    const destinoSuggestions =
        document.querySelector(
            "#destinationSuggestions"
        );


    try {

        /*
         * Carrega as linhas reais
         * do backend.
         */

        todasAsRotas =
            await listarRotas();

    } catch (erro) {

        console.error(
            "Erro ao carregar rotas:",
            erro
        );

        mostrarMensagem(
            "Não foi possível carregar as localidades.",
            "error"
        );

        return;

    }


    /*
     * Autocomplete da origem
     */

    if (origemInput) {

        origemInput.addEventListener(
            "input",
            () => {

                origemSelecionada =
                    null;

                mostrarSugestoes(
                    origemInput.value,
                    origemSuggestions,
                    "origem"
                );

            }
        );

        origemInput.addEventListener(
            "focus",
            () => {

                mostrarSugestoes(
                    origemInput.value,
                    origemSuggestions,
                    "origem"
                );

            }
        );

    }


    /*
     * Autocomplete do destino
     */

    if (destinoInput) {

        destinoInput.addEventListener(
            "input",
            () => {

                destinoSelecionado =
                    null;

                mostrarSugestoes(
                    destinoInput.value,
                    destinoSuggestions,
                    "destino"
                );

            }
        );

        destinoInput.addEventListener(
            "focus",
            () => {

                mostrarSugestoes(
                    destinoInput.value,
                    destinoSuggestions,
                    "destino"
                );

            }
        );

    }


    /*
     * Formulário
     */

    formulario.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();

            await executarBusca();

        }
    );


    /*
     * Fecha sugestões ao clicar
     * fora delas.
     */

    document.addEventListener(
        "click",
        evento => {

            if (
                !evento.target.closest(
                    ".form-group"
                )
            ) {

                esconderSugestoes(
                    origemSuggestions
                );

                esconderSugestoes(
                    destinoSuggestions
                );

            }

        }
    );

}


/* =========================================================
   CRIAR LOCALIDADES
   ========================================================= */

function obterLocalidades() {

    const localidades = [];

    const cidades = new Map();

    const bairros = new Map();


    todasAsRotas.forEach(rota => {

        if (
            rota.origem &&
            rota.origem.cidade
        ) {

            const cidade =
                rota.origem.cidade;

            cidades.set(
                cidade.id,
                cidade
            );

        }


        if (
            rota.destino &&
            rota.destino.cidade
        ) {

            const cidade =
                rota.destino.cidade;

            cidades.set(
                cidade.id,
                cidade
            );

        }


        if (
            rota.origem &&
            rota.origem.bairro
        ) {

            const bairro =
                rota.origem.bairro;

            bairros.set(
                bairro.id,
                {
                    ...bairro,
                    cidade:
                        rota.origem.cidade
                }
            );

        }


        if (
            rota.destino &&
            rota.destino.bairro
        ) {

            const bairro =
                rota.destino.bairro;

            bairros.set(
                bairro.id,
                {
                    ...bairro,
                    cidade:
                        rota.destino.cidade
                }
            );

        }

    });


    cidades.forEach(cidade => {

        localidades.push({

            tipo: "cidade",

            id: cidade.id,

            nome: cidade.nome,

            estado: cidade.estado,

            cidadeId: cidade.id,

            bairroId: null

        });

    });


    bairros.forEach(bairro => {

        localidades.push({

            tipo: "bairro",

            id: bairro.id,

            nome: bairro.nome,

            estado:
                bairro.cidade
                    ? bairro.cidade.estado
                    : "",

            cidade:
                bairro.cidade
                    ? bairro.cidade.nome
                    : "",

            cidadeId:
                bairro.cidadeId,

            bairroId:
                bairro.id

        });

    });


    return localidades;

}


/* =========================================================
   MOSTRAR SUGESTÕES
   ========================================================= */

function mostrarSugestoes(
    texto,
    container,
    tipoCampo
) {

    if (!container) {
        return;
    }


    const localidades =
        obterLocalidades();


    const termo =
        normalizarTexto(texto);


    /*
     * Se não digitou nada,
     * mostra algumas localidades.
     */

    let resultados =
        localidades;


    if (termo) {

        resultados =
            localidades.filter(
                local => {

                    const nome =
                        normalizarTexto(
                            local.nome
                        );

                    const cidade =
                        normalizarTexto(
                            local.cidade || ""
                        );

                    return (
                        nome.includes(termo) ||
                        cidade.includes(termo)
                    );

                }
            );

    }


    /*
     * Remove duplicados.
     */

    const vistos =
        new Set();

    resultados =
        resultados.filter(local => {

            const chave =
                `${local.tipo}-${local.id}`;

            if (vistos.has(chave)) {
                return false;
            }

            vistos.add(chave);

            return true;

        });


    /*
     * Limita a quantidade.
     */

    resultados =
        resultados.slice(0, 8);


    container.innerHTML = "";


    if (
        resultados.length === 0
    ) {

        container.innerHTML = `
            <div class="suggestion-empty">
                Nenhuma localidade encontrada
            </div>
        `;

        container.classList.add(
            "active"
        );

        return;

    }


    resultados.forEach(
        local => {

            const item =
                document.createElement(
                    "button"
                );

            item.type = "button";

            item.className =
                "suggestion-item";


            const localSecundario =
                local.tipo === "cidade"
                    ? local.estado
                    : `${local.cidade} - ${local.estado}`;


            item.innerHTML = `
                <span class="suggestion-icon">
                    📍
                </span>

                <span class="suggestion-text">
                    <strong>
                        ${escaparHTML(local.nome)}
                    </strong>

                    <small>
                        ${escaparHTML(localSecundario)}
                    </small>
                </span>
            `;


            item.addEventListener(
                "click",
                () => {

                    selecionarLocalidade(
                        local,
                        tipoCampo,
                        container
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );


    container.classList.add(
        "active"
    );

}


/* =========================================================
   SELECIONAR LOCALIDADE
   ========================================================= */

function selecionarLocalidade(
    local,
    tipoCampo,
    container
) {

    const input =
        tipoCampo === "origem"
            ? document.querySelector(
                "#origin"
            )
            : document.querySelector(
                "#destination"
            );


    if (!input) {
        return;
    }


    input.value =
        local.nome;


    if (tipoCampo === "origem") {

        origemSelecionada =
            local;

    } else {

        destinoSelecionado =
            local;

    }


    esconderSugestoes(
        container
    );

}


/* =========================================================
   ESCONDER SUGESTÕES
   ========================================================= */

function esconderSugestoes(
    container
) {

    if (!container) {
        return;
    }

    container.classList.remove(
        "active"
    );

}


/* =========================================================
   EXECUTAR BUSCA
   ========================================================= */

async function executarBusca() {

    const origemInput =
        document.querySelector(
            "#origin"
        );

    const destinoInput =
        document.querySelector(
            "#destination"
        );

    const dataInput =
        document.querySelector(
            "#travelDate"
        );

    const horarioInput =
        document.querySelector(
            "#travelTime"
        );

    const botao =
        document.querySelector(
            "#searchButton"
        );


    const origemTexto =
        origemInput
            ? origemInput.value.trim()
            : "";


    const destinoTexto =
        destinoInput
            ? destinoInput.value.trim()
            : "";


    if (
        !origemTexto ||
        !destinoTexto
    ) {

        mostrarMensagem(
            "Informe a origem e o destino.",
            "error"
        );

        return;

    }


    if (botao) {

        botao.disabled = true;

        const texto =
            botao.querySelector(
                "span"
            );

        if (texto) {

            texto.textContent =
                "Buscando...";

        }

    }


    try {

        /*
         * Se o usuário não clicou
         * em uma sugestão, tenta
         * encontrar automaticamente.
         */

        if (!origemSelecionada) {

            origemSelecionada =
                encontrarLocalidade(
                    origemTexto
                );

        }


        if (!destinoSelecionado) {

            destinoSelecionado =
                encontrarLocalidade(
                    destinoTexto
                );

        }


        if (
            !origemSelecionada ||
            !destinoSelecionado
        ) {

            throw new Error(
                "Selecione uma origem e um destino da lista de sugestões."
            );

        }


        /*
         * Filtra as linhas reais.
         */

        const resultados =
            filtrarRotas(
                origemSelecionada,
                destinoSelecionado
            );


        /*
         * Pesquisa atual.
         */

        const pesquisa = {

            origem:
                origemTexto,

            destino:
                destinoTexto,

            origemLocal:
                origemSelecionada,

            destinoLocal:
                destinoSelecionado,

            data:
                dataInput
                    ? dataInput.value
                    : "",

            horario:
                horarioInput
                    ? horarioInput.value
                    : "",

            dataPesquisa:
                new Date().toISOString()

        };


        /*
         * Salva para resultado.html
         */

        salvarDados(
            "guiaBusaoPesquisaAtual",
            pesquisa
        );


        salvarDados(
            "guiaBusaoRotasEncontradas",
            resultados
        );


        salvarDados(
            "guiaBusaoQuantidadeRotas",
            resultados.length
        );


        salvarPesquisa(
            pesquisa
        );


        /*
         * Também mantém a chave
         * usada pelo resultado.js antigo.
         */

        salvarDados(
            "guiaBusaoPesquisa",
            pesquisa
        );


        window.location.href =
            "resultado.html";

    } catch (erro) {

        console.error(
            "Erro na busca:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível realizar a busca.",
            "error"
        );

    } finally {

        if (botao) {

            botao.disabled = false;

            const texto =
                botao.querySelector(
                    "span"
                );

            if (texto) {

                texto.textContent =
                    "Buscar rota";

            }

        }

    }

}


/* =========================================================
   ENCONTRAR LOCALIDADE
   ========================================================= */

function encontrarLocalidade(
    texto
) {

    const termo =
        normalizarTexto(texto);


    const localidades =
        obterLocalidades();


    /*
     * Primeiro tenta igualdade
     * exata.
     */

    let resultado =
        localidades.find(
            local =>
                normalizarTexto(
                    local.nome
                ) === termo
        );


    if (resultado) {
        return resultado;
    }


    /*
     * Depois tenta começo do nome.
     */

    resultado =
        localidades.find(
            local =>
                normalizarTexto(
                    local.nome
                ).startsWith(termo)
        );


    return resultado || null;

}


/* =========================================================
   FILTRAR ROTAS
   ========================================================= */

function filtrarRotas(
    origem,
    destino
) {

    return todasAsRotas.filter(
        rota => {

            const origemOK =
                localidadeCorresponde(
                    rota.origem,
                    origem
                );


            const destinoOK =
                localidadeCorresponde(
                    rota.destino,
                    destino
                );


            return (
                origemOK &&
                destinoOK
            );

        }
    );

}


/* =========================================================
   COMPARAR LOCALIDADES
   ========================================================= */

function localidadeCorresponde(
    rotaLocal,
    localSelecionado
) {

    if (
        !rotaLocal ||
        !localSelecionado
    ) {
        return false;
    }


    /*
     * Se foi selecionado um bairro,
     * exige aquele bairro.
     */

    if (
        localSelecionado.bairroId
    ) {

        return (
            rotaLocal.bairro &&
            rotaLocal.bairro.id ===
                localSelecionado.bairroId
        );

    }


    /*
     * Se foi selecionada uma cidade,
     * aceita qualquer bairro daquela cidade.
     */

    if (
        localSelecionado.cidadeId
    ) {

        return (
            rotaLocal.cidade &&
            rotaLocal.cidade.id ===
                localSelecionado.cidadeId
        );

    }


    return false;

}


/* =========================================================
   NORMALIZAR TEXTO
   ========================================================= */

function normalizarTexto(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


/* =========================================================
   SEGURANÇA HTML
   ========================================================= */

function escaparHTML(texto) {

    return String(texto || "")
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

window.GuiaBusao = {

    mostrarMensagem,

    formatarData,

    formatarHorario,

    salvarDados,

    carregarDados,

    removerDados,

    usuarioEstaLogado,

    obterUsuario,

    salvarUsuario,

    sairDaConta,

    salvarPesquisa,

    obterPesquisasRecentes,

    limparPesquisas,

    inicializarPesquisaRota

};