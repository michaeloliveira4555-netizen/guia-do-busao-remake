/* GUIA DO BUSÃO - MAPA INTERATIVO DA ROTA */
(() => {
    "use strict";

    const POSICAO_INICIAL = [-30.0346, -51.2177];
    const CHAVE_ROTA = "guiaBusaoRotaSelecionada";

    let mapa = null;
    let camadaRota = null;
    let marcadorOrigem = null;
    let marcadorDestino = null;
    let requisicaoAtual = 0;

    const porId = (id) => document.getElementById(id);

    function lerRotaSalva() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_ROTA) || "{}") || {};
        } catch (erro) {
            console.error("Não foi possível ler a rota salva:", erro);
            return {};
        }
    }

    function obterParametro(nome) {
        return new URLSearchParams(window.location.search).get(nome);
    }

    function atualizarTexto(id, valor) {
        const elemento = porId(id);

        if (elemento && valor !== undefined && valor !== null && valor !== "") {
            elemento.textContent = valor;
        }
    }

    function mostrarCarregamento(titulo, mensagem) {
        const elemento = porId("mapLoading");

        if (!elemento) return;

        elemento.style.display = "block";

        const tituloElemento = elemento.querySelector("h2");
        const mensagemElemento = elemento.querySelector("p");

        if (tituloElemento) tituloElemento.textContent = titulo;
        if (mensagemElemento) mensagemElemento.textContent = mensagem;
    }

    function ocultarCarregamento() {
        const elemento = porId("mapLoading");

        if (elemento) {
            elemento.style.display = "none";
        }
    }

    function mostrarErro(mensagem) {
        const elemento = porId("mapLoading");

        if (!elemento) {
            alert(mensagem);
            return;
        }

        elemento.style.display = "block";

        const titulo = elemento.querySelector("h2");
        const texto = elemento.querySelector("p");

        if (titulo) titulo.textContent = "Não foi possível traçar a rota";
        if (texto) texto.textContent = mensagem;
    }

    function obterCidades() {
        const rotaSalva = lerRotaSalva();

        const origem =
            obterParametro("origem") ||
            rotaSalva.origem ||
            "";

        const destino =
            obterParametro("destino") ||
            rotaSalva.destino ||
            "";

        return {
            origem: origem.trim(),
            destino: destino.trim()
        };
    }

    function inicializarMapa() {
        const elemento = porId("map");

        if (!elemento) return;

        if (typeof L === "undefined") {
            mostrarErro("A biblioteca do mapa não carregou. Verifique sua conexão e os scripts do Leaflet.");
            return;
        }

        mapa = L.map(elemento, {
            zoomControl: false
        }).setView(POSICAO_INICIAL, 7);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapa);

        configurarControles();

        setTimeout(() => {
            if (mapa) mapa.invalidateSize();
        }, 200);

        carregarRota();
        configurarBotaoSalvar();
    }

    function configurarControles() {
        const zoomIn = porId("zoomIn");
        const zoomOut = porId("zoomOut");
        const centralizar = porId("centerMap");

        if (zoomIn) {
            zoomIn.addEventListener("click", () => {
                mapa.zoomIn();
            });
        }

        if (zoomOut) {
            zoomOut.addEventListener("click", () => {
                mapa.zoomOut();
            });
        }

        if (centralizar) {
            centralizar.addEventListener("click", () => {
                if (camadaRota) {
                    mapa.fitBounds(camadaRota.getBounds(), {
                        padding: [35, 35]
                    });
                } else {
                    mapa.setView(POSICAO_INICIAL, 7);
                }
            });
        }
    }

    async function geocodificar(cidade) {
        const consulta = cidade.includes(",")
            ? cidade
            : `${cidade}, Brasil`;

        const url = new URL("https://nominatim.openstreetmap.org/search");

        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("limit", "5");
        url.searchParams.set("countrycodes", "br");
        url.searchParams.set("q", consulta);

        const resposta = await fetch(url.toString(), {
            headers: {
                Accept: "application/json"
            }
        });

        if (!resposta.ok) {
            throw new Error("O serviço de busca de cidades está indisponível.");
        }

        const resultados = await resposta.json();

        if (!resultados.length) {
            throw new Error(`Não encontramos a cidade "${cidade}". Informe o nome da cidade e, se necessário, o estado.`);
        }

        const resultado = resultados.find((item) =>
            ["city", "town", "municipality", "village"].includes(item.type)
        ) || resultados[0];

        return {
            latitude: Number(resultado.lat),
            longitude: Number(resultado.lon),
            nome: resultado.name || cidade
        };
    }

    async function calcularTrajeto(origem, destino) {
        const coordenadas =
            `${origem.longitude},${origem.latitude};` +
            `${destino.longitude},${destino.latitude}`;

        const url =
            "https://router.project-osrm.org/route/v1/driving/" +
            `${coordenadas}?overview=full&geometries=geojson&steps=true`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("O serviço de cálculo de trajetos está indisponível.");
        }

        const dados = await resposta.json();

        if (dados.code !== "Ok" || !dados.routes || !dados.routes.length) {
            throw new Error("Não foi encontrada uma rota rodoviária entre essas cidades.");
        }

        return dados.routes[0];
    }

    function formatarDistancia(metros) {
        const km = metros / 1000;

        if (km < 1) {
            return `${Math.round(metros)} m`;
        }

        return `${km.toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        })} km`;
    }

    function formatarDuracao(segundos) {
        const minutos = Math.round(segundos / 60);
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;

        if (horas === 0) {
            return `${minutosRestantes} min`;
        }

        if (minutosRestantes === 0) {
            return `${horas} h`;
        }

        return `${horas} h ${minutosRestantes} min`;
    }

    function atualizarResumo(origem, destino, rota) {
        atualizarTexto("mapRouteDescription", `${origem} → ${destino}`);
        atualizarTexto("mapOrigin", origem);
        atualizarTexto("mapDestination", destino);
        atualizarTexto("mapDuration", formatarDuracao(rota.duration));

        const partida = porId("mapDeparture");
        const chegada = porId("mapArrival");

        if (partida) partida.textContent = "Consulte os horários da viagem";
        if (chegada) chegada.textContent = "Estimativa de carro";

        atualizarTexto(
            "mapStopsList",
            ""
        );

        const lista = porId("mapStopsList");

        if (lista) {
            lista.replaceChildren();

            const item = document.createElement("li");
            item.textContent =
                `Trajeto rodoviário de aproximadamente ${formatarDistancia(rota.distance)}. ` +
                "Paradas de ônibus não estão disponíveis neste cálculo.";

            lista.appendChild(item);
        }
    }

    function desenharRota(origem, destino, rota) {
        if (camadaRota) {
            mapa.removeLayer(camadaRota);
        }

        if (marcadorOrigem) {
            mapa.removeLayer(marcadorOrigem);
        }

        if (marcadorDestino) {
            mapa.removeLayer(marcadorDestino);
        }

        camadaRota = L.geoJSON(rota.geometry, {
            style: {
                color: "#1769e0",
                weight: 6,
                opacity: 0.85
            }
        }).addTo(mapa);

        marcadorOrigem = L.marker([
            origem.latitude,
            origem.longitude
        ]).addTo(mapa).bindPopup(
            `<strong>Origem:</strong> ${escaparHTML(origem.nome)}`
        );

        marcadorDestino = L.marker([
            destino.latitude,
            destino.longitude
        ]).addTo(mapa).bindPopup(
            `<strong>Destino:</strong> ${escaparHTML(destino.nome)}`
        );

        mapa.fitBounds(camadaRota.getBounds(), {
            padding: [35, 35]
        });

        marcadorOrigem.openPopup();
    }

    function escaparHTML(valor) {
        return String(valor).replace(/[&<>"']/g, (caractere) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]);
    }

    async function carregarRota() {
        const identificador = ++requisicaoAtual;
        const cidades = obterCidades();

        if (!cidades.origem || !cidades.destino) {
            mostrarErro("Não recebemos a origem e o destino. Volte à página da rota e clique em ver mapa novamente.");
            return;
        }

        mostrarCarregamento(
            "Calculando rota...",
            `Buscando o trajeto entre ${cidades.origem} e ${cidades.destino}.`
        );

        atualizarTexto(
            "mapRouteDescription",
            `${cidades.origem} → ${cidades.destino}`
        );

        try {
            const origem = await geocodificar(cidades.origem);

            // Evita enviar duas consultas seguidas rapidamente ao serviço de busca.
            await new Promise((resolver) => setTimeout(resolver, 1100));

            const destino = await geocodificar(cidades.destino);

            if (identificador !== requisicaoAtual) return;

            const rota = await calcularTrajeto(origem, destino);

            if (identificador !== requisicaoAtual) return;

            desenharRota(origem, destino, rota);
            atualizarResumo(cidades.origem, cidades.destino, rota);
            ocultarCarregamento();
        } catch (erro) {
            console.error("Erro ao carregar o mapa da rota:", erro);

            if (identificador === requisicaoAtual) {
                mostrarErro(
                    erro.message ||
                    "Ocorreu um erro ao carregar o mapa. Tente novamente."
                );
            }
        }
    }

async function configurarBotaoSalvar() {
    const botao = porId("saveMapRoute");

    if (!botao) return;

    botao.addEventListener("click", async () => {
        const token = localStorage.getItem("guiaBusaoToken");

        if (!token) {
            alert("Entre na sua conta para salvar esta rota.");
            window.location.href = "login.html";
            return;
        }

        const rotaSalva = lerRotaSalva();
        const pesquisa = (() => {
            try {
                return JSON.parse(
                    localStorage.getItem("guiaBusaoPesquisa") || "{}"
                );
            } catch {
                return {};
            }
        })();

        const origem =
            obterParametro("origem") ||
            rotaSalva.origem ||
            "";

        const destino =
            obterParametro("destino") ||
            rotaSalva.destino ||
            "";

        if (!origem.trim() || !destino.trim()) {
            alert("Não foi possível identificar a origem e o destino.");
            return;
        }

        const dataPadrao =
            rotaSalva.data_viagem ||
            pesquisa.data ||
            "";

        const data = window.prompt(
            "Data da viagem (AAAA-MM-DD):",
            String(dataPadrao).slice(0, 10)
        );

        if (data === null) return;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(data.trim())) {
            alert("Informe a data no formato AAAA-MM-DD.");
            return;
        }

        const horario = window.prompt(
            "Horário da viagem (HH:MM), ou deixe vazio:",
            rotaSalva.horario || pesquisa.horario || ""
        );

        if (horario === null) return;

        if (horario.trim() && !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario.trim())) {
            alert("Informe o horário no formato HH:MM.");
            return;
        }

        const preferenciasValidas = [
            "fastest",
            "cheapest",
            "fewer-connections"
        ];

        let preferencia =
            rotaSalva.preferencia ||
            pesquisa.preferencia ||
            "fastest";

        if (!preferenciasValidas.includes(preferencia)) {
            preferencia = "fastest";
        }

        const dados = {
            origem: origem.trim(),
            destino: destino.trim(),
            data_viagem: data.trim(),
            horario: horario.trim() || null,
            preferencia
        };

        const textoOriginal = botao.textContent;
        botao.disabled = true;
        botao.textContent = "Salvando...";

        try {
            const resposta = await fetch(
                "http://localhost:3000/api/rotas-salvas",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dados)
                }
            );

            const resultado = await resposta.json().catch(() => ({}));

            if (resposta.status === 401) {
                localStorage.removeItem("guiaBusaoToken");
                alert("Sua sessão expirou. Entre novamente.");
                window.location.href = "login.html";
                return;
            }

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ||
                    resultado.mensagem ||
                    "Não foi possível salvar a rota."
                );
            }

            botao.textContent = "✓ Rota salva!";
            alert("Rota salva com sucesso! Ela estará disponível em Rotas Salvas.");

        } catch (erro) {
            console.error("Erro ao salvar rota:", erro);

            alert(
                "Não foi possível salvar a rota. " +
                "Verifique se o backend está funcionando e tente novamente.\n\n" +
                erro.message
            );
        } finally {
            botao.disabled = false;

            if (botao.textContent === "Salvando...") {
                botao.textContent = textoOriginal;
            }
        }
    });
}


    document.addEventListener("DOMContentLoaded", inicializarMapa);
})();
