/* =========================================================
   GUIA DO BUSÃO
   CADASTRO
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const API_BASE_URL =
    "http://localhost:3000";


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarCadastro();

        inicializarSenhas();

        inicializarTelefone();

    }
);


/* =========================================================
   FORMULÁRIO
   ========================================================= */

function inicializarCadastro() {

    const formulario =
        document.querySelector(
            "#registerForm"
        );


    if (!formulario) {

        console.error(
            "Formulário #registerForm não encontrado."
        );

        return;
    }


    formulario.addEventListener(
        "submit",
        cadastrarUsuario
    );

}


/* =========================================================
   CADASTRAR USUÁRIO
   ========================================================= */

async function cadastrarUsuario(
    evento
) {

    evento.preventDefault();


    const nome =
        document
            .querySelector("#name")
            .value
            .trim();


    const email =
        document
            .querySelector("#email")
            .value
            .trim()
            .toLowerCase();


    const telefone =
        document
            .querySelector("#phone")
            .value
            .trim();


    const senha =
        document
            .querySelector("#password")
            .value;


    const confirmarSenha =
        document
            .querySelector("#confirmPassword")
            .value;


    const termos =
        document
            .querySelector("#terms")
            .checked;


    /* =====================================================
       VALIDAÇÕES
       ===================================================== */

    if (!nome) {

        mostrarMensagem(
            "Digite seu nome completo.",
            "erro"
        );

        return;
    }


    if (nome.length < 3) {

        mostrarMensagem(
            "O nome deve ter pelo menos 3 caracteres.",
            "erro"
        );

        return;
    }


    if (!email) {

        mostrarMensagem(
            "Digite seu e-mail.",
            "erro"
        );

        return;
    }


    if (!validarEmail(email)) {

        mostrarMensagem(
            "Digite um e-mail válido.",
            "erro"
        );

        return;
    }


    if (!senha) {

        mostrarMensagem(
            "Crie uma senha.",
            "erro"
        );

        return;
    }


    if (senha.length < 6) {

        mostrarMensagem(
            "A senha deve ter pelo menos 6 caracteres.",
            "erro"
        );

        return;
    }


    if (
        senha !==
        confirmarSenha
    ) {

        mostrarMensagem(
            "As senhas não coincidem.",
            "erro"
        );

        return;
    }


    if (!termos) {

        mostrarMensagem(
            "Você precisa aceitar os termos de uso.",
            "erro"
        );

        return;
    }


    /* =====================================================
       BOTÃO
       ===================================================== */

    const botao =
        document.querySelector(
            "#registerButton"
        );


    if (botao) {

        botao.disabled = true;

        botao.textContent =
            "Criando conta...";

    }


    try {

        /* =================================================
           DADOS
           ================================================= */

        const usuario = {

            nome:
                nome,

            email:
                email,

            telefone:
                telefone,

            senha:
                senha

        };


        console.log(
            "Enviando cadastro..."
        );


        /* =================================================
           REQUISIÇÃO PARA O BACKEND
           ================================================= */

        const resposta =
            await fetch(
                `${API_BASE_URL}/api/usuarios`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            usuario
                        )

                }
            );


        /* =================================================
           RESPOSTA
           ================================================= */

        let dados = {};


        try {

            dados =
                await resposta.json();

        } catch (erro) {

            console.warn(
                "Resposta do servidor não é JSON."
            );

        }


        /* =================================================
           ERRO
           ================================================= */

        if (!resposta.ok) {

            throw new Error(

                dados.mensagem ||
                dados.erro ||
                dados.message ||
                "Não foi possível criar a conta."

            );

        }


        /* =================================================
           SUCESSO
           ================================================= */

        console.log(
            "Usuário cadastrado:",
            dados
        );


        mostrarMensagem(
            dados.mensagem ||
            "Conta criada com sucesso!",
            "sucesso"
        );


        /*
         * Limpa o formulário.
         */

        document
            .querySelector(
                "#registerForm"
            )
            .reset();


        /*
         * Vai para o login.
         */

        setTimeout(
            () => {

                window.location.href =
                    "login.html";

            },
            1200
        );


    } catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );


        /*
         * Erro de conexão.
         */

        if (
            erro.name ===
            "TypeError"
        ) {

            mostrarMensagem(

                "Não foi possível conectar ao servidor. Verifique se o npm start está rodando.",

                "erro"

            );

        } else {

            mostrarMensagem(

                erro.message ||
                "Erro ao criar a conta.",

                "erro"

            );

        }


    } finally {

        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                "Criar conta";

        }

    }

}


/* =========================================================
   VALIDAR E-MAIL
   ========================================================= */

function validarEmail(
    email
) {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return regex.test(
        email
    );

}


/* =========================================================
   SENHAS
   ========================================================= */

function inicializarSenhas() {

    configurarBotaoSenha(
        "#togglePassword",
        "#password"
    );


    configurarBotaoSenha(
        "#toggleConfirmPassword",
        "#confirmPassword"
    );

}


/* =========================================================
   MOSTRAR / ESCONDER SENHA
   ========================================================= */

function configurarBotaoSenha(
    seletorBotao,
    seletorCampo
) {

    const botao =
        document.querySelector(
            seletorBotao
        );


    const campo =
        document.querySelector(
            seletorCampo
        );


    if (
        !botao ||
        !campo
    ) {

        return;
    }


    botao.addEventListener(
        "click",
        () => {

            const mostrando =
                campo.type ===
                "text";


            if (mostrando) {

                campo.type =
                    "password";

                botao.textContent =
                    "👁";

                botao.setAttribute(
                    "aria-label",
                    "Mostrar senha"
                );

            } else {

                campo.type =
                    "text";

                botao.textContent =
                    "🙈";

                botao.setAttribute(
                    "aria-label",
                    "Ocultar senha"
                );

            }

        }
    );

}


/* =========================================================
   TELEFONE
   ========================================================= */

function inicializarTelefone() {

    const campo =
        document.querySelector(
            "#phone"
        );


    if (!campo) {
        return;
    }


    campo.addEventListener(
        "input",
        () => {

            let valor =
                campo.value.replace(
                    /\D/g,
                    ""
                );


            if (
                valor.length > 11
            ) {

                valor =
                    valor.substring(
                        0,
                        11
                    );

            }


            if (
                valor.length <= 10
            ) {

                valor =
                    valor.replace(
                        /^(\d{2})(\d)/,
                        "($1) $2"
                    );

                valor =
                    valor.replace(
                        /(\d{4})(\d)/,
                        "$1-$2"
                    );

            } else {

                valor =
                    valor.replace(
                        /^(\d{2})(\d)/,
                        "($1) $2"
                    );

                valor =
                    valor.replace(
                        /(\d{5})(\d)/,
                        "$1-$2"
                    );

            }


            campo.value =
                valor;

        }
    );

}


/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagem(
    mensagem,
    tipo
) {

    const elemento =
        document.querySelector(
            "#registerMessage"
        );


    if (!elemento) {

        alert(
            mensagem
        );

        return;
    }


    elemento.hidden =
        false;


    elemento.textContent =
        mensagem;


    elemento.className =
        `form-message ${tipo}`;


    elemento.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


/* =========================================================
   GOOGLE
   ========================================================= */

const googleButton =
    document.querySelector("#googleButton");

const GOOGLE_CLIENT_ID =
    "481983737742-jsja75eddodr7upfnbo2p53as4s48gec.apps.googleusercontent.com";

let googleInicializado = false;
let googleCarregando = false;

function processarLoginGoogle(credential) {
    if (googleButton) {
        googleButton.disabled = true;
    }

    mostrarMensagem("Verificando sua conta Google...", "sucesso");

    fetch(`${API_BASE_URL}/api/usuarios/google`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ credential })
    })
        .then(async (resposta) => {
            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Não foi possível entrar com o Google."
                );
            }

            if (!dados.token || !dados.usuario) {
                throw new Error("O servidor não retornou os dados da sessão.");
            }

            localStorage.setItem(
                "guiaBusaoUsuario",
                JSON.stringify(dados.usuario)
            );

            localStorage.setItem("guiaBusaoToken", dados.token);

            mostrarMensagem("Conta Google conectada com sucesso!", "sucesso");

            setTimeout(() => {
                window.location.href = "../index.html";
            }, 700);
        })
        .catch((erro) => {
            console.error("Erro no login Google:", erro);
            mostrarMensagem(erro.message || "Erro ao autenticar com o Google.", "erro");
        })
        .finally(() => {
            if (googleButton) {
                googleButton.disabled = false;
            }
        });
}

function inicializarGoogleCadastro() {
    if (!window.google?.accounts?.id) {
        return false;
    }

    if (!googleInicializado) {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (resposta) => {
                if (resposta.credential) {
                    processarLoginGoogle(resposta.credential);
                } else {
                    mostrarMensagem(
                        "O Google não retornou uma credencial válida.",
                        "erro"
                    );
                }
            }
        });

        googleInicializado = true;
    }

    return true;
}

function carregarGoogleCadastro() {
    if (window.google?.accounts?.id) {
        inicializarGoogleCadastro();
        return;
    }

    if (googleCarregando) {
        return;
    }

    googleCarregando = true;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
        googleCarregando = false;

        if (!inicializarGoogleCadastro()) {
            mostrarMensagem("Não foi possível inicializar o Google.", "erro");
        }
    };

    script.onerror = () => {
        googleCarregando = false;
        mostrarMensagem("Não foi possível carregar o Google.", "erro");
    };

    document.head.appendChild(script);
}

if (googleButton) {
    googleButton.addEventListener("click", () => {
        if (!inicializarGoogleCadastro()) {
            carregarGoogleCadastro();

            mostrarMensagem(
                "Carregando o Google... Clique novamente em instantes.",
                "sucesso"
            );

            return;
        }

        window.google.accounts.id.prompt((notificacao) => {
            if (notificacao.isNotDisplayed()) {
                mostrarMensagem(
                    "O Google não abriu a seleção de conta. Verifique a configuração OAuth.",
                    "erro"
                );
            }
        });
    });
}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.CadastroGuiaBusao = {

    cadastrarUsuario,

    validarEmail

};