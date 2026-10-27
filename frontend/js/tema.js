
/* =========================================================
   GUIA DO BUSÃO — TEMA GLOBAL
   Salva a preferência e aplica em todas as páginas.
   ========================================================= */

(function () {
    const CHAVE_TEMA = "guiaBusaoTema";

    function obterTema() {
        try {
            return localStorage.getItem(CHAVE_TEMA) === "escuro"
                ? "escuro"
                : "claro";
        } catch (erro) {
            return "claro";
        }
    }

    function aplicarTema(tema) {
        const temaValido = tema === "escuro" ? "escuro" : "claro";

        document.documentElement.setAttribute("data-tema", temaValido);

        try {
            localStorage.setItem(CHAVE_TEMA, temaValido);
        } catch (erro) {
            console.error("Não foi possível salvar o tema:", erro);
        }

        atualizarControles(temaValido);
    }

    function atualizarControles(tema) {
        const escuroAtivo = tema === "escuro";

        // Botão do cabeçalho: mantém somente o ícone.
        const botaoTema = document.querySelector("#themeButton");

        if (botaoTema) {
            botaoTema.textContent = escuroAtivo ? "☀️" : "☾";
            botaoTema.setAttribute(
                "aria-label",
                escuroAtivo ? "Ativar tema claro" : "Ativar tema escuro"
            );
            botaoTema.setAttribute("aria-pressed", String(escuroAtivo));
            botaoTema.title = escuroAtivo
                ? "Ativar tema claro"
                : "Ativar tema escuro";
        }

        // Interruptor de tema nas configurações do perfil.
        const interruptor = document.querySelector("#darkMode");

        if (interruptor) {
            interruptor.checked = escuroAtivo;
        }

        // Outros controles que alternem o tema.
        document.querySelectorAll("[data-alternar-tema]").forEach((controle) => {
            if (controle.id === "themeButton" || controle.id === "darkMode") {
                return;
            }

            if (controle.type === "checkbox") {
                controle.checked = escuroAtivo;
            } else {
                controle.textContent = escuroAtivo
                    ? "☀️ Tema claro"
                    : "🌙 Tema escuro";
            }

            controle.setAttribute("aria-pressed", String(escuroAtivo));
        });
    }

    function inicializarTema() {
        // Aplica a preferência salva ao abrir qualquer página.
        aplicarTema(obterTema());

        // Botão do cabeçalho.
        const botaoTema = document.querySelector("#themeButton");

        if (botaoTema) {
            botaoTema.addEventListener("click", function () {
                const temaAtual =
                    document.documentElement.getAttribute("data-tema");

                aplicarTema(temaAtual === "escuro" ? "claro" : "escuro");
            });
        }

        // Interruptor das configurações do perfil.
        const interruptor = document.querySelector("#darkMode");

        if (interruptor) {
            interruptor.addEventListener("change", function () {
                aplicarTema(this.checked ? "escuro" : "claro");
            });
        }

        // Outros controles de tema, se existirem.
        document.querySelectorAll("[data-alternar-tema]").forEach((controle) => {
            if (controle.id === "themeButton" || controle.id === "darkMode") {
                return;
            }

            if (controle.type === "checkbox") {
                controle.addEventListener("change", function () {
                    aplicarTema(this.checked ? "escuro" : "claro");
                });
            } else {
                controle.addEventListener("click", function () {
                    const temaAtual =
                        document.documentElement.getAttribute("data-tema");

                    aplicarTema(temaAtual === "escuro" ? "claro" : "escuro");
                });
            }
        });
    }

    // Aplica o tema antes de carregar o restante da página.
    document.documentElement.setAttribute("data-tema", obterTema());

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializarTema);
    } else {
        inicializarTema();
    }
})();
