const horariosService = require("../services/horariosService")

async function buscarHorariosPorLinha(req, res) {
    try {
        const linhaId = Number(req.params.linhaId);

        if (isNaN(linhaId)) {
            return res.status(400).json({
                erro: "ID inválido"
            });
        }

        const horarios = await horariosService.horario(linhaId)

        res.status(200).json(horarios);
    } catch (erro) {
        console.error("Erro ao buscar horários da linha: ", erro);

        res.status(500).json({
            erro: "Erro ao buscar os horários da linha"
        });
    }
}

module.exports = {
    buscarHorariosPorLinha
};