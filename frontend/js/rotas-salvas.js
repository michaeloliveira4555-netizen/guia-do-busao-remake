(() => {
    "use strict";

    const API_URL = "http://localhost:3000/api/rotas-salvas";
    const token = localStorage.getItem("guiaBusaoToken");

    const lista = document.getElementById("savedRoutesList");
    const contador = document.getElementById("savedRoutesCount");
    const estadoVazio = document.getElementById("emptySavedRoutes");

    if (!lista || !contador || !estadoVazio) return;

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    const preferencias = {
        fastest: "Mais rápido",
        cheapest: "Mais barato",
        "fewer-connections": "Menos conexões"
    };

    function escapar(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]);
    }

    function formatarData(data) {
        if (!data) return "Não informada";

        const parte = String(data).slice(0, 10);
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(parte);

        return match ? `${match[3]}/${match[2]}/${match[1]}` : parte;
    }

    function formatarHorario(horario) {
        if (!horario) return "Não informado";
        return String(horario).slice(0, 5);
    }

    async function requisicao(url = API_URL, opcoes = {}) {
        const resposta = await fetch(url, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(opcoes.headers || {})
            }
        });

        if (resposta.status === 401) {
            localStorage.removeItem("guiaBusaoToken");
            localStorage.removeItem("guiaBusaoUsuario");
            window.location.replace("login.html");
            throw new Error("Sua sessão expirou. Entre novamente.");
        }

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(dados.erro || dados.mensagem || "Não foi possível concluir a operação.");
        }

        return dados;
    }

    function mostrarMensagem(texto) {
        let aviso = document.getElementById("savedRoutesMessage");

        if (!aviso) {
            aviso = document.createElement("p");
            aviso.id = "savedRoutesMessage";
            aviso.setAttribute("role", "status");
            aviso.style.margin = "16px 0";
            lista.parentNode.insertBefore(aviso, lista);
        }

        aviso.textContent = texto;
    }

    function criarCartao(rota) {
        const cartao = document.createElement("article");
        cartao.className = "saved-route-card";

        const id = Number(rota.id);
        cartao.dataset.routeId = String(id);

        const origem = escapar(rota.origem);
        const destino = escapar(rota.destino);
        const data = escapar(formatarData(rota.data_viagem));
        const horario = escapar(formatarHorario(rota.horario));
        const preferencia = escapar(preferencias[rota.preferencia] || rota.preferencia);

        cartao.innerHTML = `
            <div class="saved-route-header">
                <div>
                    <span class="saved-route-label">Rota salva</span>
                    <h2>${origem} → ${destino}</h2>
                </div>
                <button type="button"
                    class="remove-route-button"
                    data-action="delete"
                    aria-label="Excluir rota ${origem} para ${destino}"
                    title="Excluir rota">🗑️</button>
            </div>

            <div class="saved-route-path">
                <div class="saved-route-location">
                    <span class="route-marker origin">●</span>
                    <div><small>ORIGEM</small><strong>${origem}</strong></div>
                </div>
                <div class="saved-route-arrow">→</div>
                <div class="saved-route-location">
                    <span class="route-marker destination">●</span>
                    <div><small>DESTINO</small><strong>${destino}</strong></div>
                </div>
            </div>

            <div class="saved-route-info">
                <div>
                    <span>📅</span>
                    <div><small>Data da viagem</small><strong>${data}</strong></div>
                </div>
                <div>
                    <span>🕐</span>
                    <div><small>Horário preferido</small><strong>${horario}</strong></div>
                </div>
                <div>
                    <span>🚌</span>
                    <div><small>Preferência</small><strong>${preferencia}</strong></div>
                </div>
            </div>

            <div class="saved-route-actions">
                <button type="button" class="search-button" data-action="search">
                    🔎 Procurar viagens
                </button>
                <button type="button" class="secondary-button edit-route-button"
                    data-action="edit">✎ Editar</button>
            </div>
        `;

        cartao.querySelector('[data-action="delete"]').addEventListener("click", () => excluirRota(rota));
        cartao.querySelector('[data-action="edit"]').addEventListener("click", () => editarRota(rota));
        cartao.querySelector('[data-action="search"]').addEventListener("click", () => pesquisarNovamente(rota));

        return cartao;
    }

    function atualizarLista(rotas) {
        lista.replaceChildren();

        contador.textContent = `${rotas.length} ${rotas.length === 1 ? "rota salva" : "rotas salvas"}`;
        estadoVazio.hidden = rotas.length > 0;
        lista.hidden = rotas.length === 0;

        rotas.forEach(rota => lista.appendChild(criarCartao(rota)));
    }

    async function carregarRotas() {
        lista.setAttribute("aria-busy", "true");
        mostrarMensagem("Carregando suas rotas...");

        try {
            const rotas = await requisicao();

            if (!Array.isArray(rotas)) {
                throw new Error("A API retornou uma resposta inesperada.");
            }

            atualizarLista(rotas);

            const aviso = document.getElementById("savedRoutesMessage");
            if (aviso) aviso.remove();
        } catch (erro) {
            mostrarMensagem(erro.message);
        } finally {
            lista.removeAttribute("aria-busy");
        }
    }

    async function excluirRota(rota) {
        if (!window.confirm(`Deseja excluir a rota ${rota.origem} → ${rota.destino}?`)) {
            return;
        }

        try {
            await requisicao(`${API_URL}/${rota.id}`, { method: "DELETE" });
            mostrarMensagem("Rota excluída com sucesso.");
            await carregarRotas();
        } catch (erro) {
            mostrarMensagem(erro.message);
        }
    }

    async function editarRota(rota) {
        const origem = window.prompt("Nova origem:", rota.origem);
        if (origem === null) return;

        const destino = window.prompt("Novo destino:", rota.destino);
        if (destino === null) return;

        const dataAtual = String(rota.data_viagem || "").slice(0, 10);
        const data = window.prompt("Data da viagem (AAAA-MM-DD):", dataAtual);
        if (data === null) return;

        const horarioAtual = String(rota.horario || "").slice(0, 5);
        const horario = window.prompt("Horário (HH:MM), ou deixe vazio:", horarioAtual);
        if (horario === null) return;

        const preferenciaAtual = rota.preferencia || "fastest";
        const preferencia = window.prompt(
            "Preferência: fastest, cheapest ou fewer-connections",
            preferenciaAtual
        );
        if (preferencia === null) return;

        const dados = {
            origem: origem.trim(),
            destino: destino.trim(),
            data_viagem: data.trim(),
            horario: horario.trim() || null,
            preferencia: preferencia.trim()
        };

        if (!dados.origem || !dados.destino) {
            mostrarMensagem("Preencha a origem e o destino.");
            return;
        }

        try {
            await requisicao(`${API_URL}/${rota.id}`, {
                method: "PUT",
                body: JSON.stringify(dados)
            });

            mostrarMensagem("Rota atualizada com sucesso.");
            await carregarRotas();
        } catch (erro) {
            mostrarMensagem(erro.message);
        }
    }

    function pesquisarNovamente(rota) {
        const pesquisa = {
            origem: rota.origem,
            destino: rota.destino,
            data: String(rota.data_viagem).slice(0, 10),
            horario: rota.horario ? String(rota.horario).slice(0, 5) : "",
            preferencia: rota.preferencia || "fastest"
        };

        localStorage.setItem("guiaBusaoPesquisa", JSON.stringify(pesquisa));
        localStorage.setItem("guiaBusaoPesquisaAtual", JSON.stringify(pesquisa));
        window.location.href = "resultado.html";
    }

    carregarRotas();
})();
