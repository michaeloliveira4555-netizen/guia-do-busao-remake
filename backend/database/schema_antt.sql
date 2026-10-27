CREATE TABLE IF NOT EXISTS horarios_antt (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cnpj VARCHAR(20) NOT NULL,
    razao_social TEXT NOT NULL,
    data_autorizacao DATE,
    prefixo TEXT NOT NULL,
    descricao_linha TEXT NOT NULL,
    tipo_veiculo TEXT,
    sentido TEXT NOT NULL,
    horario TIME NOT NULL,
    gratuidade TEXT,
    segunda_feira BOOLEAN NOT NULL DEFAULT FALSE,
    terca_feira BOOLEAN NOT NULL DEFAULT FALSE,
    quarta_feira BOOLEAN NOT NULL DEFAULT FALSE,
    quinta_feira BOOLEAN NOT NULL DEFAULT FALSE,
    sexta_feira BOOLEAN NOT NULL DEFAULT FALSE,
    sabado BOOLEAN NOT NULL DEFAULT FALSE,
    domingo BOOLEAN NOT NULL DEFAULT FALSE,
    janeiro BOOLEAN NOT NULL DEFAULT FALSE,
    fevereiro BOOLEAN NOT NULL DEFAULT FALSE,
    marco BOOLEAN NOT NULL DEFAULT FALSE,
    abril BOOLEAN NOT NULL DEFAULT FALSE,
    maio BOOLEAN NOT NULL DEFAULT FALSE,
    junho BOOLEAN NOT NULL DEFAULT FALSE,
    julho BOOLEAN NOT NULL DEFAULT FALSE,
    agosto BOOLEAN NOT NULL DEFAULT FALSE,
    setembro BOOLEAN NOT NULL DEFAULT FALSE,
    outubro BOOLEAN NOT NULL DEFAULT FALSE,
    novembro BOOLEAN NOT NULL DEFAULT FALSE,
    dezembro BOOLEAN NOT NULL DEFAULT FALSE,
    registro_original JSONB NOT NULL,
    registro_hash CHAR(64) NOT NULL UNIQUE,
    arquivo_fonte TEXT NOT NULL DEFAULT '10-2026_horarios_sigma.csv',
    importado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horarios_antt_prefixo
    ON horarios_antt (prefixo);

CREATE INDEX IF NOT EXISTS idx_horarios_antt_sentido
    ON horarios_antt (sentido);

CREATE INDEX IF NOT EXISTS idx_horarios_antt_horario
    ON horarios_antt (horario);
