const anttService = require("../services/anttService");

async function pesquisar(req, res) {
    try {
        const pagina = req.query.pagina === undefined
            ? 1
            : Number(req.query.pagina);

        const limite = req.query.limite === undefined
            ? 20
            : Number(req.query.limite);

        if (
            !Number.isInteger(pagina) ||
            pagina < 1 ||
            !Number.isInteger(limite) ||
            limite < 1 ||
            limite > 100
        ) {
            return res.status(400).json({
                erro: "Página deve ser positiva e limite deve estar entre 1 e 100."
            });
        }

        const sentido = req.query.sentido
            ? String(req.query.sentido).toLowerCase()
            : undefined;

        if (sentido && !["ida", "volta"].includes(sentido)) {
            return res.status(400).json({
                erro: "Sentido deve ser 'ida' ou 'volta'."
            });
        }

        const horario = req.query.horario
            ? String(req.query.horario)
            : undefined;

        if (
            horario &&
            !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(horario)
        ) {
            return res.status(400).json({
                erro: "Horário inválido. Use HH:MM ou HH:MM:SS."
            });
        }

        const resultado = await anttService.pesquisar({
            busca: req.query.busca?.trim(),
            empresa: req.query.empresa?.trim(),
            sentido,
            categoria: req.query.categoria?.trim(),
            horario,
            dia: req.query.dia?.toLowerCase(),
            mes: req.query.mes?.toLowerCase(),
            pagina,
            limite
        });

        return res.status(200).json({
            fonte: "ANTT — Horários SIGMA, outubro de 2026",
            aviso: "A fonte informa horários de partida, não preços nem horários de chegada.",
            ...resultado
        });
    } catch (erro) {
        if (["DIA_INVALIDO", "MES_INVALIDO"].includes(erro.message)) {
            return res.status(400).json({
                erro: erro.message === "DIA_INVALIDO"
                    ? "Dia da semana inválido."
                    : "Mês inválido."
            });
        }

        console.error("Erro ao consultar horários ANTT:", erro);

        return res.status(500).json({
            erro: "Erro ao consultar os horários da ANTT."
        });
    }
}

module.exports = { pesquisar };
