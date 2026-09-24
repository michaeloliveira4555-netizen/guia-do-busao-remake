const fs = require('fs')
const path = require('path')
const db = require('../database/db')

async function buscarOuCriarCidade(nome, uf) {
    let res = await db.query('SELECT id FROM cidades WHERE nome = $1 AND uf = $2', [nome, uf])
    if (res.rows.length > 0) return res.rows[0].id

    res = await db.query('INSERT INTO cidades (nome, uf) VALUES ($1, $2) RETURNING id', [nome, uf])
    return res.rows[0].id
}

async function buscarOuCriarViacao(nome) {
    let res = await db.query('SELECT id FROM viacoes WHERE nome = $1', [nome])
    if (res.rows.length > 0) return res.rows[0].id

    res = await db.query('INSERT INTO viacoes (nome) VALUES ($1) RETURNING id', [nome])
    return res.rows[0].id
}

async function buscarOuCriarRota(origemId, destinoId) {
    let res = await db.query('SELECT id FROM rotas WHERE origem_id = $1 AND destino_id = $2', [origemId, destinoId])
    if (res.rows.length > 0) return res.rows[0].id

    res = await db.query('INSERT INTO rotas (origem_id, destino_id) VALUES ($1, $2) RETURNING id', [origemId, destinoId])
    return res.rows[0].id
}

async function popularBanco() {
    console.log('Iniciando a leitura do CSV...')
    
    const caminhoCsv = path.join(__dirname, '../../linhas_onibus_sul_brasil.csv')
    const conteudo = fs.readFileSync(caminhoCsv, 'utf-8')
    
    const linhas = conteudo.split('\n').map(linha => linha.trim()).filter(linha => linha !== '')
    const dados = linhas.slice(1) 

    let inseridos = 0

    for (const linha of dados) {
        const colunas = linha.split(';')
        
        if (colunas.length < 8) continue

        const [origem_cidade, origem_uf, destino_cidade, destino_uf, viacao, hora_partida, hora_chegada, preco_texto] = colunas
        
        const preco = parseFloat(preco_texto)

        try {
            const origemId = await buscarOuCriarCidade(origem_cidade, origem_uf)
            const destinoId = await buscarOuCriarCidade(destino_cidade, destino_uf)

            const viacaoId = await buscarOuCriarViacao(viacao)

            const rotaId = await buscarOuCriarRota(origemId, destinoId)

            await db.query(
                'INSERT INTO horarios (rota_id, viacao_id, hora_partida, hora_chegada, preco) VALUES ($1, $2, $3, $4, $5)',
                [rotaId, viacaoId, hora_partida, hora_chegada, preco]
            )

            inseridos++
            console.log(`Linha ${inseridos} inserida: ${origem_cidade} -> ${destino_cidade} (${viacao})`)
        } catch (erro) {
            console.error(`Erro ao processar linha: ${linha}`, erro)
        }
    }

    console.log(`\n✅ Sucesso! ${inseridos} horários foram importados para o banco Aiven!`)
    process.exit(0)
}

popularBanco()
