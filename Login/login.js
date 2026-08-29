// Captura o evento de envio do formulário
document.getElementById('formLogin').addEventListener('submit', function(event) {
    // Evita que a página recarregue ao clicar no botão
    event.preventDefault(); 

    // Captura os valores digitados pelo usuário
    const nome = document.getElementById('nomeUsuario').value.trim();
    const senha = document.getElementById('senhaUsuario').value.trim();

    // Validação básica (verifica se estão vazios)
    if (nome === '' || senha === '') {
        alert('Por favor, preencha todos os campos para continuar.');
        return;
    }

    // --- SIMULAÇÃO DE LOGIN ---
    // Aqui você conectaria com sua API ou banco de dados usando fetch() ou axios
    console.log('Tentativa de login:');
    console.log('Usuário:', nome);
    console.log('Senha: [Protegida]');
    
    // Exemplo de sucesso
    alert('Olá, ' + nome + '! Login simulado com sucesso. Redirecionando...');
    
    // window.location.href = "/dashboard.html"; // Redirecionamento real
});

// Função para o ícone de mostrar/ocultar senha
function alternarSenha() {
    const campoSenha = document.getElementById('senhaUsuario');
    
    if (campoSenha.type === 'password') {
        campoSenha.type = 'text'; // Mostra a senha
    } else {
        campoSenha.type = 'password'; // Oculta a senha
    }
}