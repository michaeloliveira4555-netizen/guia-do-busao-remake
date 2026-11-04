const db = require("./db")

async function executarMigracoes() {
    console.log("Iniciando verificação e migrações do banco de dados...")

    // 1. Tabela rotas_salvas
    await db.query(`
        CREATE TABLE IF NOT EXISTS rotas_salvas (
            id BIGSERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL
                REFERENCES usuarios(id) ON DELETE CASCADE,
            origem VARCHAR(200) NOT NULL,
            destino VARCHAR(200) NOT NULL,
            data_viagem DATE NOT NULL,
            horario TIME,
            preferencia VARCHAR(30) NOT NULL DEFAULT 'fastest'
                CHECK (preferencia IN ('fastest', 'cheapest', 'fewer-connections')),
            criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            atualizada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `)

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_rotas_salvas_usuario
            ON rotas_salvas(usuario_id)
    `)

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_rotas_salvas_usuario_data
            ON rotas_salvas(usuario_id, data_viagem)
    `)

    console.log("✓ Tabela rotas_salvas e índices verificados.")

    // 2. Tabela favoritos (cria caso não exista)
    await db.query(`
        CREATE TABLE IF NOT EXISTS favoritos (
            id BIGSERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL
                REFERENCES usuarios(id) ON DELETE CASCADE,
            rota_id VARCHAR(200),
            empresa VARCHAR(200),
            origem VARCHAR(200) NOT NULL DEFAULT '',
            destino VARCHAR(200) NOT NULL DEFAULT '',
            data_viagem DATE,
            horario TIME,
            preco NUMERIC(10, 2),
            criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `)

    // Se já existia com o schema simplificado original, adiciona as colunas necessárias
    await db.query(`
        ALTER TABLE favoritos
            ADD COLUMN IF NOT EXISTS empresa VARCHAR(200),
            ADD COLUMN IF NOT EXISTS origem VARCHAR(200) NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS destino VARCHAR(200) NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS data_viagem DATE,
            ADD COLUMN IF NOT EXISTS horario TIME,
            ADD COLUMN IF NOT EXISTS preco NUMERIC(10, 2),
            ADD COLUMN IF NOT EXISTS criada_em TIMESTAMPTZ DEFAULT NOW()
    `)

    // Sincroniza criado_em para criada_em caso a coluna legada exista
    await db.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'favoritos' AND column_name = 'criado_em'
            ) THEN
                UPDATE favoritos SET criada_em = criado_em WHERE criada_em IS NULL;
            END IF;
        END $$;
    `)

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_favoritos_usuario
            ON favoritos(usuario_id)
    `)

    await db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_favoritos_unicos
            ON favoritos (
                usuario_id,
                origem,
                destino,
                (COALESCE(data_viagem, DATE '1900-01-01')),
                (COALESCE(horario, TIME '00:00:00'))
            )
    `)

    console.log("✓ Tabela favoritos e colunas/índices sincronizados.")
}

if (require.main === module) {
    executarMigracoes()
        .then(() => {
            console.log("Migrações concluídas com sucesso!")
            process.exit(0)
        })
        .catch((erro) => {
            console.error("Erro ao executar migrações:", erro)
            process.exit(1)
        })
}

module.exports = executarMigracoes
