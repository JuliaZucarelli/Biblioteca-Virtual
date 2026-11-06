/* Esquema do banco SQLite. É executado toda vez que a API abre o banco:
"IF NOT EXISTS" garante que as tabelas só são criadas na primeira vez. */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS usuarios (
    id          TEXT PRIMARY KEY,
    nome        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
    senha_hash  TEXT NOT NULL,
    papel       TEXT NOT NULL DEFAULT 'MEMBRO' CHECK (papel IN ('MEMBRO', 'ADMIN')),
    criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS livros (
    id       TEXT PRIMARY KEY,
    isbn     TEXT NOT NULL UNIQUE,
    titulo   TEXT NOT NULL,
    autor    TEXT NOT NULL,
    ano      INTEGER NOT NULL CHECK (ano > 0),
    genero   TEXT NOT NULL,
    sinopse  TEXT NOT NULL DEFAULT '',
    capa     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS exemplares (
    id        TEXT PRIMARY KEY,
    livro_id  TEXT NOT NULL REFERENCES livros(id) ON DELETE CASCADE,
    codigo    TEXT NOT NULL UNIQUE COLLATE NOCASE,
    status    TEXT NOT NULL DEFAULT 'DISPONIVEL'
              CHECK (status IN ('DISPONIVEL', 'EMPRESTADO', 'RESERVADO', 'INDISPONIVEL'))
);
CREATE INDEX IF NOT EXISTS idx_exemplares_livro ON exemplares(livro_id);

CREATE TABLE IF NOT EXISTS emprestimos (
    id               TEXT PRIMARY KEY,
    usuario_id       TEXT NOT NULL REFERENCES usuarios(id),
    exemplar_id      TEXT NOT NULL REFERENCES exemplares(id),
    data_emprestimo  TEXT NOT NULL,
    data_vencimento  TEXT NOT NULL,
    data_devolucao   TEXT,
    renovacoes       INTEGER NOT NULL DEFAULT 0 CHECK (renovacoes >= 0)
);
CREATE INDEX IF NOT EXISTS idx_emprestimos_usuario  ON emprestimos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_emprestimos_exemplar ON emprestimos(exemplar_id);

CREATE TABLE IF NOT EXISTS reservas (
    id          TEXT PRIMARY KEY,
    usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
    livro_id    TEXT NOT NULL REFERENCES livros(id) ON DELETE CASCADE,
    criada_em   TEXT NOT NULL DEFAULT (datetime('now')),
    status      TEXT NOT NULL DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'ATENDIDA', 'CANCELADA'))
);
CREATE INDEX IF NOT EXISTS idx_reservas_livro ON reservas(livro_id);
`
