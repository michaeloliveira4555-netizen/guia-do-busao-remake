// Arquivo: backend/database/db.js
const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// O pool pega a URL configurada no .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

// Testa a conexão quando o servidor iniciar
pool.on('connect', () => {
    console.log('Base de Dados conectada com sucesso')
})

pool.on('error', (err) => {
    console.log('Erro inesperado no banco de Dados', err)
    process.exit(-1)
})

// Faz uma consulta simples e falsa só para forçar o Pool a conectar e testar a senha
pool.query('SELECT 1')
    .then(() => console.log('Ping no banco Aiven: SUCESSO!'))
    .catch(err => console.error('Erro ao conectar na Aiven:', err));

// Exporta a função de query para o resto do sistema usar
module.exports = {
    query: (text, params) => pool.query(text, params)
}