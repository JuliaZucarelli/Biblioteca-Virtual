import { describe, it, expect, beforeEach } from "vitest"
import { abrirBanco, Banco } from "../config/banco"
import { popularBanco, semearSeVazio } from "../database/seed"
import { criarAcervoInicial } from "../database/dados_inicias"

describe("Banco SQLite", () => {
    let banco: Banco

    beforeEach(() => {
        banco = abrirBanco(":memory:")
    })

    const contar = (tabela: string): number =>
        (banco.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get() as { n: number }).n

    it("cria todas as tabelas do esquema", () => {
        const tabelas = (banco.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as { name: string }[])
            .map(t => t.name)
        expect(tabelas).toEqual(expect.arrayContaining(["usuarios", "livros", "exemplares", "emprestimos", "reservas"]))
    })

    it("semearSeVazio popula um banco vazio", () => {
        expect(semearSeVazio(banco)).toBe(true)
        expect(contar("livros")).toBe(9)
        expect(contar("exemplares")).toBe(criarTotalExemplares())
    })

    it("semearSeVazio não duplica dados ao rodar de novo", () => {
        semearSeVazio(banco)
        expect(semearSeVazio(banco)).toBe(false)
        expect(contar("livros")).toBe(9)
    })

    it("não aceita dois livros com o mesmo ISBN", () => {
        const acervo = criarAcervoInicial()
        const insere = () => banco.prepare(
            "INSERT INTO livros (id, isbn, titulo, autor, ano, genero) VALUES (?, ?, 'x', 'y', 2000, 'z')"
        )
        const l1 = acervo.obterLivro("L01")!
        insere().run("A1", l1.isbn)
        expect(() => insere().run("A2", l1.isbn)).toThrow(/UNIQUE/)
    })

    it("não aceita exemplar de um livro que não existe (chave estrangeira)", () => {
        expect(() =>
            banco.prepare("INSERT INTO exemplares (id, livro_id, codigo) VALUES ('E1', 'NAO-EXISTE', 'T1')").run()
        ).toThrow(/FOREIGN KEY/)
    })

    it("não aceita dois exemplares com o mesmo tombo, mesmo trocando maiúsculas", () => {
        popularBanco(banco, criarAcervoInicial())
        expect(() =>
            banco.prepare("INSERT INTO exemplares (id, livro_id, codigo) VALUES ('E999', 'L01', 'tombo-001')").run()
        ).toThrow(/UNIQUE/)
    })

    it("não aceita status de exemplar inválido", () => {
        popularBanco(banco, criarAcervoInicial())
        expect(() =>
            banco.prepare("INSERT INTO exemplares (id, livro_id, codigo, status) VALUES ('E998', 'L01', 'T998', 'QUEBRADO')").run()
        ).toThrow(/CHECK/)
    })

    it("popularBanco desfaz tudo se algo falhar (transação)", () => {
        popularBanco(banco, criarAcervoInicial())
        expect(() => popularBanco(banco, criarAcervoInicial())).toThrow() // ids repetidos
        expect(contar("livros")).toBe(9)
    })
})

function criarTotalExemplares(): number {
    const acervo = criarAcervoInicial()
    return acervo.listarLivros().reduce((soma, l) => soma + acervo.quantidadeTotal(l.id), 0)
}
