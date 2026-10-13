import { describe, it, expect, beforeEach } from "vitest"
import {Livro} from "../models/livro";
import {Exemplar, Acervo, StatusExemplar} from '../models/exemplares';


const criarLivro = (id = "L1", titulo = "Dom Casmurro") =>
    new Livro(id, titulo, "Machado de Assis", `ISBN-${id}`, 1899, "Romance", "Sinopse.")

const criarExemplar = (id: string, livroId = "L1", codigo = `TOMBO-${id}`) =>
    new Exemplar(id, livroId, codigo)

describe("Acervo", () => {
    let acervo: Acervo

    beforeEach(() => {
        acervo = new Acervo()
    })

    describe("livros", () => {
        it("começa vazio", () => {
            expect(acervo.listarLivros()).toEqual([])
        })

        it("adiciona, lista e obtém livros", () => {
            const livro = criarLivro("L1")
            acervo.adicionarLivro(livro)
            acervo.adicionarLivro(criarLivro("L2", "Outro"))

            expect(acervo.listarLivros()).toHaveLength(2)
            expect(acervo.obterLivro("L1")).toBe(livro)
        })

        it("retorna undefined ao obter livro inexistente", () => {
            expect(acervo.obterLivro("L999")).toBeUndefined()
        })

        it("não aceita livro com ID duplicado", () => {
            acervo.adicionarLivro(criarLivro("L1"))
            expect(() => acervo.adicionarLivro(criarLivro("L1"))).toThrow("Já existe um livro com o ID")
            expect(acervo.listarLivros()).toHaveLength(1)
        })

        it("listarLivros devolve uma cópia (alterar a lista não altera o acervo)", () => {
            acervo.adicionarLivro(criarLivro("L1"))
            acervo.listarLivros().pop()
            expect(acervo.listarLivros()).toHaveLength(1)
        })
    })

    describe("exemplares", () => {
        beforeEach(() => {
            acervo.adicionarLivro(criarLivro("L1"))
            acervo.adicionarLivro(criarLivro("L2", "Outro"))
        })

        it("adiciona exemplares e os associa ao livro correto", () => {
            acervo.adicionarExemplares(criarExemplar("E1", "L1"))
            acervo.adicionarExemplares(criarExemplar("E2", "L1"))
            acervo.adicionarExemplares(criarExemplar("E3", "L2"))

            expect(acervo.obterExemplares("L1").map(e => e.id)).toEqual(["E1", "E2"])
            expect(acervo.obterExemplares("L2").map(e => e.id)).toEqual(["E3"])
        })

        it("não aceita exemplar de livro inexistente", () => {
            expect(() => acervo.adicionarExemplares(criarExemplar("E1", "L999"))).toThrow("não encontrado")
        })

        it("não aceita dois exemplares com o mesmo ID", () => {
            acervo.adicionarExemplares(criarExemplar("E1", "L1", "T1"))
            expect(() => acervo.adicionarExemplares(criarExemplar("E1", "L1", "T2")))
                .toThrow("Já existe um exemplar com o ID")
            expect(acervo.quantidadeTotal("L1")).toBe(1)
        })

        it("não aceita dois exemplares com o mesmo código de tombo", () => {
            acervo.adicionarExemplares(criarExemplar("E1", "L1", "TOMBO-001"))
            expect(() => acervo.adicionarExemplares(criarExemplar("E2", "L1", "TOMBO-001")))
                .toThrow("código de tombo")
            expect(acervo.quantidadeTotal("L1")).toBe(1)
        })

        it("o código de tombo é único no acervo inteiro, mesmo entre livros diferentes", () => {
            acervo.adicionarExemplares(criarExemplar("E1", "L1", "TOMBO-001"))
            expect(() => acervo.adicionarExemplares(criarExemplar("E2", "L2", "TOMBO-001")))
                .toThrow("código de tombo")
            expect(acervo.quantidadeTotal("L2")).toBe(0)
        })

        it("ignora maiúsculas/minúsculas e espaços nas pontas ao comparar tombos", () => {
            acervo.adicionarExemplares(criarExemplar("E1", "L1", "TOMBO-001"))
            expect(() => acervo.adicionarExemplares(criarExemplar("E2", "L1", "  tombo-001 ")))
                .toThrow("código de tombo")
        })

        it("um cadastro recusado não deixa rastro (o tombo continua livre)", () => {
            // E1 é recusado por ID duplicado; o tombo "T2" não pode ficar reservado por causa disso.
            acervo.adicionarExemplares(criarExemplar("E1", "L1", "T1"))
            expect(() => acervo.adicionarExemplares(criarExemplar("E1", "L1", "T2"))).toThrow()
            expect(() => acervo.adicionarExemplares(criarExemplar("E2", "L1", "T2"))).not.toThrow()
        })
    })

    describe("livro inexistente ou sem exemplares", () => {
        beforeEach(() => {
            acervo.adicionarLivro(criarLivro("L1"))
        })

        it("livro inexistente não retorna exemplares", () => {
            expect(acervo.obterExemplares("L999")).toEqual([])
            expect(acervo.quantidadeTotal("L999")).toBe(0)
            expect(acervo.quantidadeDisponivel("L999")).toBe(0)
            expect(acervo.livroDisponivel("L999")).toBe(false)
        })

        it("livro existente sem exemplares também retorna lista vazia", () => {
            expect(acervo.obterExemplares("L1")).toEqual([])
            expect(acervo.quantidadeTotal("L1")).toBe(0)
            expect(acervo.livroDisponivel("L1")).toBe(false)
        })
    })

    describe("disponibilidade", () => {
        let e1: Exemplar
        let e2: Exemplar

        beforeEach(() => {
            acervo.adicionarLivro(criarLivro("L1"))
            e1 = criarExemplar("E1")
            e2 = criarExemplar("E2")
            acervo.adicionarExemplares(e1)
            acervo.adicionarExemplares(e2)
        })

        it("conta totais e disponíveis conforme o status dos exemplares", () => {
            expect(acervo.quantidadeTotal("L1")).toBe(2)
            expect(acervo.quantidadeDisponivel("L1")).toBe(2)

            e1.emprestar()
            expect(acervo.quantidadeTotal("L1")).toBe(2)
            expect(acervo.quantidadeDisponivel("L1")).toBe(1)
            expect(acervo.livroDisponivel("L1")).toBe(true)
        })

        it("livro fica indisponível quando todos os exemplares saem de circulação", () => {
            e1.emprestar()
            e2.marcarIndisponivel()
            expect(acervo.quantidadeDisponivel("L1")).toBe(0)
            expect(acervo.livroDisponivel("L1")).toBe(false)
        })

        it("devolver um exemplar torna o livro disponível de novo", () => {
            e1.emprestar()
            e2.emprestar()
            expect(acervo.livroDisponivel("L1")).toBe(false)
            e1.devolver()
            expect(acervo.livroDisponivel("L1")).toBe(true)
        })
    })

    describe("isolamento entre acervos", () => {
        it("adicionar dados em um acervo não afeta o outro", () => {
            const a = new Acervo()
            const b = new Acervo()
            a.adicionarLivro(criarLivro("L1"))
            a.adicionarExemplares(criarExemplar("E1"))

            expect(b.listarLivros()).toEqual([])
            expect(b.obterExemplares("L1")).toEqual([])
        })

        it("modificar livros e exemplares de um acervo não afeta o outro", () => {
            const a = new Acervo()
            const b = new Acervo()
            a.adicionarLivro(criarLivro("L1"))
            b.adicionarLivro(criarLivro("L1"))
            const exemplarA = criarExemplar("E1")
            a.adicionarExemplares(exemplarA)
            b.adicionarExemplares(criarExemplar("E1"))

            exemplarA.emprestar()
            a.obterLivro("L1")!.titulo = "Título alterado"

            expect(a.livroDisponivel("L1")).toBe(false)
            expect(b.livroDisponivel("L1")).toBe(true)
            expect(b.obterLivro("L1")!.titulo).toBe("Dom Casmurro")
        })

        it("mesmo ID e mesmo tombo podem existir em acervos diferentes", () => {
            const a = new Acervo()
            const b = new Acervo()
            a.adicionarLivro(criarLivro("L1"))
            b.adicionarLivro(criarLivro("L1"))
            a.adicionarExemplares(criarExemplar("E1", "L1", "TOMBO-001"))
            expect(() => b.adicionarExemplares(criarExemplar("E1", "L1", "TOMBO-001"))).not.toThrow()
        })
    })
})
