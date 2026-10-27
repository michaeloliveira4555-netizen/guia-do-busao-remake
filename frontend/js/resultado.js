
document.addEventListener("DOMContentLoaded", inicializarResultados);

async function inicializarResultados() {
    const container = document.getElementById("resultsList");
    const semResultados = document.getElementById("noResults");
    const contador = document.getElementById("resultCount");
    const resumo = document.getElementById("searchSummary");
    const pesquisa = lerLocalStorage("guiaBusaoPesquisaAtual")
        || lerLocalStorage("guiaBusaoPesquisa");
    const rotas = lerLocalStorage("guiaBusaoRotasEncontradas");

    if (!container) return;

    // Remove o cartão fictício que está no HTML.
    container.innerHTML = "";

    if (pesquisa) {
        definirTexto("resultOrigin", pesquisa.origem);
        definirTexto("resultDestination", pesquisa.destino);
        definirTexto("resultDate", formatarData(pesquisa.data));

        if (resumo) {
            resumo.textContent =
                `${pesquisa.origem} → ${pesquisa.destino}`;
        }
    }

    if (!Array.isArray(rotas) || rotas.length === 0) {
        mostrarSemResultados(container, semResultados);
        definirTexto("resultCount", "0 opções");
        return;
    }

    container.innerHTML = "<p>Buscando horários disponíveis...</p>";

    const resultados = [];

    for (const rota of rotas) {
        if (!rota || rota.id == null) continue;

        try {
            const horarios = await buscarHorariosDaLinha(rota.id);

            if (Array.isArray(horarios) && horarios.length > 0) {
                horarios.forEach(horario => {
                    resultados.push({ rota, horario });
                });
            } else {
                // A rota existe, mas a API não retornou horários.
                resultados.push({ rota, horario: null });
            }
        } catch (erro) {
            console.error(`Erro nos horários da rota ${rota.id}:`, erro);
            resultados.push({ rota, horario: null });
        }
    }

    container.innerHTML = "";

    if (resultados.length === 0) {
        mostrarSemResultados(container, semResultados);
        definirTexto("resultCount", "0 opções");
        return;
    }

    if (semResultados) semResultados.hidden = true;

    resultados.forEach(({ rota, horario }) => {
        container.appendChild(criarCartao(rota, horario));
    });

    definirTexto(
        "resultCount",
        `${resultados.length} ${resultados.length === 1 ? "opção" : "opções"}`
    );

    inicializarOrdenacao();
}

function lerLocalStorage(chave) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : null;
    } catch (erro) {
        console.error(`Erro ao ler ${chave}:`, erro);
        return null;
    }
}

function definirTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor || "--";
}

function nomeLocal(local) {
    if (!local) return "Local não informado";

    if (typeof local === "string") return local;

    return local.cidade?.nome
        || local.nome
        || "Local não informado";
}

function formatarData(data) {
    if (!data) return "--";

    const dataObj = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dataObj.getTime())) return data;

    return dataObj.toLocaleDateString("pt-BR");
}

function formatarHora(valor) {
    if (!valor) return "--:--";

    // A API pode retornar uma hora ou um timestamp.
    const texto = String(valor);

    if (/^\d{2}:\d{2}/.test(texto)) {
        return texto.slice(0, 5);
    }

    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) return texto;

    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatarPreco(valor) {
    if (valor == null || valor === "") return "Não informado";

    const numero = Number(valor);

    if (!Number.isFinite(numero)) return "Não informado";

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criarCartao(rota, horario) {
    const cartao = document.createElement("article");
    cartao.className = "trip-card";

    const origem = nomeLocal(rota.origem);
    const destino = nomeLocal(rota.destino);
    const saida = horario ? formatarHora(horario.hora_partida) : "--:--";
    const chegada = horario ? formatarHora(horario.hora_chegada) : "--:--";
    const preco = horario ? formatarPreco(horario.preco) : "Indisponível";
    const viacao = horario?.viacao || "Viação não informada";

    cartao.innerHTML = `
        <div class="trip-main">
            <div class="trip-time">
                <strong>${saida}</strong>
                <span>${escaparHTML(origem)}</span>
            </div>

            <div class="trip-duration">
                <span>────────</span>
                <small>Horário da viagem</small>
                <span>────────</span>
            </div>

            <div class="trip-time">
                <strong>${chegada}</strong>
                <span>${escaparHTML(destino)}</span>
            </div>
        </div>

        <div class="trip-info">
            <div class="company">
                <div class="company-logo">🚌</div>
                <div>
                    <strong>${escaparHTML(viacao)}</strong>
                    <span>Rota cadastrada</span>
                </div>
            </div>

            <div class="trip-price">
                <small>Tarifa</small>
                <strong>${preco}</strong>
                <button type="button" class="trip-button">
                    Ver rota
                </button>
            </div>
        </div>
    `;

    cartao.querySelector(".trip-button").addEventListener("click", () => {
        const viagem = {
            id: rota.id,
            linha: rota.id,
            nomeLinha: `${origem} - ${destino}`,
            origem,
            destino,
            saida,
            chegada,
            preco: horario?.preco ?? null,
            viacao: horario?.viacao ?? null,
            horarioId: horario?.id ?? null
        };

        localStorage.setItem(
            "guiaBusaoRotaSelecionada",
            JSON.stringify(viagem)
        );

        window.location.href = "rota.html";
    });

    return cartao;
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function mostrarSemResultados(container, secao) {
    container.innerHTML = "";

    if (secao) {
        secao.hidden = false;
    } else {
        container.textContent = "Nenhuma rota encontrada para esta pesquisa.";
    }
}

function inicializarOrdenacao() {
    const seletor = document.getElementById("sortResults");
    const container = document.getElementById("resultsList");

    if (!seletor || !container) return;

    seletor.addEventListener("change", () => {
        const cartoes = [...container.querySelectorAll(".trip-card")];

        cartoes.sort((a, b) => {
            if (seletor.value === "earliest") {
                return obterMinutos(a) - obterMinutos(b);
            }

            if (seletor.value === "cheapest") {
                return obterPreco(a) - obterPreco(b);
            }

            return 0;
        });

        cartoes.forEach(cartao => container.appendChild(cartao));
    });
}

function obterMinutos(cartao) {
    const texto = cartao.querySelector(".trip-time strong")?.textContent || "";
    const partes = texto.split(":").map(Number);

    return partes.length === 2 && partes.every(Number.isFinite)
        ? partes[0] * 60 + partes[1]
        : Infinity;
}

function obterPreco(cartao) {
    const texto = cartao.querySelector(".trip-price strong")?.textContent || "";
    const numero = Number(
        texto.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
    );

    return Number.isFinite(numero) ? numero : Infinity;
}
