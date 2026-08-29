/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT DE FAVORITOS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarFavoritos();
});


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarFavoritos() {

    exibirFavoritos();

    inicializarBotoesFavoritos();

}


/* =========================================================
   OBTER FAVORITOS
   ========================================================= */

function obterFavoritos() {

    const dados =
        localStorage.getItem(
            "guiaBusaoFavoritos"
        );


    if (!dados) {
        return [];
    }


    try {

        const favoritos =
            JSON.parse(dados);


        return Array.isArray(favoritos)
            ? favoritos
            : [];


    } catch (erro) {

        console.error(
            "Erro ao carregar favoritos:",
            erro
        );

        return [];

    }

}


/* =========================================================
   SALVAR FAVORITOS
   ========================================================= */

function salvarFavoritos(
    favoritos
) {

    localStorage.setItem(
        "guiaBusaoFavoritos",
        JSON.stringify(
            favoritos
        )
    );

}


/* =========================================================
   ADICIONAR FAVORITO
   ========================================================= */

function adicionarFavorito(
    viagem
) {

    const favoritos =
        obterFavoritos();


    const jaExiste =
        favoritos.some(
            (favorito) =>
                favorito.id ===
                viagem.id
        );


    if (jaExiste) {

        mostrarMensagemFavorito(
            "Essa viagem já está nos favoritos.",
            "info"
        );

        return false;

    }


    favoritos.push(
        viagem
    );


    salvarFavoritos(
        favoritos
    );


    mostrarMensagemFavorito(
        "Viagem adicionada aos favoritos!",
        "success"
    );


    atualizarBotoesFavorito(
        viagem.id
    );


    return true;

}


/* =========================================================
   REMOVER FAVORITO
   ========================================================= */

function removerFavorito(
    id
) {

    let favoritos =
        obterFavoritos();


    favoritos =
        favoritos.filter(
            (favorito) =>
                favorito.id !== id
        );


    salvarFavoritos(
        favoritos
    );


    mostrarMensagemFavorito(
        "Viagem removida dos favoritos.",
        "info"
    );


    exibirFavoritos();

}


/* =========================================================
   VERIFICAR FAVORITO
   ========================================================= */

function ehFavorito(
    id
) {

    const favoritos =
        obterFavoritos();


    return favoritos.some(
        (favorito) =>
            favorito.id === id
    );

}


/* =========================================================
   ALTERNAR FAVORITO
   ========================================================= */

function alternarFavorito(
    viagem
) {

    if (
        ehFavorito(
            viagem.id
        )
    ) {

        removerFavorito(
            viagem.id
        );

        return;

    }


    adicionarFavorito(
        viagem
    );

}


/* =========================================================
   EXIBIR FAVORITOS
   ========================================================= */

function exibirFavoritos() {

    const lista =
        document.querySelector(
            "[data-favoritos-lista]"
        );


    if (!lista) {
        return;
    }


    const favoritos =
        obterFavoritos();


    lista.innerHTML = "";


    if (
        favoritos.length === 0
    ) {

        lista.innerHTML = `

            <div class="sem-favoritos">

                <div class="sem-favoritos-icon">
                    ♡
                </div>

                <h2>
                    Você ainda não tem favoritos
                </h2>

                <p>
                    Salve suas viagens para
                    encontrá-las rapidamente depois.
                </p>

            </div>

        `;

        return;

    }


    favoritos.forEach(
        (viagem) => {

            const card =
                criarCardFavorito(
                    viagem
                );


            lista.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CARD DO FAVORITO
   ========================================================= */

function criarCardFavorito(
    viagem
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "favorito-card";


    card.innerHTML = `

        <div class="favorito-info">

            <div class="favorito-empresa">

                <strong>
                    ${viagem.empresa || "Empresa de ônibus"}
                </strong>

            </div>


            <div class="favorito-rota">

                <span>
                    ${viagem.origem}
                </span>

                <span>
                    →
                </span>

                <span>
                    ${viagem.destino}
                </span>

            </div>


            <div class="favorito-detalhes">

                <span>
                    📅 ${viagem.data}
                </span>

                <span>
                    🕐 ${viagem.saida}
                </span>

                <span>
                    💰 ${formatarMoedaFavorito(
                        viagem.preco
                    )}
                </span>

            </div>

        </div>


        <div class="favorito-acoes">

            <button
                type="button"
                data-abrir-favorito="${viagem.id}"
            >
                Ver viagem
            </button>


            <button
                type="button"
                data-remover-favorito="${viagem.id}"
            >
                ♡
            </button>

        </div>

    `;


    /* ABRIR VIAGEM */

    const abrir =
        card.querySelector(
            "[data-abrir-favorito]"
        );


    abrir.addEventListener(
        "click",
        () => {

            localStorage.setItem(
                "guiaBusaoRotaSelecionada",
                JSON.stringify(
                    viagem
                )
            );


            window.location.href =
                "rota.html";

        }
    );


    /* REMOVER */

    const remover =
        card.querySelector(
            "[data-remover-favorito]"
        );


    remover.addEventListener(
        "click",
        () => {

            removerFavorito(
                viagem.id
            );

        }
    );


    return card;

}


/* =========================================================
   BOTÕES DE FAVORITO NAS OUTRAS PÁGINAS
   ========================================================= */

function inicializarBotoesFavoritos() {

    const botoes =
        document.querySelectorAll(
            "[data-favorito]"
        );


    botoes.forEach(
        (botao) => {

            const id =
                Number(
                    botao.dataset.favorito
                );


            atualizarEstadoBotao(
                botao,
                id
            );


            botao.addEventListener(
                "click",
                () => {

                    const viagem =
                        obterViagemPorId(
                            id
                        );


                    if (!viagem) {

                        mostrarMensagemFavorito(
                            "Não foi possível encontrar essa viagem.",
                            "error"
                        );

                        return;

                    }


                    alternarFavorito(
                        viagem
                    );


                    atualizarEstadoBotao(
                        botao,
                        id
                    );

                }
            );

        }
    );

}


/* =========================================================
   ATUALIZAR BOTÃO
   ========================================================= */

function atualizarEstadoBotao(
    botao,
    id
) {

    const favorito =
        ehFavorito(id);


    if (favorito) {

        botao.classList.add(
            "favoritado"
        );

        botao.textContent =
            "♥";

        botao.setAttribute(
            "aria-label",
            "Remover dos favoritos"
        );

    } else {

        botao.classList.remove(
            "favoritado"
        );

        botao.textContent =
            "♡";

        botao.setAttribute(
            "aria-label",
            "Adicionar aos favoritos"
        );

    }

}


/* =========================================================
   ATUALIZAR TODOS OS BOTÕES
   ========================================================= */

function atualizarBotoesFavorito(
    id
) {

    const botoes =
        document.querySelectorAll(
            `[data-favorito="${id}"]`
        );


    botoes.forEach(
        (botao) => {

            atualizarEstadoBotao(
                botao,
                id
            );

        }
    );

}


/* =========================================================
   PROCURAR VIAGEM
   ========================================================= */

function obterViagemPorId(
    id
) {

    /*
     * Primeiro procura nos dados
     * temporários dos resultados.
     */

    if (
        typeof viagensExemplo !==
        "undefined"
    ) {

        return viagensExemplo.find(
            (viagem) =>
                viagem.id === id
        );

    }


    /*
     * Caso não encontre,
     * verifica a rota selecionada.
     */

    const dados =
        localStorage.getItem(
            "guiaBusaoRotaSelecionada"
        );


    if (!dados) {
        return null;
    }


    try {

        const viagem =
            JSON.parse(dados);


        if (
            viagem.id === id
        ) {

            return viagem;

        }


    } catch (erro) {

        console.error(
            "Erro ao procurar viagem:",
            erro
        );

    }


    return null;

}


/* =========================================================
   MOEDA
   ========================================================= */

function formatarMoedaFavorito(
    valor
) {

    if (
        typeof valor !== "number"
    ) {

        return "Consultar";

    }


    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagemFavorito(
    mensagem,
    tipo = "info"
) {

    if (
        window.GuiaBusao &&
        typeof window.GuiaBusao.mostrarMensagem ===
        "function"
    ) {

        window.GuiaBusao.mostrarMensagem(
            mensagem,
            tipo
        );

        return;

    }


    alert(mensagem);

}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.FavoritosGuiaBusao = {

    obterFavoritos,

    adicionarFavorito,

    removerFavorito,

    ehFavorito,

    alternarFavorito,

    exibirFavoritos

};