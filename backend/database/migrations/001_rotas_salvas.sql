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
);

CREATE INDEX IF NOT EXISTS idx_rotas_salvas_usuario
    ON rotas_salvas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_rotas_salvas_usuario_data
    ON rotas_salvas(usuario_id, data_viagem);
