const fs = require('fs');
const path = require('path');
const db = require('../database/db');

async function buscarOuCriarCidade(nome, uf) {
    const res = await db.query(
        'SELECT id FROM cidades WHERE nome = $1 AND uf = $2',
        [nome, uf]
    );

    if (res.rows.length > 0) return res.rows[0].id;

    const nova = await db.query(
        'INSERT INTO cidades (nome, uf) VALUES ($1, $2) RETURNING id',
        [nome, uf]
    );

    return nova.rows[0].id;
}

async function buscarOuCriarViacao(nome) {
    const res = await db.query(
        'SELECT id FROM viacoes WHERE nome = $1',
        [nome]
    );

    if (res.rows.length > 0) return res.rows[0].id;

    const nova = await db.query(
        'INSERT INTO viacoes (nome) VALUES ($1) RETURNING id',
        [nome]
    );

    return nova.rows[0].id;
}

async function buscarOuCriarRota(origemId, destinoId) {
    const res = await db.query(
        'SELECT id FROM rotas WHERE origem_id = $1 AND destino_id = $2',
        [origemId, destinoId]
    );

    if (res.rows.length > 0) return res.rows[0].id;

    const nova = await db.query(
        'INSERT INTO rotas (origem_id, destino_id) VALUES ($1, $2) RETURNING id',
        [origemId, destinoId]
    );

    return nova.rows[0].id;
}

async function popularBanco() {
    let inseridos = 0;
    let ignorados = 0;
    let erros = 0;

    try {
        const caminhoCsv = path.join(
            __dirname,
            '../../linhas_onibus_sul_brasil.csv'
        );

        const conteudo = fs.readFileSync(caminhoCsv, 'utf8')
            .replace(/^\uFEFF/, '');

        const linhas = conteudo
            .split(/\r?\n/)
            .map(linha => linha.trim())
            .filter(Boolean);

        const dados = linhas.slice(1);

        console.log(`Registros encontrados no CSV: ${dados.length}`);

        for (const [indice, linha] of dados.entries()) {
            const colunas = linha.split(';').map(valor => valor.trim());

            if (colunas.length !== 8) {
                console.warn(`Linha ${indice + 2} ignorada: quantidade de colunas inválida.`);
                ignorados++;
                continue;
            }

            const [
                origemCidade,
                origemUf,
                destinoCidade,
                destinoUf,
                viacao,
                horaPartida,
                horaChegada,
                precoTexto
            ] = colunas;

            const preco = Number(precoTexto);

            if (
                !origemCidade ||
                !origemUf ||
                !destinoCidade ||
                !destinoUf ||
                !viacao ||
                !/^\d{2}:\d{2}(:\d{2})?$/.test(horaPartida) ||
                !/^\d{2}:\d{2}(:\d{2})?$/.test(horaChegada) ||
                !Number.isFinite(preco) ||
                preco < 0
            ) {
                console.warn(`Linha ${indice + 2} ignorada: dados inválidos.`);
                ignorados++;
                continue;
            }

            try {
                const origemId = await buscarOuCriarCidade(origemCidade, origemUf);
                const destinoId = await buscarOuCriarCidade(destinoCidade, destinoUf);
                const viacaoId = await buscarOuCriarViacao(viacao);
                const rotaId = await buscarOuCriarRota(origemId, destinoId);

                const existente = await db.query(
                    `SELECT id
                     FROM horarios
                     WHERE rota_id = $1
                       AND viacao_id = $2
                       AND hora_partida = $3::time
                       AND hora_chegada = $4::time
                       AND preco = $5::numeric
                     LIMIT 1`,
                    [rotaId, viacaoId, horaPartida, horaChegada, preco]
                );

                if (existente.rows.length > 0) {
                    ignorados++;
                    continue;
                }

                await db.query(
                    `INSERT INTO horarios
                     (rota_id, viacao_id, hora_partida, hora_chegada, preco)
                     VALUES ($1, $2, $3::time, $4::time, $5::numeric)`,
                    [rotaId, viacaoId, horaPartida, horaChegada, preco]
                );

                inseridos++;
            } catch (erro) {
                erros++;
                console.error(`Erro na linha ${indice + 2}: ${erro.message}`);
            }
        }

             console.log('\nImportação concluída.');
        console.log(`Horários inseridos: ${inseridos}`);
        console.log(`Registros já existentes ou inválidos: ${ignorados}`);
        console.log(`Erros: ${erros}`);
    } catch (erro) {
        console.error('Falha na importação:', erro.message);
        process.exitCode = 1;
    } finally {
        await db.end().catch(erro => {
            console.error('Erro ao encerrar conexão:', erro.message);
        });
    }
}

popularBanco();