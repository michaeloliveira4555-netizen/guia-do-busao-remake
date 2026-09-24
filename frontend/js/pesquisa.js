/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT DA PESQUISA
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarPesquisa();
});


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarPesquisa() {

    const formulario =
        document.querySelector("[data-formulario-pesquisa]");

    if (!formulario) {
        return;
    }

    definirDataMinima();

    formulario.addEventListener("submit", (evento) => {

        evento.preventDefault();

        realizarPesquisa(formulario);

    });
}


/* =========================================================
   DATA MÍNIMA
   ========================================================= */

function definirDataMinima() {

    const campo =
        document.querySelector("[data-data-viagem]");

    if (!campo) {
        return;
    }

    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(hoje.getMonth() + 1)
            .padStart(2, "0");

    const dia =
        String(hoje.getDate())
            .padStart(2, "0");

    campo.min =
        `${ano}-${mes}-${dia}`;
}


/* =========================================================
   REALIZAR PESQUISA
   ========================================================= */

function realizarPesquisa(formulario) {

    const dados =
        new FormData(formulario);

    const origem =
        obterValor(dados, "origem");

    const destino =
        obterValor(dados, "destino");

    const data =
        obterValor(dados, "data");

    const horario =
        obterValor(dados, "horario");


    /* -----------------------------------------
       VALIDAÇÃO
       ----------------------------------------- */

    if (!origem) {

        mostrarMensagemPesquisa(
            "Informe o local de origem.",
            "warning"
        );

        return;
    }


    if (!destino) {

        mostrarMensagemPesquisa(
            "Informe o destino.",
            "warning"
        );

        return;
    }


    if (!data) {

        mostrarMensagemPesquisa(
            "Informe a data da viagem.",
            "warning"
        );

        return;
    }


    /* -----------------------------------------
       NÃO PERMITIR ORIGEM E DESTINO IGUAIS
       ----------------------------------------- */

    if (
        origem.trim().toLowerCase() ===
        destino.trim().toLowerCase()
    ) {

        mostrarMensagemPesquisa(
            "A origem e o destino precisam ser diferentes.",
            "warning"
        );

        return;
    }


    /* -----------------------------------------
       OBJETO DA PESQUISA
       ----------------------------------------- */

    const pesquisa = {

        origem:
            origem.trim(),

        destino:
            destino.trim(),

        data,

        horario:
            horario || null,

        realizadaEm:
            new Date().toISOString()

    };


    /* -----------------------------------------
       SALVAR PESQUISA
       ----------------------------------------- */

    localStorage.setItem(
        "guiaBusaoPesquisa",
        JSON.stringify(pesquisa)
    );


    /* -----------------------------------------
       HISTÓRICO
       ----------------------------------------- */

    salvarHistoricoPesquisa(
        pesquisa
    );


    /* -----------------------------------------
       IR PARA RESULTADOS
       ----------------------------------------- */

    window.location.href =
        "resultado.html";
}


/* =========================================================
   OBTER VALOR DO FORMULÁRIO
   ========================================================= */

function obterValor(
    dados,
    nome
) {

    const valor =
        dados.get(nome);

    if (!valor) {
        return "";
    }

    return String(valor).trim();
}


/* =========================================================
   CARREGAR PESQUISA
   ========================================================= */

function obterPesquisaAtual() {

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
   HISTÓRICO DE PESQUISAS
   ========================================================= */

function salvarHistoricoPesquisa(
    pesquisa
) {

    let historico = [];

    const dados =
        localStorage.getItem(
            "guiaBusaoHistorico"
        );

    if (dados) {

        try {

            historico =
                JSON.parse(dados);

        } catch (erro) {

            historico = [];

        }

    }


    if (!Array.isArray(historico)) {
        historico = [];
    }


    historico.unshift(
        pesquisa
    );


    /*
     * Guarda somente as últimas
     * 10 pesquisas.
     */

    historico =
        historico.slice(0, 10);


    localStorage.setItem(
        "guiaBusaoHistorico",
        JSON.stringify(historico)
    );
}


/* =========================================================
   OBTER HISTÓRICO
   ========================================================= */

function obterHistoricoPesquisa() {

    const dados =
        localStorage.getItem(
            "guiaBusaoHistorico"
        );

    if (!dados) {
        return [];
    }


    try {

        const historico =
            JSON.parse(dados);

        return Array.isArray(historico)
            ? historico
            : [];

    } catch (erro) {

        return [];

    }
}


/* =========================================================
   LIMPAR HISTÓRICO
   ========================================================= */

function limparHistoricoPesquisa() {

    localStorage.removeItem(
        "guiaBusaoHistorico"
    );

}


/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagemPesquisa(
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
   FORMATAR DATA
   ========================================================= */

function formatarDataPesquisa(
    data
) {

    if (!data) {
        return "-";
    }


    /*
     * Adicionamos o horário para evitar
     * problemas de fuso horário.
     */

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
   EXPORTAÇÃO
   ========================================================= */

window.PesquisaGuiaBusao = {

    realizarPesquisa,

    obterPesquisaAtual,

    obterHistoricoPesquisa,

    limparHistoricoPesquisa,

    formatarDataPesquisa

};