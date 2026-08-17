const database = require("../database/database");

function listarHorarios(req, res) {
    try {
        const horarios = database.getHorarios();

        res.status(200).json(horarios);
    } catch (erro) {
        console.error("Erro ao listar horários:", erro);

        res.status(500).json({
            erro: "Erro ao buscar os horários"
        });
    }
}

function buscarHorario(req, res) {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: "ID do horário inválido"
            });
        }

        const horarios = database.getHorarios();

        const horario = horarios.find(
            item => item.id === id
        );

        if (!horario) {
            return res.status(404).json({
                erro: "Horário não encontrado"
            });
        }

        res.status(200).json(horario);
    } catch (erro) {
        console.error("Erro ao buscar horário:", erro);

        res.status(500).json({
            erro: "Erro ao buscar o horário"
        });
    }
}

function buscarHorariosPorLinha(req, res) {
    try {
        const linhaId = Number(req.params.linhaId);

        if (isNaN(linhaId)) {
            return res.status(400).json({
                erro: "ID da linha inválido"
            });
        }

        const linhas = database.getLinhas();
        const horarios = database.getHorarios();

        const linha = linhas.find(
            item => item.id === linhaId
        );

        if (!linha) {
            return res.status(404).json({
                erro: "Linha não encontrada"
            });
        }

        const horariosDaLinha = horarios.filter(
            horario => linha.horariosId.includes(horario.id)
        );

        res.status(200).json(horariosDaLinha);
    } catch (erro) {
        console.error("Erro ao buscar horários da linha:", erro);

        res.status(500).json({
            erro: "Erro ao buscar os horários da linha"
        });
    }
}

module.exports = {
    listarHorarios,
    buscarHorario,
    buscarHorariosPorLinha
};