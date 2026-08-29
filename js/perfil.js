/* =========================================================
   GUIA DO BUSÃO
   JAVASCRIPT DO PERFIL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarPerfil();
});


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializarPerfil() {

    carregarPerfil();

    inicializarFormularioPerfil();

    inicializarBotaoSair();

}


/* =========================================================
   CARREGAR PERFIL
   ========================================================= */

function carregarPerfil() {

    const usuario =
        obterUsuarioPerfil();

    if (!usuario) {
        return;
    }


    preencher(
        "[data-perfil-nome]",
        usuario.nome
    );

    preencher(
        "[data-perfil-email]",
        usuario.email
    );

    preencher(
        "[data-perfil-telefone]",
        usuario.telefone
    );


    preencherInput(
        "[name='nome']",
        usuario.nome
    );

    preencherInput(
        "[name='email']",
        usuario.email
    );

    preencherInput(
        "[name='telefone']",
        usuario.telefone
    );

}


/* =========================================================
   OBTER USUÁRIO
   ========================================================= */

function obterUsuarioPerfil() {

    const dados =
        localStorage.getItem(
            "guiaBusaoUsuario"
        );

    if (!dados) {
        return null;
    }


    try {

        return JSON.parse(dados);

    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        return null;
    }

}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

function inicializarFormularioPerfil() {

    const formulario =
        document.querySelector(
            "[data-formulario-perfil]"
        );

    if (!formulario) {
        return;
    }


    formulario.addEventListener(
        "submit",
        (evento) => {

            evento.preventDefault();

            salvarAlteracoesPerfil(
                formulario
            );

        }
    );

}


/* =========================================================
   SALVAR ALTERAÇÕES
   ========================================================= */

function salvarAlteracoesPerfil(
    formulario
) {

    const usuario =
        obterUsuarioPerfil() || {};


    const dadosFormulario =
        new FormData(formulario);


    const nome =
        dadosFormulario.get("nome");

    const email =
        dadosFormulario.get("email");

    const telefone =
        dadosFormulario.get("telefone");


    const usuarioAtualizado = {

        ...usuario,

        nome:
            nome?.trim() || "",

        email:
            email?.trim() || "",

        telefone:
            telefone?.trim() || ""

    };


    localStorage.setItem(
        "guiaBusaoUsuario",
        JSON.stringify(
            usuarioAtualizado
        )
    );


    preencher(
        "[data-perfil-nome]",
        usuarioAtualizado.nome
    );

    preencher(
        "[data-perfil-email]",
        usuarioAtualizado.email
    );

    preencher(
        "[data-perfil-telefone]",
        usuarioAtualizado.telefone
    );


    mostrarMensagemPerfil(
        "Perfil atualizado com sucesso!",
        "success"
    );

}


/* =========================================================
   BOTÃO SAIR
   ========================================================= */

function inicializarBotaoSair() {

    const botoes =
        document.querySelectorAll(
            "[data-sair-conta]"
        );


    botoes.forEach(
        (botao) => {

            botao.addEventListener(
                "click",
                () => {

                    sairDaConta();

                }
            );

        }
    );

}


/* =========================================================
   SAIR DA CONTA
   ========================================================= */

function sairDaConta() {

    const confirmar =
        window.confirm(
            "Deseja realmente sair da sua conta?"
        );


    if (!confirmar) {
        return;
    }


    localStorage.removeItem(
        "guiaBusaoUsuario"
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   PREENCHER TEXTO
   ========================================================= */

function preencher(
    seletor,
    valor
) {

    const elementos =
        document.querySelectorAll(
            seletor
        );


    elementos.forEach(
        (elemento) => {

            elemento.textContent =
                valor || "-";

        }
    );

}


/* =========================================================
   PREENCHER INPUT
   ========================================================= */

function preencherInput(
    seletor,
    valor
) {

    const elemento =
        document.querySelector(
            seletor
        );


    if (!elemento) {
        return;
    }


    elemento.value =
        valor || "";

}


/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagemPerfil(
    mensagem,
    tipo = "info"
) {

    if (
        window.GuiaBusao &&
        typeof window.GuiaBusao.mostrarMensagem ===
        "function"
    ) {

        window.GuiaBusao.mostrarMensagem(
            mensagem,
            tipo
        );

        return;
    }


    alert(mensagem);

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