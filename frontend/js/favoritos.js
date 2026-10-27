"use strict";

(() => {
    const API_URL = "http://localhost:3000/api/favoritos";
    const CHAVE_TOKEN = "guiaBusaoToken";

    const lista = document.getElementById("favoritesList");
    const contador = document.getElementById("favoritesCount");
    const estadoVazio = document.getElementById("emptyFavorites");

    let favoritos = [];

    function obterToken() {
        try {
            return localStorage.getItem(CHAVE_TOKEN);
        } catch (erro) {
            return null;
        }
    }

    function mostrarMensagem(mensagem) {
        if (window.GuiaBusao &&
            typeof window.GuiaBusao.mostrarMensagem === "function") {
            window.GuiaBusao.mostrarMensagem(mensagem);
        } else {
            window.alert(mensagem);
        }
    }

    async function requisitarAPI(url, opcoes = {}) {
        const token = obterToken();

        if (!token) {
            throw new Error("Entre na sua conta para acessar seus favoritos.");
        }

        const resposta = await fetch(url, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(opcoes.headers || {})
            }
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                dados.erro ||
                (resposta.status === 401 || resposta.status === 403
                    ? "Sua sessão expirou. Entre novamente na sua conta."
                    : "Não foi possível concluir a operação.")
            );
        }

        return dados;
    }

    function criarElemento(tag, classe, conteudo) {
        const elemento = document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        if (conteudo !== undefined && conteudo !== null) {
            elemento.textContent = String(conteudo);
        }

        return elemento;
    }

    function formatarData(data) {
        if (!data) {
            return "Data não informada";
        }

        const valor = String(data);

        const correspondencia = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (correspondencia) {
            return `${correspondencia[3]}/${correspondencia[2]}/${correspondencia[1]}`;
        }

        return valor;
    }

    function formatarPreco(preco) {
        if (preco === null || preco === undefined || preco === "") {
            return "Preço a consultar";
        }

        const valor = Number(preco);

        if (!Number.isFinite(valor)) {
            return "Preço a consultar";
        }

        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function atualizarContador() {
        if (!contador) {
            return;
        }

        const quantidade = favoritos.length;

        contador.textContent = quantidade === 1
            ? "1 rota favorita"
            : `${quantidade} rotas favoritas`;
    }

    function atualizarEstadoVazio() {
        if (lista) {
            lista.hidden = favoritos.length === 0;
        }

        if (estadoVazio) {
            estadoVazio.hidden = favoritos.length !== 0;
        }
    }

    function criarCartao(favorito) {
        const cartao = criarElemento("article", "favorite-card");

        const rota = criarElemento("div", "favorite-route");

        const origem = criarElemento("div", "favorite-location");
        const marcadorOrigem = criarElemento(
            "span",
            "location-marker origin",
            "●"
        );
        const conteudoOrigem = document.createElement("div");

        conteudoOrigem.append(
            criarElemento("small", "", "ORIGEM"),
            criarElemento("strong", "", favorito.origem || "Origem não informada")
        );

        origem.append(marcadorOrigem, conteudoOrigem);

        const seta = criarElemento("div", "favorite-arrow", "→");

        const destino = criarElemento("div", "favorite-location");
        const marcadorDestino = criarElemento(
            "span",
            "location-marker destination",
            "●"
        );
        const conteudoDestino = document.createElement("div");

        conteudoDestino.append(
            criarElemento("small", "", "DESTINO"),
            criarElemento("strong", "", favorito.destino || "Destino não informado")
        );

        destino.append(marcadorDestino, conteudoDestino);
        rota.append(origem, seta, destino);

        const detalhes = criarElemento("div", "favorite-details");

        detalhes.append(
            criarElemento(
                "span",
                "",
                `🕐 ${favorito.horario || "Horário não informado"}`
            ),
            criarElemento(
                "span",
                "",
                `📅 ${formatarData(favorito.data_viagem)}`
            ),
            criarElemento(
                "span",
                "",
                `💰 ${formatarPreco(favorito.preco)}`
            )
        );

        const acoes = criarElemento("div", "favorite-actions");

        const botaoRemover = criarElemento(
            "button",
            "favorite-remove",
            "♥"
        );

        botaoRemover.type = "button";
        botaoRemover.setAttribute(
            "aria-label",
            `Remover favorito: ${favorito.origem || "origem"} para ${favorito.destino || "destino"}`
        );
        botaoRemover.title = "Remover dos favoritos";

        botaoRemover.addEventListener("click", async () => {
            if (!favorito.id) {
                mostrarMensagem("Não foi possível identificar este favorito.");
                return;
            }

            const confirmar = window.confirm(
                `Deseja remover "${favorito.origem}" → "${favorito.destino}" dos favoritos?`
            );

            if (!confirmar) {
                return;
            }

            botaoRemover.disabled = true;

            try {
                await requisitarAPI(
                    `${API_URL}/${encodeURIComponent(favorito.id)}`,
                    { method: "DELETE" }
                );

                mostrarMensagem("Favorito removido com sucesso.");
                await carregarFavoritos();
            } catch (erro) {
                mostrarMensagem(erro.message);
                botaoRemover.disabled = false;
            }
        });

        acoes.append(botaoRemover);

        cartao.append(rota, detalhes, acoes);

        return cartao;
    }

    function renderizarFavoritos() {
        if (!lista) {
            return;
        }

        lista.replaceChildren();

        favoritos.forEach((favorito) => {
            lista.appendChild(criarCartao(favorito));
        });

        atualizarContador();
        atualizarEstadoVazio();
    }

    async function carregarFavoritos() {
        if (!lista) {
            return;
        }

        lista.replaceChildren(
            criarElemento("p", "", "Carregando seus favoritos...")
        );

        if (estadoVazio) {
            estadoVazio.hidden = true;
        }

        try {
            const dados = await requisitarAPI(API_URL);

            favoritos = Array.isArray(dados)
                ? dados
                : Array.isArray(dados.favoritos)
                    ? dados.favoritos
                    : [];

            renderizarFavoritos();
        } catch (erro) {
            favoritos = [];
            atualizarContador();

            lista.replaceChildren(
                criarElemento("p", "", erro.message)
            );

            if (estadoVazio) {
                estadoVazio.hidden = true;
            }
        }
    }

    document.addEventListener("DOMContentLoaded", carregarFavoritos);
})();
