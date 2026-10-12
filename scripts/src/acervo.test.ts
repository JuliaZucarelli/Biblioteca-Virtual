import { describe, it, expect, beforeEach } from "vitest"
import {Livro} from "./models/livro";
import {Exemplar, Acervo, StatusExemplar} from './models/exemplares';

const criarLivro = (id = "L1") =>
    new Livro(id, "Dom Casmurro", "Machado de Assis", "9788535902778", 1899, "Romance", "Bentinho e Capitu.")

describe("Livro", () => {
    it("cria um livro válido", () => {
        expect(criarLivro().titulo).toBe("Dom Casmurro")
    })

    it("rejeita título vazio", () => {
        expect(() => new Livro("L1", "  ", "Autor", "123", 2000, "Romance", "")).toThrow("título")
    })

    it("rejeita ano inválido", () => {
        expect(() => new Livro("L1", "T", "A", "123", -5, "Romance", "")).toThrow("ano")
        expect(() => new Livro("L1", "T", "A", "123", 2000.5, "Romance", "")).toThrow("ano")
    })
})

describe("Exemplar", () => {
    it("começa disponível por padrão", () => {
        const e = new Exemplar("E1", "L1", "TOMBO-001")
        expect(e.status).toBe(StatusExemplar.DISPONIVEL)
        expect(e.disponivel).toBe(true)
    })

    it("empresta e devolve", () => {
        const e = new Exemplar("E1", "L1", "TOMBO-001")
        e.emprestar()
        expect(e.status).toBe(StatusExemplar.EMPRESTADO)
        e.devolver()
        expect(e.disponivel).toBe(true)
    })

    it("não empresta duas vezes", () => {
        const e = new Exemplar("E1", "L1", "TOMBO-001")
        e.emprestar()
        expect(() => e.emprestar()).toThrow("não está disponível")
    })

    it("não devolve o que não está emprestado", () => {
        const e = new Exemplar("E1", "L1", "TOMBO-001")
        expect(() => e.devolver()).toThrow("não está emprestado")
    })

    it("exige livroId", () => {
        expect(() => new Exemplar("E1", "", "TOMBO-001")).toThrow("vinculado")
    })
})

describe("Acervo", () => {
    let acervo: Acervo

    beforeEach(() => {
        acervo = new Acervo()
        acervo.adicionarLivro(criarLivro("L1"))
    })

    it("não aceita exemplar de livro inexistente", () => {
        expect(() => acervo.adicionarExemplares(new Exemplar("E1", "L999", "T1"))).toThrow("não encontrado")
    })

    it("não aceita livro com ID duplicado", () => {
        expect(() => acervo.adicionarLivro(criarLivro("L1"))).toThrow("Já existe")
    })

    it("conta exemplares totais e disponíveis", () => {
        const e1 = new Exemplar("E1", "L1", "T1")
        const e2 = new Exemplar("E2", "L1", "T2")
        acervo.adicionarExemplares(e1)
        acervo.adicionarExemplares(e2)

        expect(acervo.quantidadeTotal("L1")).toBe(2)
        expect(acervo.quantidadeDisponivel("L1")).toBe(2)

        e1.emprestar()
        expect(acervo.quantidadeDisponivel("L1")).toBe(1)
        expect(acervo.livroDisponivel("L1")).toBe(true)

        e2.emprestar()
        expect(acervo.livroDisponivel("L1")).toBe(false)
    })

    it("livro sem exemplares não está disponível", () => {
        expect(acervo.livroDisponivel("L1")).toBe(false)
    })
})