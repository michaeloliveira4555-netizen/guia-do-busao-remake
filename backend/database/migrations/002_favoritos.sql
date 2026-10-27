CREATE TABLE IF NOT EXISTS favoritos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL
        REFERENCES usuarios(id) ON DELETE CASCADE,
    rota_id VARCHAR(200),
    empresa VARCHAR(200),
    origem VARCHAR(200) NOT NULL,
    destino VARCHAR(200) NOT NULL,
    data_viagem DATE,
    horario TIME,
    preco NUMERIC(10, 2),
    criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favoritos_usuario
    ON favoritos(usuario_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favoritos_unicos
    ON favoritos (
        usuario_id,
        origem,
        destino,
        (COALESCE(data_viagem, DATE '1900-01-01')),
        (COALESCE(horario, TIME '00:00:00'))
    );
