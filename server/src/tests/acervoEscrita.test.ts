import { describe, it, expect } from "vitest"
import { criarAcervoInicial } from "../database/dados_inicias"
import { Livro } from "../domain/livro"

describe("Acervo: alteração e remoção", () => {
    it("atualizarLivro substitui os dados e preserva os exemplares", () => {
        const acervo = criarAcervoInicial()
        acervo.atualizarLivro(new Livro("L01", "Outro título", "Outro autor", "9780000000019", 1900, "Drama", ""))
        expect(acervo.obterLivro("L01")?.titulo).toBe("Outro título")
        expect(acervo.quantidadeTotal("L01")).toBe(3)
    })

    it("atualizarLivro falha para livro inexistente", () => {
        const acervo = criarAcervoInicial()
        expect(() => acervo.atualizarLivro(new Livro("L99", "x", "y", "9780000000999", 2000, "z", ""))).toThrow("não encontrado")
    })

    it("removerLivro apaga o livro e todos os exemplares dele", () => {
        const acervo = criarAcervoInicial()
        acervo.removerLivro("L01")
        expect(acervo.obterLivro("L01")).toBeUndefined()
        expect(acervo.obterExemplares("L01")).toEqual([])
        expect(acervo.obterExemplar("E001")).toBeUndefined()
    })

    it("removerLivro libera os códigos de tombo dos exemplares apagados", () => {
        const acervo = criarAcervoInicial()
        expect(acervo.existeTombo("TOMBO-001")).toBe(true)
        acervo.removerLivro("L01")
        expect(acervo.existeTombo("TOMBO-001")).toBe(false)
    })

    it("removerLivro não mexe nos outros livros", () => {
        const acervo = criarAcervoInicial()
        acervo.removerLivro("L01")
        expect(acervo.listarLivros()).toHaveLength(8)
        expect(acervo.quantidadeTotal("L02")).toBe(2)
    })

    it("removerLivro falha para livro inexistente", () => {
        expect(() => criarAcervoInicial().removerLivro("L99")).toThrow("não encontrado")
    })

    it("removerExemplar apaga só aquele exemplar e libera o tombo", () => {
        const acervo = criarAcervoInicial()
        acervo.removerExemplar("E001")
        expect(acervo.quantidadeTotal("L01")).toBe(2)
        expect(acervo.existeTombo("TOMBO-001")).toBe(false)
        expect(acervo.existeTombo("TOMBO-002")).toBe(true)
    })

    it("removerExemplar falha para exemplar inexistente", () => {
        expect(() => criarAcervoInicial().removerExemplar("E999")).toThrow("não encontrado")
    })

    it("existeTombo ignora maiúsculas e espaços", () => {
        const acervo = criarAcervoInicial()
        expect(acervo.existeTombo("  tombo-001 ")).toBe(true)
        expect(acervo.existeTombo("TOMBO-999")).toBe(false)
    })
})
