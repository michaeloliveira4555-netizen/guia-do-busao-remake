
const { Pool } = require('pg')
const path = require('path')

require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
})

// Detecta se a conexão é local ou online
const databaseUrl = process.env.DATABASE_URL

const isLocal = databaseUrl
    ? /localhost|127\.0\.0\.1/i.test(new URL(databaseUrl).hostname)
    : false

// Configura a conexão com o PostgreSQL
const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocal
        ? false
        : { rejectUnauthorized: false }
})

// Confirma quando uma conexão é estabelecida
pool.on('connect', () => {
    console.log('Base de Dados conectada com sucesso')
})

// Registra erros inesperados no pool
pool.on('error', (err) => {
    console.error('Erro inesperado no banco de dados:', err)
})

// Testa a conexão com o banco
pool.query('SELECT 1')
    .then(() => console.log('Ping no banco: SUCESSO!'))
    .catch(err => console.error('Erro ao conectar no banco:', err.message))

// Exporta a função de consulta para as rotas
module.exports = {
    query: (text, params) => pool.query(text, params),
    end: () => pool.end()
}