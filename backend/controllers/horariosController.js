
const horariosService = require("../services/horariosService");

async function buscarHorariosPorLinha(req, res) {
    try {
        const linhaId = Number(req.params.linhaId);

        if (!Number.isInteger(linhaId) || linhaId <= 0) {
            return res.status(400).json({
                erro: "ID inválido"
            });
        }

        const horarios = await horariosService.horario(linhaId);

        return res.status(200).json(horarios);
    } catch (erro) {
        console.error("Erro ao buscar horários da linha:", erro);

        return res.status(500).json({
            erro: "Erro ao buscar os horários da linha"
        });
    }
}

async function listarTodos(req, res) {
    try {
        const horarios = await horariosService.listarTodos();

        return res.status(200).json(horarios);
    } catch (erro) {
        console.error("Erro ao listar horários:", erro);

        return res.status(500).json({
            erro: "Erro ao listar horários"
        });
    }
}

module.exports = {
    buscarHorariosPorLinha,
    listarTodos
};
