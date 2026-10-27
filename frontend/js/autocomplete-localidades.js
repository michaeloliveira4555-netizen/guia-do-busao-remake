/* =========================================================
   AUTOCOMPLETE DE CIDADES E BAIRROS
   Página: pesquisa.html
   Depende de: api.js
   ========================================================= */

(() => {
    "use strict";

    let rotas = [];

    const normalizar = texto =>
        String(texto ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

    const escapar = texto =>
        String(texto ?? "").replace(/[&<>"']/g, caractere => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caractere]);

    function obterLocalidades() {
        const cidades = new Map();
        const bairros = new Map();

        rotas.forEach(rota => {
            ["origem", "destino"].forEach(lado => {
                const ponto = rota?.[lado];

                if (ponto?.cidade) {
                    const chave = ponto.cidade.id ?? normalizar(ponto.cidade.nome);
                    cidades.set(chave, ponto.cidade);
                }

                if (ponto?.bairro) {
                    const chave = ponto.bairro.id ??
                        `${normalizar(ponto.bairro.nome)}-${normalizar(ponto.cidade?.nome)}`;

                    bairros.set(chave, {
                        ...ponto.bairro,
                        cidade: ponto.cidade
                    });
                }
            });
        });

        const localidades = [];

        cidades.forEach(cidade => {
            localidades.push({
                tipo: "cidade",
                id: cidade.id,
                nome: cidade.nome,
                estado: cidade.estado || "",
                cidade: cidade.nome
            });
        });

        bairros.forEach(bairro => {
            localidades.push({
                tipo: "bairro",
                id: bairro.id,
                nome: bairro.nome,
                estado: bairro.cidade?.estado || "",
                cidade: bairro.cidade?.nome || ""
            });
        });

        return localidades.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR")
        );
    }

    function configurarCampo(input, lista, tipo) {
        if (!input || !lista) {
            console.warn(`Autocomplete: campo ou lista ausente para ${tipo}.`);
            return;
        }

        function esconder() {
            lista.classList.remove("active");
        }

        function mostrar() {
            const termo = normalizar(input.value);
            let resultados = obterLocalidades();

            if (termo) {
                resultados = resultados.filter(local =>
                    normalizar(local.nome).includes(termo) ||
                    normalizar(local.cidade).includes(termo) ||
                    normalizar(local.estado).includes(termo)
                );
            }

            lista.replaceChildren();

            resultados.slice(0, 8).forEach(local => {
                const botao = document.createElement("button");
                botao.type = "button";
                botao.className = "suggestion-item";

                const detalhe = local.tipo === "cidade"
                    ? local.estado
                    : [local.cidade, local.estado].filter(Boolean).join(" - ");

                botao.innerHTML = `
                    <span class="suggestion-icon">📍</span>
                    <span class="suggestion-text">
                        <strong>${escapar(local.nome)}</strong>
                        <small>${escapar(detalhe || local.tipo)}</small>
                    </span>
                `;

                botao.addEventListener("click", () => {
                    input.value = local.nome;
                    input.dataset.localidadeId =
                        local.id == null ? "" : String(local.id);
                    input.dataset.localidadeTipo = local.tipo;
                    input.dataset.localidadeCampo = tipo;

                    esconder();
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                });

                lista.appendChild(botao);
            });

            if (resultados.length === 0) {
                const vazio = document.createElement("div");
                vazio.className = "suggestion-empty";
                vazio.textContent = "Nenhuma localidade encontrada";
                lista.appendChild(vazio);
            }

            lista.classList.add("active");
        }

        input.addEventListener("input", () => {
            delete input.dataset.localidadeId;
            delete input.dataset.localidadeTipo;
            delete input.dataset.localidadeCampo;
            mostrar();
        });

        input.addEventListener("focus", mostrar);

        document.addEventListener("click", evento => {
            if (
                !input.contains(evento.target) &&
                !lista.contains(evento.target)
            ) {
                esconder();
            }
        });

        input.addEventListener("keydown", evento => {
            if (evento.key === "Escape") esconder();
        });
    }

    async function inicializar() {
        if (!document.querySelector("#searchForm")) return;

        try {
            if (typeof listarRotas !== "function") {
                throw new Error("A função listarRotas() não está disponível. Confira api.js.");
            }

            const resultado = await listarRotas();

            if (!Array.isArray(resultado)) {
                throw new Error("A API não retornou uma lista válida de rotas.");
            }

            rotas = resultado;

            configurarCampo(
                document.querySelector("#searchOrigin"),
                document.querySelector("#searchOriginSuggestions"),
                "origem"
            );

            configurarCampo(
                document.querySelector("#searchDestination"),
                document.querySelector("#searchDestinationSuggestions"),
                "destino"
            );
        } catch (erro) {
            console.error("Erro ao carregar localidades:", erro);
        }
    }

    document.addEventListener("DOMContentLoaded", inicializar);
})();
