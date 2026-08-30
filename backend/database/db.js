// Arquivo: backend/database/db.js
const { pool, Connection } = require('pg')
require('dotenv').config()

// O pool pega a URL que configuramos secretamente no .env 
const pool = new pool({
    ConnectionString: process.env.DATABASE_URL
})

// Testando a conexão quando o servidor iniciar 
pool.on('connect', () => {
    console.log('Base de Dados conectada com sucesso')
})

pool.on('error', (err) => {
    console.log('Erro inesperado no banco de Dados'.err)
    process.exit(-1)
})

// Exportamos a função de query para o resto do sistema usar 
module.exports = {
    query: (text, params) => pool.query(text, params)
}