
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

    function primeiroValor(...valores) {
        return valores.find(
            (valor) => valor !== undefined &&
                valor !== null &&
                String(valor).trim() !== ""
        );
    }

    function definirTexto(id, valor, padrao = "Não informado") {
        const elemento = porId(id);

        if (elemento) {
            elemento.textContent = texto(valor, padrao);
        }
    }

    function definirVisibilidade(id, visivel) {
        const elemento = porId(id);

        if (elemento) {
            elemento.hidden = !visivel;
        }
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
        const rota = lerJSON(CHAVE_ROTA, {});
        return rota && typeof rota === "object" ? rota : {};
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

        const valor = primeiroValor(
            rota.data_viagem,
            rota.data,
            pesquisa.data_viagem,
            pesquisa.data
        );

        if (!valor) return "";

        const data = String(valor).slice(0, 10);

        return /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : "";
    }

    function normalizarHorario(valor) {
        if (valor === undefined || valor === null || valor === "") {
            return "";
        }

        const horario = String(valor).trim().slice(0, 5);

        return /^([01]\d|2[0-3]):[0-5]\d$/.test(horario)
            ? horario
            : "";
    }

    function obterHorario(rota) {
        const pesquisa = obterPesquisa();

        return normalizarHorario(
            primeiroValor(
                rota.saida,
                rota.horario,
                rota.hora_partida,
                rota.horario_partida,
                pesquisa.horario
            )
        );
    }

    function formatarMoeda(valor) {
        if (valor === null || valor === undefined || valor === "") {
            return "Não informado";
        }

        if (typeof valor === "string" && valor.includes("R$")) {
            return valor;
        }

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return String(valor);
        }

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarDuracao(minutos) {
        if (!Number.isFinite(minutos) || minutos < 0) {
            return "";
        }

        const horas = Math.floor(minutos / 60);
        const resto = minutos % 60;

        if (horas && resto) return `${horas}h ${resto}min`;
        if (horas) return `${horas}h`;

        return `${resto}min`;
    }

    function calcularDuracao(saida, chegada) {
        if (!saida || !chegada) return "";

        const [horaSaida, minutoSaida] = saida.split(":").map(Number);
        const [horaChegada, minutoChegada] = chegada.split(":").map(Number);

        let inicio = horaSaida * 60 + minutoSaida;
        let fim = horaChegada * 60 + minutoChegada;

        // Se a chegada for antes da saída no relógio,
        // considera uma viagem que termina no dia seguinte.
        if (fim < inicio) {
            fim += 24 * 60;
        }

        return formatarDuracao(fim - inicio);
    }

    function obterDuracao(rota, saida, chegada) {
        const duracaoInformada = primeiroValor(
            rota.duracao,
            rota.duração,
            rota.duracao_total,
            rota.tempo_viagem
        );

        if (duracaoInformada !== undefined) {
            if (typeof duracaoInformada === "number") {
                return formatarDuracao(duracaoInformada);
            }

            return texto(duracaoInformada);
        }

        return calcularDuracao(saida, chegada);
    }

    function obterOrigem(rota) {
        return texto(
            primeiroValor(rota.origem, rota.nomeOrigem),
            "Origem não informada"
        );
    }

    function obterDestino(rota) {
        return texto(
            primeiroValor(rota.destino, rota.nomeDestino),
            "Destino não informado"
        );
    }

    function obterEmpresa(rota) {
        return texto(
            primeiroValor(rota.empresa, rota.viacao, rota.nomeEmpresa),
            "Empresa não informada"
        );
    }

    function obterConexoes(rota) {
        const valor = primeiroValor(
            rota.conexoes,
            rota.conexões,
            rota.quantidadeConexoes,
            rota.quantidade_conexoes
        );

        if (Array.isArray(valor)) {
            return {
                quantidade: valor.length,
                itens: valor
            };
        }

        if (typeof valor === "number" && Number.isFinite(valor)) {
            return {
                quantidade: Math.max(0, valor),
                itens: []
            };
        }

        return {
            quantidade: null,
            itens: []
        };
    }

    function obterParadas(rota) {
        const paradas = primeiroValor(
            rota.paradas,
            rota.pontosParada,
            rota.pontos_parada
        );

        return Array.isArray(paradas) ? paradas : null;
    }

    function nomeLocal(valor) {
        if (typeof valor === "string") {
            return valor.trim();
        }

        if (valor && typeof valor === "object") {
            return texto(
                primeiroValor(
                    valor.nome,
                    valor.local,
                    valor.cidade,
                    valor.endereco,
                    valor.endereço
                )
            );
        }

        return "";
    }

    function atualizarParadas(rota, origem, destino) {
        const lista = porId("stopsList");

        if (!lista) return;

        const paradas = obterParadas(rota);
        lista.replaceChildren();

        if (!paradas || paradas.length === 0) {
            const aviso = document.createElement("p");
            aviso.textContent =
                "Informações sobre as paradas não disponíveis.";
            lista.appendChild(aviso);
            return;
        }

        paradas.forEach((parada, indice) => {
            const nome = nomeLocal(parada);

            if (!nome) return;

            const detalhe =
                parada && typeof parada === "object"
                    ? texto(
                        primeiroValor(
                            parada.terminal,
                            parada.local,
                            parada.endereco,
                            parada.endereço
                        )
                    )
                    : "";

            const item = document.createElement("div");
            item.className = "stop";

            const numero = document.createElement("span");
            numero.className = "stop-number";
            numero.textContent = String(indice + 1);

            const conteudo = document.createElement("div");
            const titulo = document.createElement("strong");
            titulo.textContent = nome;
            conteudo.appendChild(titulo);

            if (detalhe && detalhe !== nome) {
                const subtitulo = document.createElement("small");
                subtitulo.textContent = detalhe;
                conteudo.appendChild(subtitulo);
            }

            item.append(numero, conteudo);
            lista.appendChild(item);
        });

        if (!lista.children.length) {
            const aviso = document.createElement("p");
            aviso.textContent =
                "Informações sobre as paradas não disponíveis.";
            lista.appendChild(aviso);
        }
    }

    function atualizarConexao(rota) {
        const bloco = porId("connectionStep");
        const conexoes = obterConexoes(rota);

        const itens = conexoes.itens;
        const conexao = itens.length ? itens[0] : null;

        // Não presume que existe conexão se os dados não informarem isso.
        const existeConexao =
            conexao !== null ||
            (conexoes.quantidade !== null && conexoes.quantidade > 0);

        if (bloco) {
            bloco.hidden = !existeConexao;
        }

        if (!existeConexao) {
            definirTexto("routeConnections", "Não informado");
            return;
        }

        if (conexoes.quantidade !== null) {
            const quantidade = conexoes.quantidade;
            definirTexto(
                "routeConnections",
                quantidade === 1
                    ? "1 conexão"
                    : `${quantidade} conexões`
            );
        }

        if (conexao && typeof conexao === "object") {
            definirTexto(
                "connectionTitle",
                primeiroValor(conexao.titulo, conexao.nome),
                "Conexão"
            );

            definirTexto(
                "connectionDescription",
                primeiroValor(conexao.descricao, conexao.descrição, conexao.local),
                "Detalhes da conexão não informados"
            );

            definirTexto(
                "connectionWaitingTime",
                primeiroValor(
                    conexao.tempo_espera,
                    conexao.tempoEspera,
                    conexao.espera
                ),
                ""
            );
        } else {
            definirTexto("connectionTitle", "Conexão");
            definirTexto(
                "connectionDescription",
                "Há conexão informada para esta viagem."
            );
            definirTexto("connectionWaitingTime", "");
        }
    }

    function atualizarTrajeto(rota) {
        const origem = obterOrigem(rota);
        const destino = obterDestino(rota);
        const empresa = obterEmpresa(rota);

        const saida = obterHorario(rota);
        const chegada = normalizarHorario(
            primeiroValor(rota.chegada, rota.hora_chegada)
        );

        const duracao = obterDuracao(rota, saida, chegada);

        // Resumo da viagem
        definirTexto("routeOrigin", origem);
        definirTexto("routeDestination", destino);
        definirTexto(
            "departureLocation",
            rota.local_saida,
            "Local de embarque não informado"
        );
        definirTexto(
            "arrivalLocation",
            rota.local_chegada,
            "Local de chegada não informado"
        );

        definirTexto("departureTime", saida, "--:--");
        definirTexto("arrivalTime", chegada, "--:--");

        definirTexto("routeDuration", duracao, "Duração indisponível");
        definirTexto("totalDuration", duracao, "Duração indisponível");
        definirTexto("companyName", empresa);
        definirTexto("busType", rota.tipo, "Tipo de ônibus não informado");

        definirTexto("routePrice", formatarMoeda(rota.preco));

        // Trecho de saída
        definirTexto("stepOrigin", origem);
        definirTexto("stepDepartureTime", saida, "--:--");
        definirTexto(
            "stepDepartureLocation",
            rota.local_saida,
            "Local de embarque não informado"
        );
        definirTexto("stepDepartureCompany", empresa);

        // Trecho de chegada: permanece visível, mas sem inventar dados.
        definirVisibilidade("arrivalStep", true);
        definirTexto("stepDestination", destino);
        definirTexto("stepArrivalTime", chegada, "--:--");
        definirTexto(
            "stepArrivalLocation",
            rota.local_chegada,
            "Local de chegada não informado"
        );
        definirTexto("stepArrivalCompany", empresa);

        atualizarConexao(rota);
        atualizarParadas(rota, origem, destino);
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

        atualizarTrajeto(rota);
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
            normalizar(favorito.origem) !== normalizar(obterOrigem(rota)) ||
            normalizar(favorito.destino) !== normalizar(obterDestino(rota))
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

        if (botao) botao.disabled = true;

        try {
            await requisitarFavoritos(API_FAVORITOS, {
                method: "POST",
                body: JSON.stringify({
                    rota_id: rota.id ?? rota.horarioId ?? null,
                    empresa: rota.empresa || rota.viacao || null,
                    origem: obterOrigem(rota),
                    destino: obterDestino(rota),
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
            if (botao) botao.disabled = false;
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

        if (botao) botao.disabled = true;

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

            if (botao) botao.disabled = false;
        }
    }

    // =====================================================
    // SALVAR ROTA
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
            origem: obterOrigem(rota),
            destino: obterDestino(rota),
            data_viagem: data,
            horario: obterHorario(rota) || null,
            preferencia: obterPesquisa().preferencia || "fastest"
        };

        if (normalizar(dados.origem) === normalizar(dados.destino)) {
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
                origem: obterOrigem(rota),
                destino: obterDestino(rota)
            })
        );

        const url = new URL("mapa.html", window.location.href);

        url.searchParams.set("origem", obterOrigem(rota));
        url.searchParams.set("destino", obterDestino(rota));

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
