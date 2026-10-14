import { describe, it, expect } from "vitest"
import { Livro } from "../models/livro"
import { Exemplar, Acervo, StatusExemplar } from "../models/exemplares"
import { RegrasEmprestimo, REGRAS_PADRAO } from "../models/emprestimo"
import { ServicoEmprestimos } from "../models/servicos-emprestimos"

// dia(0) = 01/10/2026 10:00; dia(14) = 15/10/2026 (dia do vencimento de um empréstimo feito no dia 0)
const dia = (n: number, hora = 10) => new Date(2026, 9, 1 + n, hora, 0)

function montar(regras: Partial<RegrasEmprestimo> = {}) {
    const acervo = new Acervo()
    acervo.adicionarLivro(new Livro("L1", "Dom Casmurro", "Machado de Assis", "ISBN-1", 1899, "Romance", "Sinopse."))
    for (let i = 1; i <= 6; i++) {
        acervo.adicionarExemplares(new Exemplar(`E${i}`, "L1", `TOMBO-${i}`))
    }
    const relogio = { agora: dia(0) }
    const servico = new ServicoEmprestimos(acervo, { ...REGRAS_PADRAO, ...regras }, () => new Date(relogio.agora))
    return { acervo, servico, relogio }
}

describe("ServicoEmprestimos", () => {
    it("as regras padrão são: 3 empréstimos, 14 dias, R$ 0,50 por dia, 2 renovações", () => {
        expect(REGRAS_PADRAO).toEqual({
            limitePorUsuario: 3,
            prazoDias: 14,
            multaPorDiaCentavos: 50,
            maxRenovacoes: 2,
        })
    })

    describe("emprestar", () => {
        it("registra o empréstimo com vencimento em 14 dias", () => {
            const { servico } = montar()
            const e = servico.emprestar("U1", "E1")
            expect(e.id).toBe("EMP-001")
            expect(e.usuarioId).toBe("U1")
            expect(e.exemplarId).toBe("E1")
            expect(e.dataEmprestimo).toEqual(dia(0))
            expect(e.dataVencimento).toEqual(dia(14))
            expect(e.ativo).toBe(true)
        })

        it("marca o exemplar como emprestado", () => {
            const { servico, acervo } = montar()
            servico.emprestar("U1", "E1")
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.EMPRESTADO)
            expect(acervo.quantidadeDisponivel("L1")).toBe(5)
        })

        it("gera IDs sequenciais", () => {
            const { servico } = montar()
            expect(servico.emprestar("U1", "E1").id).toBe("EMP-001")
            expect(servico.emprestar("U1", "E2").id).toBe("EMP-002")
        })

        it("respeita o prazo configurado", () => {
            const { servico } = montar({ prazoDias: 7 })
            expect(servico.emprestar("U1", "E1").dataVencimento).toEqual(dia(7))
        })

        it("rejeita usuário vazio", () => {
            const { servico } = montar()
            expect(() => servico.emprestar("  ", "E1")).toThrow("O usuário é obrigatório.")
        })

        it("rejeita exemplar inexistente", () => {
            const { servico } = montar()
            expect(() => servico.emprestar("U1", "E999")).toThrow("não encontrado")
        })

        it("não empresta um exemplar já emprestado a outra pessoa", () => {
            const { servico } = montar()
            servico.emprestar("U1", "E1")
            expect(() => servico.emprestar("U2", "E1")).toThrow("não está disponível")
            expect(servico.listarAtivosDoUsuario("U2")).toEqual([])
        })

        it("não empresta um exemplar indisponível", () => {
            const { servico, acervo } = montar()
            acervo.obterExemplar("E1")!.marcarIndisponivel()
            expect(() => servico.emprestar("U1", "E1")).toThrow("não está disponível")
            expect(servico.listarAtivosDoUsuario("U1")).toEqual([])
        })
    })

    describe("limite de empréstimos por usuário", () => {
        it("permite 3 empréstimos e bloqueia o 4º", () => {
            const { servico } = montar()
            servico.emprestar("U1", "E1")
            servico.emprestar("U1", "E2")
            servico.emprestar("U1", "E3")
            expect(() => servico.emprestar("U1", "E4")).toThrow("limite de 3 empréstimos")
            expect(servico.listarAtivosDoUsuario("U1")).toHaveLength(3)
        })

        it("o empréstimo bloqueado pelo limite não consome o exemplar", () => {
            const { servico, acervo } = montar()
            servico.emprestar("U1", "E1")
            servico.emprestar("U1", "E2")
            servico.emprestar("U1", "E3")
            expect(() => servico.emprestar("U1", "E4")).toThrow()
            expect(acervo.obterExemplar("E4")!.disponivel).toBe(true)
        })

        it("o limite vale por usuário", () => {
            const { servico } = montar()
            servico.emprestar("U1", "E1")
            servico.emprestar("U1", "E2")
            servico.emprestar("U1", "E3")
            expect(() => servico.emprestar("U2", "E4")).not.toThrow()
        })

        it("devolver um livro libera uma vaga", () => {
            const { servico } = montar()
            const primeiro = servico.emprestar("U1", "E1")
            servico.emprestar("U1", "E2")
            servico.emprestar("U1", "E3")
            servico.devolver(primeiro.id)
            expect(() => servico.emprestar("U1", "E4")).not.toThrow()
        })

        it("respeita o limite configurado", () => {
            const { servico } = montar({ limitePorUsuario: 1 })
            servico.emprestar("U1", "E1")
            expect(() => servico.emprestar("U1", "E2")).toThrow("limite de 1 empréstimos")
        })
    })

    describe("devolver e multa por atraso", () => {
        it("devolução no prazo não gera multa", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(10)
            const resultado = servico.devolver(e.id)
            expect(resultado.diasDeAtraso).toBe(0)
            expect(resultado.multaCentavos).toBe(0)
        })

        it("devolução no próprio dia do vencimento não gera multa", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(14, 23)
            expect(servico.devolver(e.id).multaCentavos).toBe(0)
        })

        it("1 dia de atraso gera R$ 0,50", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(15)
            const resultado = servico.devolver(e.id)
            expect(resultado.diasDeAtraso).toBe(1)
            expect(resultado.multaCentavos).toBe(50)
        })

        it("10 dias de atraso geram R$ 5,00", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(24)
            const resultado = servico.devolver(e.id)
            expect(resultado.diasDeAtraso).toBe(10)
            expect(resultado.multaCentavos).toBe(500)
        })

        it("respeita o valor de multa configurado", () => {
            const { servico, relogio } = montar({ multaPorDiaCentavos: 100 })
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(17)
            expect(servico.devolver(e.id).multaCentavos).toBe(300)
        })

        it("devolve o exemplar ao acervo e encerra o empréstimo", () => {
            const { servico, acervo, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(5)
            servico.devolver(e.id)
            expect(acervo.obterExemplar("E1")!.disponivel).toBe(true)
            expect(e.ativo).toBe(false)
            expect(e.dataDevolucao).toEqual(dia(5))
        })

        it("não devolve duas vezes o mesmo empréstimo", () => {
            const { servico } = montar()
            const e = servico.emprestar("U1", "E1")
            servico.devolver(e.id)
            expect(() => servico.devolver(e.id)).toThrow("já foi encerrado")
        })

        it("rejeita empréstimo inexistente", () => {
            const { servico } = montar()
            expect(() => servico.devolver("EMP-999")).toThrow("não encontrado")
        })
    })

    describe("calcularMulta", () => {
        it("é zero antes do vencimento", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(10)
            expect(servico.calcularMulta(e.id)).toBe(0)
        })

        it("cresce a cada dia de atraso enquanto o livro não é devolvido", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(15)
            expect(servico.calcularMulta(e.id)).toBe(50)
            relogio.agora = dia(20)
            expect(servico.calcularMulta(e.id)).toBe(300)
        })

        it("fica fixa depois da devolução", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(16)
            servico.devolver(e.id)
            relogio.agora = dia(60)
            expect(servico.calcularMulta(e.id)).toBe(100)
        })

        it("rejeita empréstimo inexistente", () => {
            const { servico } = montar()
            expect(() => servico.calcularMulta("EMP-999")).toThrow("não encontrado")
        })
    })

    describe("renovar", () => {
        it("estende o prazo em 14 dias a partir da data da renovação", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(10)
            servico.renovar(e.id)
            expect(e.dataVencimento).toEqual(dia(24))
            expect(e.renovacoes).toBe(1)
        })

        it("pode ser renovado no próprio dia do vencimento", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(14, 18)
            expect(() => servico.renovar(e.id)).not.toThrow()
        })

        it("não mexe no status do exemplar nem no limite do usuário", () => {
            const { servico, acervo } = montar()
            const e = servico.emprestar("U1", "E1")
            servico.renovar(e.id)
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.EMPRESTADO)
            expect(servico.listarAtivosDoUsuario("U1")).toHaveLength(1)
        })

        it("permite até 2 renovações e bloqueia a 3ª", () => {
            const { servico } = montar()
            const e = servico.emprestar("U1", "E1")
            servico.renovar(e.id)
            servico.renovar(e.id)
            expect(() => servico.renovar(e.id)).toThrow("limite de renovações (2)")
            expect(e.renovacoes).toBe(2)
        })

        it("respeita o limite de renovações configurado", () => {
            const { servico } = montar({ maxRenovacoes: 1 })
            const e = servico.emprestar("U1", "E1")
            servico.renovar(e.id)
            expect(() => servico.renovar(e.id)).toThrow("limite de renovações (1)")
        })

        it("com 0 renovações permitidas, nunca renova", () => {
            const { servico } = montar({ maxRenovacoes: 0 })
            const e = servico.emprestar("U1", "E1")
            expect(() => servico.renovar(e.id)).toThrow("limite de renovações (0)")
        })

        it("não renova empréstimo em atraso, mesmo com renovações disponíveis", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(15)
            expect(() => servico.renovar(e.id)).toThrow("em atraso")
            expect(e.renovacoes).toBe(0)
            expect(e.dataVencimento).toEqual(dia(14))
        })

        it("não renova empréstimo já devolvido", () => {
            const { servico } = montar()
            const e = servico.emprestar("U1", "E1")
            servico.devolver(e.id)
            expect(() => servico.renovar(e.id)).toThrow("já encerrado")
        })

        it("rejeita empréstimo inexistente", () => {
            const { servico } = montar()
            expect(() => servico.renovar("EMP-999")).toThrow("não encontrado")
        })

        it("renovar evita a multa: devolver dentro do novo prazo não gera atraso", () => {
            const { servico, relogio } = montar()
            const e = servico.emprestar("U1", "E1")
            relogio.agora = dia(14)
            servico.renovar(e.id)
            relogio.agora = dia(20)
            expect(servico.devolver(e.id).multaCentavos).toBe(0)
        })
    })

    describe("consultas", () => {
        it("obterEmprestimo retorna o empréstimo ou undefined", () => {
            const { servico } = montar()
            const e = servico.emprestar("U1", "E1")
            expect(servico.obterEmprestimo(e.id)).toBe(e)
            expect(servico.obterEmprestimo("EMP-999")).toBeUndefined()
        })

        it("listarAtivosDoUsuario ignora empréstimos devolvidos e de outros usuários", () => {
            const { servico } = montar()
            const devolvido = servico.emprestar("U1", "E1")
            const ativo = servico.emprestar("U1", "E2")
            servico.emprestar("U2", "E3")
            servico.devolver(devolvido.id)
            expect(servico.listarAtivosDoUsuario("U1")).toEqual([ativo])
        })

        it("listarAtrasados retorna só os ativos e vencidos", () => {
            const { servico, relogio } = montar()
            const vencido = servico.emprestar("U1", "E1")
            relogio.agora = dia(5)
            const emDia = servico.emprestar("U1", "E2")
            const devolvidoAtrasado = servico.emprestar("U2", "E3")

            relogio.agora = dia(15)
            servico.devolver(devolvidoAtrasado.id)

            expect(servico.listarAtrasados()).toEqual([vencido])
            expect(servico.listarAtrasados()).not.toContain(emDia)
        })
    })

    describe("relógio padrão", () => {
        it("usa a data real quando nenhum relógio é informado", () => {
            const acervo = new Acervo()
            acervo.adicionarLivro(new Livro("L1", "T", "A", "I", 2000, "G", ""))
            acervo.adicionarExemplares(new Exemplar("E1", "L1", "T1"))
            const servico = new ServicoEmprestimos(acervo)

            const antes = Date.now()
            const e = servico.emprestar("U1", "E1")
            expect(e.dataEmprestimo.getTime()).toBeGreaterThanOrEqual(antes)
            expect(e.dataEmprestimo.getTime()).toBeLessThanOrEqual(Date.now())
        })
    })

    describe("isolamento", () => {
        it("serviços sobre acervos diferentes não compartilham empréstimos", () => {
            const a = montar()
            const b = montar()
            a.servico.emprestar("U1", "E1")
            expect(b.servico.listarAtivosDoUsuario("U1")).toEqual([])
            expect(b.acervo.obterExemplar("E1")!.disponivel).toBe(true)
        })
    })
})