(() => {
    "use strict";

    const CHAVE_ROTA = "guiaBusaoRotaSelecionada";
    const API_URL = "http://localhost:3000/api/rotas-salvas";
    const API_FAVORITOS = "http://localhost:3000/api/favoritos";

    const porId = (id) => document.getElementById(id);

    let favoritoAtualId = null;

    function lerJSON(chave, padrao = null) {
        try {
            const valor = localStorage.getItem(chave);
            return valor ? JSON.parse(valor) : padrao;
        } catch {
            return padrao;
        }
    }

    function texto(valor, padrao = "") {
        return String(valor ?? padrao).trim();
    }

    function mostrarAviso(mensagem, erro = false) {
        let aviso = porId("routeActionMessage");

        if (!aviso) {
            aviso = document.createElement("p");
            aviso.id = "routeActionMessage";
            aviso.setAttribute("role", "status");
            aviso.style.margin = "12px 0";
            aviso.style.padding = "12px";
            aviso.style.borderRadius = "8px";

            const acoes = document.querySelector(".route-actions");

            if (acoes) {
                acoes.insertAdjacentElement("afterend", aviso);
            } else {
                document.querySelector("main")?.appendChild(aviso);
            }
        }

        aviso.textContent = mensagem;
        aviso.style.color = erro ? "#b42318" : "";
    }

    function obterRota() {
        return lerJSON(CHAVE_ROTA, {}) || {};
    }

    function obterPesquisa() {
        return (
            lerJSON("guiaBusaoPesquisaAtual") ||
            lerJSON("guiaBusaoPesquisa") ||
            {}
        );
    }

    function obterData(rota) {
        const pesquisa = obterPesquisa();

        const valor =
            rota.data_viagem ||
            rota.data ||
            pesquisa.data_viagem ||
            pesquisa.data;

        if (!valor) return "";

        const data = String(valor).slice(0, 10);

        return /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : "";
    }

    function obterHorario(rota) {
        const pesquisa = obterPesquisa();

        const valor =
            rota.horario ||
            rota.saida ||
            rota.horario_partida ||
            pesquisa.horario;

        if (!valor) return "";

        const horario = String(valor).slice(0, 5);

        return /^([01]\d|2[0-3]):[0-5]\d$/.test(horario)
            ? horario
            : "";
    }

    function formatarMoeda(valor) {
        if (valor === null || valor === undefined || valor === "") {
            return "Não informado";
        }

        if (typeof valor === "string" && valor.includes("R$")) {
            return valor;
        }

        const numero = Number(valor);

        if (!Number.isFinite(numero)) return String(valor);

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function atualizarDetalhes() {
        const rota = obterRota();

        if (!Object.keys(rota).length) {
            mostrarAviso(
                "Nenhuma viagem foi selecionada. Volte aos resultados e escolha uma rota.",
                true
            );
            return;
        }

        const origem = texto(rota.origem, rota.nomeLinha);
        const destino = texto(rota.destino);

        if (origem) {
            if (porId("routeOrigin")) {
                porId("routeOrigin").textContent = origem;
            }

            if (porId("departureLocation")) {
                porId("departureLocation").textContent = texto(
                    rota.local_saida,
                    "Local de embarque não informado"
                );
            }
        }

        if (destino && porId("routeDestination")) {
            porId("routeDestination").textContent = destino;
        }

        const saida = texto(rota.saida || rota.horario);
        const chegada = texto(rota.chegada);

        if (saida && porId("departureTime")) {
            porId("departureTime").textContent = saida.slice(0, 5);
        }

        if (chegada && porId("arrivalTime")) {
            porId("arrivalTime").textContent = chegada.slice(0, 5);
        }

        const empresa = texto(rota.empresa || rota.viacao);

        if (empresa && porId("companyName")) {
            porId("companyName").textContent = empresa;
        }

        if (rota.preco !== undefined && porId("routePrice")) {
            porId("routePrice").textContent = formatarMoeda(rota.preco);
        }

        atualizarBotaoFavorito();
    }

    // =====================================================
    // FAVORITOS — API autenticada
    // =====================================================

    function normalizar(valor) {
        return texto(valor).toLocaleLowerCase("pt-BR");
    }

    function converterPreco(preco) {
        if (preco === null || preco === undefined || preco === "") {
            return null;
        }

        if (typeof preco === "number") {
            return Number.isFinite(preco) ? preco : null;
        }

        const valor = String(preco)
            .replace(/[^\d,.-]/g, "")
            .replace(/\.(?=\d{3}(?:\D|$))/g, "")
            .replace(",", ".");

        const numero = Number(valor);

        return Number.isFinite(numero) ? numero : null;
    }

    async function requisitarFavoritos(url, opcoes = {}) {
        const token = localStorage.getItem("guiaBusaoToken");

        if (!token) {
            throw new Error("Entre na sua conta para acessar os favoritos.");
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
                    : "Não foi possível concluir a operação de favoritos.")
            );
        }

        return dados;
    }

    function obterListaFavoritos(dados) {
        if (Array.isArray(dados)) return dados;
        if (Array.isArray(dados.favoritos)) return dados.favoritos;
        return [];
    }

    function mesmaViagem(favorito, rota) {
        if (
            normalizar(favorito.origem) !==
                normalizar(texto(rota.origem, rota.nomeLinha)) ||
            normalizar(favorito.destino) !== normalizar(rota.destino)
        ) {
            return false;
        }

        const dataRota = obterData(rota);
        const dataFavorito = favorito.data_viagem || favorito.data;

        if (
            dataRota &&
            dataFavorito &&
            String(dataRota).slice(0, 10) !==
                String(dataFavorito).slice(0, 10)
        ) {
            return false;
        }

        const horarioRota = obterHorario(rota);
        const horarioFavorito = favorito.horario || favorito.saida;

        if (
            horarioRota &&
            horarioFavorito &&
            String(horarioRota).slice(0, 5) !==
                String(horarioFavorito).slice(0, 5)
        ) {
            return false;
        }

        return true;
    }

    function atualizarBotoesFavorito(favoritada) {
        const adicionar = porId("addFavoriteRouteButton");
        const remover = porId("removeFavoriteRouteButton");

        if (adicionar) {
            adicionar.hidden = favoritada;
            adicionar.disabled = false;
            adicionar.setAttribute("aria-pressed", String(favoritada));
        }

        if (remover) {
            remover.hidden = !favoritada;
            remover.disabled = false;
            remover.setAttribute("aria-pressed", String(favoritada));
        }
    }

    async function atualizarBotaoFavorito() {
        const rota = obterRota();

        favoritoAtualId = null;
        atualizarBotoesFavorito(false);

        if (!rota.origem || !rota.destino) return;

        try {
            const dados = await requisitarFavoritos(API_FAVORITOS);
            const favoritos = obterListaFavoritos(dados);

            const favorito = favoritos.find(
                (item) => mesmaViagem(item, rota)
            );

            if (favorito && favorito.id != null) {
                favoritoAtualId = favorito.id;
                atualizarBotoesFavorito(true);
            }
        } catch (erro) {
            mostrarAviso(erro.message, true);
        }
    }

    async function adicionarFavorito() {
        const botao = porId("addFavoriteRouteButton");
        const rota = obterRota();

        if (!rota.origem || !rota.destino) {
            mostrarAviso(
                "Não foi possível identificar a origem e o destino.",
                true
            );
            return;
        }

        if (botao) {
            botao.disabled = true;
        }

        try {
            await requisitarFavoritos(API_FAVORITOS, {
                method: "POST",
                body: JSON.stringify({
                    rota_id: rota.id ?? rota.horarioId ?? null,
                    empresa: rota.empresa || rota.viacao || null,
                    origem: texto(rota.origem, rota.nomeLinha),
                    destino: texto(rota.destino),
                    data_viagem: obterData(rota) || null,
                    horario: obterHorario(rota) || null,
                    preco: converterPreco(rota.preco)
                })
            });

            mostrarAviso("Rota adicionada aos favoritos.");
            await atualizarBotaoFavorito();
        } catch (erro) {
            mostrarAviso(erro.message, true);
        } finally {
            if (botao) {
                botao.disabled = false;
            }
        }
    }

    async function removerFavorito() {
        const botao = porId("removeFavoriteRouteButton");

        if (favoritoAtualId === null || favoritoAtualId === undefined) {
            await atualizarBotaoFavorito();
        }

        if (favoritoAtualId === null || favoritoAtualId === undefined) {
            mostrarAviso(
                "Não foi possível identificar o favorito para remover.",
                true
            );
            return;
        }

        if (botao) {
            botao.disabled = true;
        }

        try {
            await requisitarFavoritos(
                `${API_FAVORITOS}/${encodeURIComponent(favoritoAtualId)}`,
                { method: "DELETE" }
            );

            favoritoAtualId = null;
            atualizarBotoesFavorito(false);
            mostrarAviso("Rota removida dos favoritos.");
        } catch (erro) {
            mostrarAviso(erro.message, true);

            if (botao) {
                botao.disabled = false;
            }
        }
    }

    // =====================================================
    // SALVAR ROTA — permanece independente dos favoritos
    // =====================================================

    async function salvarRota() {
        const botao = porId("saveRouteButton");
        const rota = obterRota();
        const data = obterData(rota);

        if (!rota.origem || !rota.destino) {
            mostrarAviso(
                "Não foi possível identificar a origem e o destino.",
                true
            );
            return;
        }

        if (!data) {
            mostrarAviso(
                "A data da viagem não foi encontrada. Volte à pesquisa, escolha a data e selecione a viagem novamente.",
                true
            );
            return;
        }

        const token = localStorage.getItem("guiaBusaoToken");

        if (!token) {
            mostrarAviso("Entre na sua conta para salvar rotas.", true);
            return;
        }

        const dados = {
            origem: texto(rota.origem, rota.nomeLinha),
            destino: texto(rota.destino),
            data_viagem: data,
            horario: obterHorario(rota) || null,
            preferencia: obterPesquisa().preferencia || "fastest"
        };

        if (dados.origem.toLowerCase() === dados.destino.toLowerCase()) {
            mostrarAviso(
                "A origem e o destino precisam ser diferentes.",
                true
            );
            return;
        }

        const textoOriginal = botao?.textContent;

        if (botao) {
            botao.disabled = true;
            botao.textContent = "Salvando...";
        }

        try {
            const resposta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (resposta.status === 401 || resposta.status === 403) {
                mostrarAviso(
                    "Sua sessão expirou. Entre novamente para salvar a rota.",
                    true
                );
                return;
            }

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    resultado.mensagem ||
                    "Não foi possível salvar a rota."
                );
            }

            mostrarAviso(resultado.mensagem || "Rota salva com sucesso!");
        } catch (erro) {
            mostrarAviso(
                erro.message || "Erro de conexão com a API.",
                true
            );
        } finally {
            if (botao) {
                botao.disabled = false;
                botao.textContent = textoOriginal || "☆ Salvar rota";
            }
        }
    }

    // =====================================================
    // VER MAPA
    // =====================================================

    function verMapa() {
        const rota = obterRota();

        if (!rota.origem || !rota.destino) {
            mostrarAviso(
                "Não foi possível identificar a origem e o destino.",
                true
            );
            return;
        }

        localStorage.setItem(
            CHAVE_ROTA,
            JSON.stringify({
                ...rota,
                origem: texto(rota.origem, rota.nomeLinha),
                destino: texto(rota.destino)
            })
        );

        const url = new URL("mapa.html", window.location.href);

        url.searchParams.set("origem", texto(rota.origem, rota.nomeLinha));
        url.searchParams.set("destino", texto(rota.destino));

        window.location.href = url.href;
    }

    // =====================================================
    // EVENTOS
    // =====================================================

    document.addEventListener("DOMContentLoaded", () => {
        atualizarDetalhes();

        porId("saveRouteButton")?.addEventListener("click", salvarRota);
        porId("addFavoriteRouteButton")?.addEventListener(
            "click",
            adicionarFavorito
        );
        porId("removeFavoriteRouteButton")?.addEventListener(
            "click",
            removerFavorito
        );
        porId("continueRouteButton")?.addEventListener("click", verMapa);
    });
})();