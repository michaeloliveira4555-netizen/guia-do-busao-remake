/* =========================================================
   GUIA DO BUSÃO - CADASTRO
   ========================================================= */

const API_BASE_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    inicializarCadastro();
    inicializarSenhas();
    inicializarTelefone();
});

function inicializarCadastro() {
    const formulario = document.querySelector("#registerForm");
    if (!formulario) {
        console.error("Formulário #registerForm não encontrado.");
        return;
    }
    formulario.addEventListener("submit", cadastrarUsuario);
}

async function cadastrarUsuario(evento) {
    evento.preventDefault();

    const nome = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim().toLowerCase();
    const telefone = document.querySelector("#phone").value.trim();
    const senha = document.querySelector("#password").value;
    const confirmarSenha = document.querySelector("#confirmPassword").value;
    const termos = document.querySelector("#terms").checked;

    /* VALIDAÇÕES */
    if (!nome || nome.length < 3) {
        return mostrarMensagem("O nome deve ter pelo menos 3 caracteres.", "erro");
    }
    if (!email || !validarEmail(email)) {
        return mostrarMensagem("Digite um e-mail válido.", "erro");
    }
    if (!senha || senha.length < 6) {
        return mostrarMensagem("A senha deve ter pelo menos 6 caracteres.", "erro");
    }
    if (senha !== confirmarSenha) {
        return mostrarMensagem("As senhas não coincidem.", "erro");
    }
    if (!termos) {
        return mostrarMensagem("Você precisa aceitar os termos de uso.", "erro");
    }

    const botao = document.querySelector("#registerButton");
    if (botao) {
        botao.disabled = true;
        botao.textContent = "Criando conta...";
    }

    try {
        const usuario = { nome, email, telefone, senha };

        const resposta = await fetch(`${API_BASE_URL}/api/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        let dados = {};
        try {
            dados = await resposta.json();
        } catch (erro) {
            console.warn("Resposta do servidor não é JSON.");
        }

        if (!resposta.ok) {
            throw new Error(dados.mensagem || dados.erro || dados.message || "Não foi possível criar a conta.");
        }

        mostrarMensagem(dados.mensagem || "Conta criada com sucesso!", "sucesso");
        document.querySelector("#registerForm").reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

    } catch (erro) {
        if (erro.name === "TypeError") {
            mostrarMensagem("Não foi possível conectar ao servidor. Verifique se o backend está rodando em localhost:3000.", "erro");
        } else {
            mostrarMensagem(erro.message || "Erro ao criar a conta.", "erro");
        }
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = "Criar conta";
        }
    }
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function inicializarSenhas() {
    configurarBotaoSenha("#togglePassword", "#password");
    configurarBotaoSenha("#toggleConfirmPassword", "#confirmPassword");
}

function configurarBotaoSenha(seletorBotao, seletorCampo) {
    const botao = document.querySelector(seletorBotao);
    const campo = document.querySelector(seletorCampo);

    if (!botao || !campo) return;

    botao.addEventListener("click", () => {
        const mostrando = campo.type === "text";
        if (mostrando) {
            campo.type = "password";
            botao.textContent = "👁";
            botao.setAttribute("aria-label", "Mostrar senha");
        } else {
            campo.type = "text";
            botao.textContent = "🙈";
            botao.setAttribute("aria-label", "Ocultar senha");
        }
    });
}

function inicializarTelefone() {
    const campo = document.querySelector("#phone");
    if (!campo) return;

    campo.addEventListener("input", () => {
        let valor = campo.value.replace(/\D/g, "");
        if (valor.length > 11) valor = valor.substring(0, 11);

        if (valor.length <= 10) {
            valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
            valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
        } else {
            valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
            valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        }
        campo.value = valor;
    });
}

function mostrarMensagem(mensagem, tipo) {
    const elemento = document.querySelector("#registerMessage");
    if (!elemento) {
        alert(mensagem);
        return;
    }
    elemento.hidden = false;
    elemento.textContent = mensagem;
    elemento.className = `form-message ${tipo}`;
}

const googleButton = document.querySelector("#googleButton");
if (googleButton) {
    googleButton.addEventListener("click", () => {
        mostrarMensagem("O login com Google ainda será configurado.", "erro");
    });
}

window.CadastroGuiaBusao = { cadastrarUsuario, validarEmail };