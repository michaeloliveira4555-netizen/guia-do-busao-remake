
/* =========================================================
   GUIA DO BUSÃO — PERFIL
   ========================================================= */

const API_PERFIL_URL = "http://localhost:3000/api/usuarios/perfil";

document.addEventListener("DOMContentLoaded", () => {
    carregarPerfil();
    inicializarFormularioPerfil();
    inicializarBotaoEditar();
    inicializarBotaoSair();
});

/* =========================================================
   USUÁRIO
   ========================================================= */

function obterUsuarioPerfil() {
    try {
        const dados = localStorage.getItem("guiaBusaoUsuario");
        return dados ? JSON.parse(dados) : null;
    } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
        return null;
    }
}

/* =========================================================
   CARREGAR PERFIL
   ========================================================= */

function carregarPerfil() {
    const usuario = obterUsuarioPerfil();

    if (!usuario) {
        console.warn("Nenhum usuário encontrado.");
        return;
    }

    const nome = usuario.nome || "Usuário";
    const email = usuario.email || "E-mail não informado";
    const telefone = usuario.telefone || "Não informado";

    preencher("#profileName", nome);
    preencher("#profileFullName", nome);
    preencher("#profileEmail", email);
    preencher("#profileUserEmail", email);
    preencher("#profilePhone", telefone);

    preencher("[data-perfil-nome]", nome);
    preencher("[data-perfil-email]", email);
    preencher("[data-perfil-telefone]", telefone);

    preencherInput('[name="nome"]', nome);
    preencherInput('[name="email"]', email);
    preencherInput('[name="telefone"]', usuario.telefone || "");
}

/* =========================================================
   BOTÃO EDITAR
   ========================================================= */

function inicializarBotaoEditar() {
    const botao = document.getElementById("editProfileButton");

    if (!botao) return;

    botao.addEventListener("click", () => {
        const usuario = obterUsuarioPerfil();

        if (!usuario) {
            mostrarMensagemPerfil(
                "Não foi possível carregar os dados da conta.",
                "error"
            );
            return;
        }

        let formulario = document.querySelector(
            "[data-formulario-perfil]"
        );

        if (formulario) {
            formulario.hidden = false;
            formulario.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            return;
        }

        formulario = document.createElement("form");
        formulario.dataset.formularioPerfil = "";
        formulario.className = "profile-section";

        formulario.innerHTML = `
            <div class="section-heading">
                <span class="hero-tag">✏️ Editar informações</span>
                <h2>Atualizar perfil</h2>
            </div>

            <div class="profile-data-grid">
                <div class="profile-data-item">
                    <label for="editProfileName">
                        Nome completo
                    </label>
                    <input
                        id="editProfileName"
                        name="nome"
                        type="text"
                        maxlength="120"
                        autocomplete="name"
                        required
                    >
                </div>

                <div class="profile-data-item">
                    <label for="editProfileEmail">
                        E-mail (não editável)
                    </label>
                    <input
                        id="editProfileEmail"
                        name="email"
                        type="email"
                        readonly
                        aria-readonly="true"
                        autocomplete="email"
                    >
                </div>

                <div class="profile-data-item">
                    <label for="editProfilePhone">
                        Telefone
                    </label>
                    <input
                        id="editProfilePhone"
                        name="telefone"
                        type="tel"
                        maxlength="30"
                        autocomplete="tel"
                    >
                </div>
            </div>

            <div class="profile-edit-actions">
                <button type="submit" class="primary-button">
                    Salvar alterações
                </button>

                <button
                    type="button"
                    class="secondary-button"
                    data-cancelar-edicao
                >
                    Cancelar
                </button>
            </div>
        `;

        const cartao = botao.closest(".profile-card");

        if (!cartao) {
            console.error("Não foi encontrado o cartão do perfil.");
            return;
        }

        cartao.insertAdjacentElement("afterend", formulario);

        formulario.querySelector('[name="nome"]').value =
            usuario.nome || "";

        formulario.querySelector('[name="email"]').value =
            usuario.email || "";

        formulario.querySelector('[name="telefone"]').value =
            usuario.telefone || "";

        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();
            salvarAlteracoesPerfil(formulario);
        });

        formulario.querySelector("[data-cancelar-edicao]")
            .addEventListener("click", () => {
                formulario.remove();
            });

        formulario.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        formulario.querySelector('[name="nome"]').focus();
    });
}

/* =========================================================
   FORMULÁRIO EXISTENTE NA PÁGINA
   ========================================================= */

function inicializarFormularioPerfil() {
    const formulario = document.querySelector(
        "[data-formulario-perfil]"
    );

    if (!formulario) return;

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        salvarAlteracoesPerfil(formulario);
    });
}

/* =========================================================
   SALVAR PERFIL NO BACKEND E NO POSTGRESQL
   ========================================================= */

async function salvarAlteracoesPerfil(formulario) {
    const usuario = obterUsuarioPerfil();
    const token = localStorage.getItem("guiaBusaoToken");

    if (!usuario) {
        mostrarMensagemPerfil(
            "Não foi possível encontrar os dados da conta.",
            "error"
        );
        return;
    }

    if (!token) {
        mostrarMensagemPerfil(
            "Sua sessão expirou. Entre novamente.",
            "error"
        );
        return;
    }

    const dados = new FormData(formulario);
    const nome = String(dados.get("nome") ?? "").trim();
    const telefone = String(dados.get("telefone") ?? "").trim();

    if (!nome) {
        mostrarMensagemPerfil(
            "Preencha o nome completo.",
            "error"
        );
        return;
    }

    if (nome.length > 120 || telefone.length > 30) {
        mostrarMensagemPerfil(
            "Nome ou telefone excede o limite permitido.",
            "error"
        );
        return;
    }

    const botaoSalvar = formulario.querySelector(
        'button[type="submit"]'
    );

    if (botaoSalvar) {
        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Salvando...";
    }

    try {
        const resposta = await fetch(API_PERFIL_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nome,
                telefone
            })
        });

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            if (resposta.status === 401) {
                throw new Error(
                    "Sua sessão expirou ou o token é inválido. Entre novamente."
                );
            }

            throw new Error(
                resultado.mensagem ||
                `Não foi possível salvar o perfil (HTTP ${resposta.status}).`
            );
        }

        const usuarioRetornado = resultado.usuario;

        if (!usuarioRetornado) {
            throw new Error(
                "A API não retornou os dados atualizados do usuário."
            );
        }

        const usuarioAtualizado = {
            ...usuario,
            ...usuarioRetornado,
            nome: usuarioRetornado.nome ?? nome,
            email: usuarioRetornado.email ?? usuario.email,
            telefone: usuarioRetornado.telefone ?? telefone
        };

        localStorage.setItem(
            "guiaBusaoUsuario",
            JSON.stringify(usuarioAtualizado)
        );

        carregarPerfil();
        formulario.remove();

        mostrarMensagemPerfil(
            "Perfil atualizado e salvo com sucesso!",
            "success"
        );
    } catch (erro) {
        console.error("Erro ao salvar perfil:", erro);

        mostrarMensagemPerfil(
            erro.message ||
            "Não foi possível salvar o perfil. Verifique sua conexão."
        );
    } finally {
        if (botaoSalvar && botaoSalvar.isConnected) {
            botaoSalvar.disabled = false;
            botaoSalvar.textContent = "Salvar alterações";
        }
    }
}

/* =========================================================
   BOTÃO SAIR
   ========================================================= */

function inicializarBotaoSair() {
    const botoes = document.querySelectorAll(
        "#logoutButton, [data-sair-conta]"
    );

    botoes.forEach((botao) => {
        botao.addEventListener("click", (evento) => {
            evento.preventDefault();
            sairDaConta();
        });
    });
}

function sairDaConta() {
    if (!window.confirm("Deseja realmente sair da sua conta?")) {
        return;
    }

    localStorage.removeItem("guiaBusaoUsuario");
    localStorage.removeItem("guiaBusaoToken");

    window.location.href = "login.html";
}

/* =========================================================
   AUXILIARES
   ========================================================= */

function preencher(seletor, valor) {
    document.querySelectorAll(seletor).forEach((elemento) => {
        elemento.textContent = valor || "-";
    });
}

function preencherInput(seletor, valor) {
    const elemento = document.querySelector(seletor);

    if (elemento) {
        elemento.value = valor || "";
    }
}

function mostrarMensagemPerfil(mensagem, tipo = "info") {
    if (
        window.GuiaBusao &&
        typeof window.GuiaBusao.mostrarMensagem === "function"
    ) {
        window.GuiaBusao.mostrarMensagem(mensagem, tipo);
        return;
    }

    window.alert(mensagem);
}

/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.PerfilGuiaBusao = {
    obterUsuarioPerfil,
    carregarPerfil,
    sairDaConta,
    salvarAlteracoesPerfil
};
