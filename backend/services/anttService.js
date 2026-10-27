const database = require("../database/db");

async function pesquisar({
    busca,
    empresa,
    sentido,
    categoria,
    horario,
    dia,
    mes,
    pagina,
    limite
}) {
    const filtros = [];
    const parametros = [];

    function adicionarFiltro(sql, valor) {
        parametros.push(valor);
        filtros.push(sql.replace("?", `$${parametros.length}`));
    }

    if (busca) {
        adicionarFiltro(
            "descricao_linha ILIKE ?",
            `%${busca}%`
        );
    }

    if (empresa) {
        adicionarFiltro(
            "razao_social ILIKE ?",
            `%${empresa}%`
        );
    }

    if (sentido) {
        adicionarFiltro(
            "sentido = ?",
            sentido
        );
    }

    if (categoria) {
        adicionarFiltro(
            "tipo_veiculo ILIKE ?",
            `%${categoria}%`
        );
    }

    if (horario) {
        adicionarFiltro(
            "horario = CAST(? AS time)",
            horario
        );
    }

    const diasPermitidos = [
        "segunda_feira", "terca_feira", "quarta_feira",
        "quinta_feira", "sexta_feira", "sabado", "domingo"
    ];

    if (dia) {
        if (!diasPermitidos.includes(dia)) {
            throw new Error("DIA_INVALIDO");
        }
        filtros.push(`${dia} = TRUE`);
    }

    const mesesPermitidos = [
        "janeiro", "fevereiro", "marco", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

    if (mes) {
        if (!mesesPermitidos.includes(mes)) {
            throw new Error("MES_INVALIDO");
        }
        filtros.push(`${mes} = TRUE`);
    }

    const where = filtros.length
        ? `WHERE ${filtros.join(" AND ")}`
        : "";

    const contagem = await database.query(
        `SELECT COUNT(*) AS total FROM horarios_antt ${where}`,
        parametros
    );

    const total = Number(contagem.rows[0].total);
    const deslocamento = (pagina - 1) * limite;

    const dados = await database.query(
        `SELECT
            id,
            razao_social AS empresa,
            prefixo,
            descricao_linha,
            sentido,
            horario AS hora_partida,
            tipo_veiculo,
            gratuidade,
            segunda_feira,
            terca_feira,
            quarta_feira,
            quinta_feira,
            sexta_feira,
            sabado,
            domingo,
            janeiro,
            fevereiro,
            marco,
            abril,
            maio,
            junho,
            julho,
            agosto,
            setembro,
            outubro,
            novembro,
            dezembro
         FROM horarios_antt
         ${where}
         ORDER BY horario ASC, razao_social ASC
         LIMIT $${parametros.length + 1}
         OFFSET $${parametros.length + 2}`,
        [...parametros, limite, deslocamento]
    );

    return {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
        resultados: dados.rows
    };
}

module.exports = { pesquisar };
