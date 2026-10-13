import { describe, it, expect, beforeEach } from "vitest"
import {Livro} from "../models/livro";
import {Exemplar, Acervo, StatusExemplar} from '../models/exemplares';

const criar = (status?: StatusExemplar) => new Exemplar("E1", "L1", "TOMBO-001", status)

const statusNaoDisponiveis = [
    StatusExemplar.EMPRESTADO,
    StatusExemplar.RESERVADO,
    StatusExemplar.INDISPONIVEL,
]

describe("Exemplar", () => {
    describe("criação", () => {
        it("guarda id, livroId e código", () => {
            const e = criar()
            expect(e.id).toBe("E1")
            expect(e.livroId).toBe("L1")
            expect(e.codigo).toBe("TOMBO-001")
        })

        it("começa disponível por padrão", () => {
            const e = criar()
            expect(e.status).toBe(StatusExemplar.DISPONIVEL)
            expect(e.disponivel).toBe(true)
        })

        it.each(Object.values(StatusExemplar))("aceita status inicial %s", (status) => {
            expect(criar(status).status).toBe(status)
        })

        it("só é 'disponível' no status DISPONIVEL", () => {
            for (const status of statusNaoDisponiveis) {
                expect(criar(status).disponivel).toBe(false)
            }
        })

        it.each([
            ["id", () => new Exemplar("", "L1", "T1"), "O ID do exemplar é obrigatório."],
            ["id só com espaços", () => new Exemplar("  ", "L1", "T1"), "O ID do exemplar é obrigatório."],
            ["livroId", () => new Exemplar("E1", "", "T1"), "O exemplar deve estar vinculado a um livro."],
            ["livroId só com espaços", () => new Exemplar("E1", "  ", "T1"), "O exemplar deve estar vinculado a um livro."],
            ["código", () => new Exemplar("E1", "L1", ""), "O código do exemplar é obrigatório."],
            ["código só com espaços", () => new Exemplar("E1", "L1", "  "), "O código do exemplar é obrigatório."],
        ])("rejeita %s inválido", (_nome, criarInvalido, mensagem) => {
            expect(criarInvalido).toThrow(mensagem)
        })
    })

    describe("emprestar", () => {
        it("muda o status para EMPRESTADO", () => {
            const e = criar()
            e.emprestar()
            expect(e.status).toBe(StatusExemplar.EMPRESTADO)
            expect(e.disponivel).toBe(false)
        })

        it.each(statusNaoDisponiveis)("não empresta exemplar com status %s", (status) => {
            const e = criar(status)
            expect(() => e.emprestar()).toThrow("não está disponível para empréstimo")
            expect(e.status).toBe(status) // o status não pode mudar quando a operação falha
        })

        it("não empresta um exemplar marcado como indisponível", () => {
            const e = criar()
            e.marcarIndisponivel()
            expect(() => e.emprestar()).toThrow("não está disponível para empréstimo")
            expect(e.status).toBe(StatusExemplar.INDISPONIVEL)
        })

        it("mensagem de erro cita o código do exemplar", () => {
            const e = criar(StatusExemplar.EMPRESTADO)
            expect(() => e.emprestar()).toThrow("TOMBO-001")
        })
    })

    describe("devolver", () => {
        it("volta o exemplar emprestado para DISPONIVEL", () => {
            const e = criar()
            e.emprestar()
            e.devolver()
            expect(e.status).toBe(StatusExemplar.DISPONIVEL)
            expect(e.disponivel).toBe(true)
        })

        it.each([
            StatusExemplar.DISPONIVEL,
            StatusExemplar.RESERVADO,
            StatusExemplar.INDISPONIVEL,
        ])("não devolve exemplar com status %s", (status) => {
            const e = criar(status)
            expect(() => e.devolver()).toThrow("não está emprestado")
            expect(e.status).toBe(status)
        })

        it("permite novo empréstimo depois da devolução", () => {
            const e = criar()
            e.emprestar()
            e.devolver()
            e.emprestar()
            expect(e.status).toBe(StatusExemplar.EMPRESTADO)
        })
    })

    describe("marcarIndisponivel", () => {
        it("muda o status para INDISPONIVEL", () => {
            const e = criar()
            e.marcarIndisponivel()
            expect(e.status).toBe(StatusExemplar.INDISPONIVEL)
            expect(e.disponivel).toBe(false)
        })

        it("um exemplar indisponível também não pode ser devolvido", () => {
            const e = criar()
            e.marcarIndisponivel()
            expect(() => e.devolver()).toThrow("não está emprestado")
        })
    })
})