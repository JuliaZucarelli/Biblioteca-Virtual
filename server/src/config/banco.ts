import Database from "better-sqlite3"
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { SCHEMA_SQL } from "../database/schema"

export type Banco = Database.Database

/* Abre (ou cria) o banco SQLite e garante que as tabelas existam.
Use ":memory:" nos testes para um banco temporário, que some ao fechar. */
export function abrirBanco(caminho: string = ":memory:"): Banco {
    if (caminho !== ":memory:") {
        mkdirSync(dirname(caminho), { recursive: true })
    }

    const banco = new Database(caminho)
    banco.pragma("foreign_keys = ON") // o SQLite só respeita chaves estrangeiras se isso estiver ligado
    banco.exec(SCHEMA_SQL)
    return banco
}
