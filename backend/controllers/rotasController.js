const rotaService = require("../services/rotaService");

function listarRotas(req, res) {
    try {
        const rotas = rotaService.listarRotas();

        res.status(200).json(rotas);
    } catch (erro) {
        console.error("Erro ao listar rotas:", erro);

        res.status(500).json({
            erro: "Erro ao buscar as rotas"
        });
    }
}

function buscarRota(req, res) {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: "ID da rota inválido"
            });
        }

        const rota = rotaService.buscarRotaPorId(id);

        if (!rota) {
            return res.status(404).json({
                erro: "Rota não encontrada"
            });
        }

        res.status(200).json(rota);
    } catch (erro) {
        console.error("Erro ao buscar rota:", erro);

        res.status(500).json({
            erro: "Erro ao buscar a rota"
        });
    }
}

function buscarRotasPorOrigemDestino(req, res) {
    try {
        const { origem, destino } = req.query;

        if (!origem || !destino) {
            return res.status(400).json({
                erro: "Informe a origem e o destino"
            });
        }

        const rotas = rotaService.buscarRotasPorOrigemDestino(
            Number(origem),
            Number(destino)
        );

        res.status(200).json(rotas);
    } catch (erro) {
        console.error("Erro ao buscar rotas:", erro);

        res.status(500).json({
            erro: "Erro ao buscar rotas"
        });
    }
}

module.exports = {
    listarRotas,
    buscarRota,
    buscarRotasPorOrigemDestino
};