// Arquivo: backend/database/db.js
const { Pool } = require('pg')
require('dotenv').config()

// O pool pega a URL que configuramos secretamente no .env 
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

// Testando a conexão quando o servidor iniciar 
pool.on('connect', () => {
    console.log('Base de Dados conectada com sucesso')
})

pool.on('error', (err) => {
    console.log('Erro inesperado no banco de Dados', err)
    process.exit(-1)
})

// Fazemos uma consulta simples e falsa só para forçar o Pool a conectar e testar a senha!
pool.query('SELECT 1')
    .then(() => console.log('Ping no banco Aiven: SUCESSO!'))
    .catch(err => console.error('Erro ao conectar na Aiven:', err));

// Exportamos a função de query para o resto do sistema usar 
module.exports = {
    query: (text, params) => pool.query(text, params)
}