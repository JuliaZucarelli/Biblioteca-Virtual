import Database from "better-sqlite3"
import type { Banco } from "../config/banco"
import { SCHEMA_SQL } from "../database/schema"

/* Banco SQLite em memória, só para testes: cria as tabelas e insere
os usuários U1..U4, o livro L1 (exemplares E1 e E2) e o livro L2 (exemplares E3 a E6). */
export function criarBancoDeTeste(): Banco {
    const banco = new Database(":memory:")
    banco.pragma("foreign_keys = ON")
    banco.exec(SCHEMA_SQL)

    const usuario = banco.prepare("INSERT INTO usuarios (id, nome, email, senha_hash) VALUES (?, ?, ?, ?)")
    for (const id of ["U1", "U2", "U3", "U4"]) {
        usuario.run(id, `Usuário ${id}`, `${id.toLowerCase()}@exemplo.com`, "hash")
    }

    const livro = banco.prepare("INSERT INTO livros (id, isbn, titulo, autor, ano, genero) VALUES (?, ?, ?, ?, ?, ?)")
    livro.run("L1", "ISBN-1", "Dom Casmurro", "Machado de Assis", 1899, "Romance")
    livro.run("L2", "ISBN-2", "Quincas Borba", "Machado de Assis", 1891, "Romance")

    const exemplar = banco.prepare("INSERT INTO exemplares (id, livro_id, codigo) VALUES (?, ?, ?)")
    exemplar.run("E1", "L1", "TOMBO-1")
    exemplar.run("E2", "L1", "TOMBO-2")
    for (let i = 3; i <= 6; i++) {
        exemplar.run(`E${i}`, "L2", `TOMBO-${i}`)
    }
    return banco
}
