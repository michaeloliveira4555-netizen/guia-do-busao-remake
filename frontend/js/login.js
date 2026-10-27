
/* =========================================================
   GUIA DO BUSÃO
   LOGIN.JS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");
    const googleButton = document.getElementById("googleButton");
    const forgotPassword = document.getElementById("forgotPassword");

    const API_URL = "http://localhost:3000";
    const GOOGLE_CLIENT_ID =
        "481983737742-jsja75eddodr7upfnbo2p53as4s48gec.apps.googleusercontent.com";

    let googleInicializado = false;
    let googleCarregando = false;

    function mostrarMensagem(mensagem, tipo = "erro") {
        if (!loginMessage) return;

        loginMessage.textContent = mensagem;
        loginMessage.className = `form-message ${tipo}`;
    }

    function limparMensagem() {
        if (!loginMessage) return;

        loginMessage.textContent = "";
        loginMessage.className = "form-message";
    }

    function salvarSessao(dados) {
        if (!dados.token || !dados.usuario) {
            throw new Error("O servidor não retornou os dados da sessão.");
        }

        localStorage.setItem(
            "guiaBusaoUsuario",
            JSON.stringify(dados.usuario)
        );

        localStorage.setItem("guiaBusaoToken", dados.token);
    }

    // Mostrar ou ocultar senha.
    if (togglePassword && password) {
        togglePassword.addEventListener("click", () => {
            const mostrar = password.type === "password";

            password.type = mostrar ? "text" : "password";
            togglePassword.textContent = mostrar ? "🙈" : "👁";

            togglePassword.setAttribute(
                "aria-label",
                mostrar ? "Ocultar senha" : "Mostrar senha"
            );
        });
    }

    function validarFormulario() {
        if (!email || !password) return false;

        const emailValor = email.value.trim();
        const senhaValor = password.value;

        if (!emailValor) {
            mostrarMensagem("Digite seu e-mail.");
            email.focus();
            return false;
        }

        if (!emailValor.includes("@")) {
            mostrarMensagem("Digite um e-mail válido.");
            email.focus();
            return false;
        }

        if (!senhaValor) {
            mostrarMensagem("Digite sua senha.");
            password.focus();
            return false;
        }

        return true;
    }

    // =====================================================
    // LOGIN TRADICIONAL: E-MAIL E SENHA
    // =====================================================

    if (form) {
        form.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            limparMensagem();

            if (!validarFormulario()) return;

            loginButton.disabled = true;
            loginButton.textContent = "Entrando...";

            try {
                const resposta = await fetch(
                    `${API_URL}/api/usuarios/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email.value.trim(),
                            senha: password.value
                        })
                    }
                );

                const dados = await resposta.json().catch(() => ({}));

                if (!resposta.ok) {
                    mostrarMensagem(
                        dados.mensagem || "E-mail ou senha incorretos."
                    );
                    return;
                }

                salvarSessao(dados);

                mostrarMensagem(
                    "Login realizado com sucesso!",
                    "sucesso"
                );

                setTimeout(() => {
                    window.location.href = "../index.html";
                }, 700);
            } catch (erro) {
                console.error("Erro ao fazer login:", erro);

                mostrarMensagem(
                    "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
                );
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = "Entrar";
            }
        });
    }

    // =====================================================
    // LOGIN COM GOOGLE
    // =====================================================

    async function processarLoginGoogle(credential) {
        if (googleButton) {
            googleButton.style.pointerEvents = "none";
            googleButton.style.opacity = "0.6";
        }

        limparMensagem();
        mostrarMensagem(
            "Verificando sua conta Google...",
            "sucesso"
        );

        try {
            const resposta = await fetch(
                `${API_URL}/api/usuarios/google`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ credential })
                }
            );

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                mostrarMensagem(
                    dados.mensagem ||
                    dados.erro ||
                    "Não foi possível entrar com o Google."
                );
                return;
            }

            salvarSessao(dados);

            mostrarMensagem(
                "Login com Google realizado!",
                "sucesso"
            );

            setTimeout(() => {
                window.location.href = "../index.html";
            }, 700);
        } catch (erro) {
            console.error("Erro no login Google:", erro);

            mostrarMensagem(
                "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
            );
        } finally {
            if (googleButton) {
                googleButton.style.pointerEvents = "";
                googleButton.style.opacity = "";
            }
        }
    }

    function inicializarGoogle() {
        if (googleInicializado) return true;

        if (!window.google?.accounts?.id) {
            return false;
        }

        if (!googleButton) {
            console.error("Elemento googleButton não encontrado.");
            return false;
        }

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (resposta) => {
                if (resposta?.credential) {
                    processarLoginGoogle(resposta.credential);
                } else {
                    mostrarMensagem(
                        "O Google não retornou uma credencial válida."
                    );
                }
            },
            use_fedcm_for_button: true
        });

        googleButton.innerHTML = "";

        window.google.accounts.id.renderButton(googleButton, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: Math.max(
                200,
                Math.min(
                    400,
                    googleButton.parentElement?.clientWidth || 400
                )
            ),
            logo_alignment: "left"
        });

        googleInicializado = true;
        return true;
    }

    function carregarGoogle() {
        if (window.google?.accounts?.id) {
            inicializarGoogle();
            return;
        }

        if (googleCarregando) return;

        googleCarregando = true;

        let script = document.querySelector(
            'script[src="https://accounts.google.com/gsi/client"]'
        );

        if (script) {
            if (window.google?.accounts?.id) {
                googleCarregando = false;
                inicializarGoogle();
                return;
            }

            script.addEventListener(
                "load",
                () => {
                    googleCarregando = false;

                    if (!inicializarGoogle()) {
                        mostrarMensagem(
                            "A biblioteca do Google carregou, mas não foi possível inicializá-la."
                        );
                    }
                },
                { once: true }
            );

            script.addEventListener(
                "error",
                () => {
                    googleCarregando = false;
                    mostrarMensagem(
                        "Não foi possível carregar o Google. Verifique sua conexão."
                    );
                },
                { once: true }
            );

            return;
        }

        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            googleCarregando = false;

            if (!inicializarGoogle()) {
                mostrarMensagem(
                    "Não foi possível inicializar o login do Google."
                );
            }
        };

        script.onerror = () => {
            googleCarregando = false;

            mostrarMensagem(
                "Não foi possível carregar o Google. Verifique sua conexão."
            );
        };

        document.head.appendChild(script);
    }

    // O Google renderiza seu próprio botão; não chamamos prompt().
    if (googleButton) {
        carregarGoogle();
    }

    // =====================================================
    // RECUPERAÇÃO DE SENHA
    // =====================================================

    if (forgotPassword) {
        forgotPassword.addEventListener("click", (evento) => {
            evento.preventDefault();

            mostrarMensagem(
                "A recuperação de senha será disponibilizada em breve."
            );
        });
    }

    // Limpar mensagens de validação ao digitar.
    [email, password].forEach((campo) => {
        if (!campo) return;

        campo.addEventListener("input", () => {
            if (loginMessage?.classList.contains("erro")) {
                limparMensagem();
            }
        });
    });
});
