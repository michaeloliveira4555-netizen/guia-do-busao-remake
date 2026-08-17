/* =========================================================
   GUIA DO BUSÃO
   LOGIN.JS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");

    const googleButton =
        document.getElementById("googleButton");

    const forgotPassword =
        document.getElementById("forgotPassword");


    /* =====================================================
       CONFIGURAÇÃO DA API
       ===================================================== */

    const API_URL = "http://localhost:3000";


    /* =====================================================
       MOSTRAR / ESCONDER SENHA
       ===================================================== */

    if (togglePassword) {

        togglePassword.addEventListener("click", () => {

            if (password.type === "password") {

                password.type = "text";

                togglePassword.textContent = "🙈";

                togglePassword.setAttribute(
                    "aria-label",
                    "Ocultar senha"
                );

            } else {

                password.type = "password";

                togglePassword.textContent = "👁";

                togglePassword.setAttribute(
                    "aria-label",
                    "Mostrar senha"
                );
            }

        });

    }


    /* =====================================================
       MENSAGEM
       ===================================================== */

    function mostrarMensagem(
        mensagem,
        tipo = "erro"
    ) {

        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = mensagem;

        loginMessage.className =
            `form-message ${tipo}`;

    }


    function limparMensagem() {

        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = "";

        loginMessage.className =
            "form-message";

    }


    /* =====================================================
       VALIDAR FORMULÁRIO
       ===================================================== */

    function validarFormulario() {

        const emailValor =
            email.value.trim();

        const senhaValor =
            password.value;


        if (!emailValor) {

            mostrarMensagem(
                "Digite seu e-mail."
            );

            email.focus();

            return false;
        }


        if (!emailValor.includes("@")) {

            mostrarMensagem(
                "Digite um e-mail válido."
            );

            email.focus();

            return false;
        }


        if (!senhaValor) {

            mostrarMensagem(
                "Digite sua senha."
            );

            password.focus();

            return false;
        }


        return true;
    }


    /* =====================================================
       LOGIN
       ===================================================== */

    if (form) {

        form.addEventListener(
            "submit",
            async (evento) => {

                evento.preventDefault();

                limparMensagem();


                if (!validarFormulario()) {
                    return;
                }


                const emailValor =
                    email.value.trim();

                const senhaValor =
                    password.value;


                loginButton.disabled = true;

                loginButton.textContent =
                    "Entrando...";


                try {

                    const resposta =
                        await fetch(
                            `${API_URL}/api/usuarios/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: emailValor,
                                    senha: senhaValor
                                })
                            }
                        );


                    let dados = {};

                    try {

                        dados =
                            await resposta.json();

                    } catch (erro) {

                        dados = {};

                    }


                    /* =====================================
                       ERRO DO SERVIDOR
                       ===================================== */

                    if (!resposta.ok) {

                        mostrarMensagem(
                            dados.mensagem ||
                            "E-mail ou senha incorretos."
                        );

                        return;
                    }


                    /* =====================================
                       LOGIN REALIZADO
                       ===================================== */

                    const usuario =
                        dados.usuario ||
                        dados;


                    localStorage.setItem(
                        "guiaBusaoUsuario",
                        JSON.stringify(usuario)
                    );


                    if (dados.token) {

                        localStorage.setItem(
                            "guiaBusaoToken",
                            dados.token
                        );

                    }


                    mostrarMensagem(
                        "Login realizado com sucesso!",
                        "sucesso"
                    );


                    /* =====================================
                       IR PARA O SITE
                       ===================================== */

                    setTimeout(() => {

                        window.location.href =
                            "../index.html";

                    }, 700);

                } catch (erro) {

                    console.error(
                        "Erro ao fazer login:",
                        erro
                    );


                    mostrarMensagem(
                        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
                    );

                } finally {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Entrar";

                }

            }
        );

    }


    /* =====================================================
       ESQUECI MINHA SENHA
       ===================================================== */

    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();

                mostrarMensagem(
                    "A recuperação de senha será disponibilizada em breve."
                );

            }
        );

    }


    /* =====================================================
       GOOGLE
       ===================================================== */

    if (googleButton) {

        googleButton.addEventListener(
            "click",
            () => {

                mostrarMensagem(
                    "O login com Google será configurado posteriormente."
                );

            }
        );

    }


    /* =====================================================
       ENTER NOS CAMPOS
       ===================================================== */

    [email, password].forEach(
        (campo) => {

            if (!campo) {
                return;
            }

            campo.addEventListener(
                "input",
                () => {

                    if (
                        loginMessage &&
                        loginMessage.classList.contains("erro")
                    ) {

                        limparMensagem();

                    }

                }
            );

        }
    );

});