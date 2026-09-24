/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT PRINCIPAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarMenuMobile();
    inicializarAno();
    inicializarBotoesVoltar();
    inicializarLinksInternos();
});


/* =========================================================
   MENU MOBILE
   ========================================================= */

function inicializarMenuMobile() {
    const menuButton = document.querySelector(".menu-mobile");
    const navMenu = document.querySelector(".nav-menu");

    if (!menuButton || !navMenu) {
        return;
    }

    menuButton.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        menuButton.classList.toggle("active");
    });
}


/* =========================================================
   ANO AUTOMÁTICO
   ========================================================= */

function inicializarAno() {
    const elementosAno = document.querySelectorAll("[data-ano]");

    const anoAtual = new Date().getFullYear();

    elementosAno.forEach((elemento) => {
        elemento.textContent = anoAtual;
    });
}


/* =========================================================
   BOTÕES VOLTAR
   ========================================================= */

function inicializarBotoesVoltar() {
    const botoes = document.querySelectorAll("[data-voltar]");

    botoes.forEach((botao) => {
        botao.addEventListener("click", () => {
            window.history.back();
        });
    });
}


/* =========================================================
   LINKS INTERNOS
   ========================================================= */

function inicializarLinksInternos() {
    const links = document.querySelectorAll("[data-link]");

    links.forEach((link) => {
        link.addEventListener("click", () => {
            const destino = link.dataset.link;

            if (!destino) {
                return;
            }

            window.location.href = destino;
        });
    });
}


/* =========================================================
   NOTIFICAÇÃO
   ========================================================= */

function mostrarMensagem(mensagem, tipo = "info") {
    const mensagemExistente =
        document.querySelector(".site-notification");

    if (mensagemExistente) {
        mensagemExistente.remove();
    }

    const notificacao = document.createElement("div");

    notificacao.className =
        `site-notification site-notification-${tipo}`;

    notificacao.textContent = mensagem;

    document.body.appendChild(notificacao);

    setTimeout(() => {
        notificacao.classList.add("show");
    }, 10);

    setTimeout(() => {
        notificacao.classList.remove("show");

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

    const dataObj = new Date(data + "T00:00:00");

    if (Number.isNaN(dataObj.getTime())) {
        return "";
    }

    return dataObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}


/* =========================================================
   FORMATAÇÃO DE HORÁRIO
   ========================================================= */

function formatarHorario(data) {
    if (!data) {
        return "";
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
        return "";
    }

    return dataObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
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
        const dados = localStorage.getItem(chave);

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
    localStorage.removeItem(chave);
}


/* =========================================================
   USUÁRIO
   ========================================================= */

function usuarioEstaLogado() {
    return Boolean(
        localStorage.getItem("guiaBusaoUsuario")
    );
}


function obterUsuario() {
    return carregarDados("guiaBusaoUsuario");
}


function salvarUsuario(usuario) {
    return salvarDados(
        "guiaBusaoUsuario",
        usuario
    );
}


function sairDaConta() {
    removerDados("guiaBusaoUsuario");

    window.location.href =
        "login.html";
}


/* =========================================================
   PESQUISA
   ========================================================= */

function salvarPesquisa(pesquisa) {
    let pesquisas =
        carregarDados("guiaBusaoPesquisas");

    if (!Array.isArray(pesquisas)) {
        pesquisas = [];
    }

    pesquisas.unshift(pesquisa);

    /*
     * Mantém somente as 5 pesquisas
     * mais recentes.
     */

    pesquisas = pesquisas.slice(0, 5);

    salvarDados(
        "guiaBusaoPesquisas",
        pesquisas
    );
}


function obterPesquisasRecentes() {
    const pesquisas =
        carregarDados("guiaBusaoPesquisas");

    return Array.isArray(pesquisas)
        ? pesquisas
        : [];
}


function limparPesquisas() {
    removerDados("guiaBusaoPesquisas");
}


/* =========================================================
   EXPORTAÇÃO
   Permite utilizar as funções em outros arquivos JS.
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

    limparPesquisas

};