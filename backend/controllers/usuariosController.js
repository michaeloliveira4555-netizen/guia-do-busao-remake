function listarUsuarios(req, res) {
    try {
        res.status(200).json({
            mensagem: "Endpoint de usuários funcionando"
        });
    } catch (erro) {
        console.error("Erro ao acessar usuários:", erro);

        res.status(500).json({
            erro: "Erro ao acessar usuários"
        });
    }
}

module.exports = {
    listarUsuarios
};