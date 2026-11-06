import type { Banco } from "../config/banco"
import { Acervo } from "../domain/exemplares"
import { criarAcervoInicial } from "./dados_inicias"

/* Grava no banco os livros e exemplares de um Acervo (tudo ou nada, numa transação). */
export function popularBanco(banco: Banco, acervo: Acervo): void {
    const inserirLivro = banco.prepare(
        "INSERT INTO livros (id, isbn, titulo, autor, ano, genero, sinopse, capa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    const inserirExemplar = banco.prepare(
        "INSERT INTO exemplares (id, livro_id, codigo, status) VALUES (?, ?, ?, ?)"
    )

    const gravar = banco.transaction(() => {
        for (const livro of acervo.listarLivros()) {
            inserirLivro.run(livro.id, livro.isbn, livro.titulo, livro.autor, livro.ano, livro.genero, livro.sinopse, livro.capa)
            for (const exemplar of acervo.obterExemplares(livro.id)) {
                inserirExemplar.run(exemplar.id, exemplar.livroId, exemplar.codigo, exemplar.status)
            }
        }
    })
    gravar()
}

/* Popula o banco com os dados iniciais, mas só se ele ainda estiver vazio.
Devolve true se populou. Assim reiniciar a API nunca duplica nem apaga dados. */
export function semearSeVazio(banco: Banco): boolean {
    const { total } = banco.prepare("SELECT COUNT(*) AS total FROM livros").get() as { total: number }
    if (total > 0) return false

    popularBanco(banco, criarAcervoInicial())
    return true
}
