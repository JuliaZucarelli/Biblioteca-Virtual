import { describe, it, expect } from "vitest"
import { Livro } from "../domain/livro"
import { Exemplar, Acervo, StatusExemplar } from "../domain/exemplares"
import { REGRAS_PADRAO, type RegrasEmprestimo } from "../domain/emprestimo"
import { ErroConflito, ErroNaoAutenticado, ErroNaoEncontrado, ErroProibido, ErroValidacao } from "../domain/erros"
import { StatusReserva } from "../domain/reserva"
import { RepositorioEmprestimosMemoria } from "../repositories/repositorio-emprestimos"
import { ServicoCirculacao } from "../services/servico-circulacao"

// dia(0) = 01/10/2026 10:00; dia(14) = 15/10/2026 (vencimento de um empréstimo feito no dia 0)
const dia = (n: number, hora = 10) => new Date(2026, 9, 1 + n, hora, 0)

/* Livro L1 com 2 exemplares (E1, E2) e livro L2 com 4 (E3..E6), usuários U1..U4. */
function montar(regras: Partial<RegrasEmprestimo> = {}) {
    const acervo = new Acervo()
    acervo.adicionarLivro(new Livro("L1", "Dom Casmurro", "Machado de Assis", "ISBN-1", 1899, "Romance", "Sinopse."))
    acervo.adicionarLivro(new Livro("L2", "Quincas Borba", "Machado de Assis", "ISBN-2", 1891, "Romance", "Sinopse."))
    acervo.adicionarExemplares(new Exemplar("E1", "L1", "TOMBO-1"))
    acervo.adicionarExemplares(new Exemplar("E2", "L1", "TOMBO-2"))
    for (let i = 3; i <= 6; i++) {
        acervo.adicionarExemplares(new Exemplar(`E${i}`, "L2", `TOMBO-${i}`))
    }
    const repositorio = new RepositorioEmprestimosMemoria(acervo, ["U1", "U2", "U3", "U4"])
    const relogio = { agora: dia(0) }
    const servico = new ServicoCirculacao(repositorio, { ...REGRAS_PADRAO, ...regras }, () => new Date(relogio.agora))
    return { acervo, repositorio, servico, relogio }
}

// deixa os dois exemplares de L1 emprestados (U1 com E1, U2 com E2)
async function esgotarL1(servico: ServicoCirculacao) {
    const e1 = await servico.emprestar("U1", "E1")
    const e2 = await servico.emprestar("U2", "E2")
    return { e1, e2 }
}

describe("ServicoCirculacao", () => {
    describe("emprestar", () => {
        it("registra o empréstimo com vencimento em 14 dias e marca a unidade como emprestada", async () => {
            const { servico, acervo } = montar()
            const e = await servico.emprestar("U1", "E1")
            expect(e.id).toBe("EMP-001")
            expect(e.usuarioId).toBe("U1")
            expect(e.livroId).toBe("L1")
            expect(e.livroTitulo).toBe("Dom Casmurro")
            expect(e.dataEmprestimo).toBe(dia(0).toISOString())
            expect(e.dataVencimento).toBe(dia(14).toISOString())
            expect(e.dataDevolucao).toBeNull()
            expect(e.ativo).toBe(true)
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.EMPRESTADO)
            expect(acervo.quantidadeDisponivel("L1")).toBe(1)
        })

        it("gera IDs sequenciais", async () => {
            const { servico } = montar()
            expect((await servico.emprestar("U1", "E3")).id).toBe("EMP-001")
            expect((await servico.emprestar("U1", "E4")).id).toBe("EMP-002")
        })

        it("rejeita dados inválidos, usuário desconhecido e exemplar inexistente", async () => {
            const { servico } = montar()
            await expect(servico.emprestar("  ", "E1")).rejects.toThrow(ErroValidacao)
            await expect(servico.emprestar("U1", undefined as unknown as string)).rejects.toThrow(ErroValidacao)
            await expect(servico.emprestar("U99", "E1")).rejects.toThrow(ErroNaoAutenticado)
            await expect(servico.emprestar("U1", "E999")).rejects.toThrow(ErroNaoEncontrado)
        })

        it("não empresta uma unidade já emprestada ou indisponível", async () => {
            const { servico, acervo } = montar()
            await servico.emprestar("U1", "E1")
            await expect(servico.emprestar("U2", "E1")).rejects.toThrow(ErroConflito)
            expect(await servico.listarEmprestimos("U2")).toEqual([])

            acervo.obterExemplar("E2")!.marcarIndisponivel()
            await expect(servico.emprestar("U2", "E2")).rejects.toThrow("não está disponível")
        })
    })

    describe("limite de empréstimos por usuário", () => {
        it("permite 3 empréstimos e bloqueia o 4º sem consumir a unidade", async () => {
            const { servico, acervo } = montar()
            await servico.emprestar("U1", "E3")
            await servico.emprestar("U1", "E4")
            await servico.emprestar("U1", "E5")
            await expect(servico.emprestar("U1", "E6")).rejects.toThrow("limite de 3 empréstimos")
            expect(await servico.listarEmprestimos("U1", "ativos")).toHaveLength(3)
            expect(acervo.obterExemplar("E6")!.disponivel).toBe(true)
        })

        it("o limite vale por usuário e devolver libera uma vaga", async () => {
            const { servico } = montar()
            const primeiro = await servico.emprestar("U1", "E3")
            await servico.emprestar("U1", "E4")
            await servico.emprestar("U1", "E5")
            await expect(servico.emprestar("U2", "E6")).resolves.toBeDefined()
            await servico.devolver("U1", primeiro.id)
            await expect(servico.emprestar("U1", "E3")).resolves.toBeDefined()
        })
    })

    describe("devolver e multa", () => {
        it("devolução no prazo e no dia do vencimento não gera multa", async () => {
            const { servico, relogio } = montar()
            const a = await servico.emprestar("U1", "E3")
            const b = await servico.emprestar("U1", "E4")
            relogio.agora = dia(10)
            expect((await servico.devolver("U1", a.id)).multaCentavos).toBe(0)
            relogio.agora = dia(14, 23)
            const resultado = await servico.devolver("U1", b.id)
            expect(resultado.diasDeAtraso).toBe(0)
            expect(resultado.multaCentavos).toBe(0)
        })

        it("5 dias de atraso geram R$ 2,50 e a multa fica fixa depois da devolução", async () => {
            const { servico, relogio } = montar()
            const e = await servico.emprestar("U1", "E3")
            relogio.agora = dia(19)
            const resultado = await servico.devolver("U1", e.id)
            expect(resultado.diasDeAtraso).toBe(5)
            expect(resultado.multaCentavos).toBe(250)
            expect(resultado.emprestimo.ativo).toBe(false)
            expect(resultado.emprestimo.dataDevolucao).toBe(dia(19).toISOString())

            relogio.agora = dia(60)
            expect((await servico.obterEmprestimo("U1", e.id)).multaCentavos).toBe(250)
        })

        it("a multa de um empréstimo ativo cresce a cada dia de atraso", async () => {
            const { servico, relogio } = montar()
            const e = await servico.emprestar("U1", "E3")
            relogio.agora = dia(15)
            expect((await servico.obterEmprestimo("U1", e.id)).multaCentavos).toBe(50)
            relogio.agora = dia(20)
            const atual = await servico.obterEmprestimo("U1", e.id)
            expect(atual.multaCentavos).toBe(300)
            expect(atual.atrasado).toBe(true)
        })

        it("devolve a unidade ao acervo", async () => {
            const { servico, acervo } = montar()
            const e = await servico.emprestar("U1", "E3")
            await servico.devolver("U1", e.id)
            expect(acervo.obterExemplar("E3")!.disponivel).toBe(true)
        })

        it("repetir a devolução é conflito", async () => {
            const { servico } = montar()
            const e = await servico.emprestar("U1", "E3")
            await servico.devolver("U1", e.id)
            await expect(servico.devolver("U1", e.id)).rejects.toThrow(ErroConflito)
        })

        it("só o titular devolve; empréstimo inexistente é 404", async () => {
            const { servico, acervo } = montar()
            const e = await servico.emprestar("U1", "E3")
            await expect(servico.devolver("U2", e.id)).rejects.toThrow(ErroProibido)
            expect(acervo.obterExemplar("E3")!.status).toBe(StatusExemplar.EMPRESTADO)
            await expect(servico.devolver("U1", "EMP-999")).rejects.toThrow(ErroNaoEncontrado)
        })
    })

    describe("renovar", () => {
        it("estende o prazo em 14 dias a partir da data da renovação", async () => {
            const { servico, relogio } = montar()
            const e = await servico.emprestar("U1", "E3")
            relogio.agora = dia(10)
            const renovado = await servico.renovar("U1", e.id)
            expect(renovado.dataVencimento).toBe(dia(24).toISOString())
            expect(renovado.renovacoes).toBe(1)
        })

        it("permite até 2 renovações e bloqueia a 3ª", async () => {
            const { servico } = montar()
            const e = await servico.emprestar("U1", "E3")
            await servico.renovar("U1", e.id)
            await servico.renovar("U1", e.id)
            await expect(servico.renovar("U1", e.id)).rejects.toThrow("limite de renovações (2)")
        })

        it("não renova empréstimo em atraso nem já devolvido", async () => {
            const { servico, relogio } = montar()
            const atrasado = await servico.emprestar("U1", "E3")
            const devolvido = await servico.emprestar("U1", "E4")
            await servico.devolver("U1", devolvido.id)
            relogio.agora = dia(15)
            await expect(servico.renovar("U1", atrasado.id)).rejects.toThrow("em atraso")
            await expect(servico.renovar("U1", devolvido.id)).rejects.toThrow("já encerrado")
        })

        it("só o titular renova", async () => {
            const { servico } = montar()
            const e = await servico.emprestar("U1", "E3")
            await expect(servico.renovar("U2", e.id)).rejects.toThrow(ErroProibido)
        })

        it("reserva ativa para o livro bloqueia a renovação", async () => {
            const { servico } = montar()
            const { e1 } = await esgotarL1(servico)
            await servico.reservar("U3", "L1")
            await expect(servico.renovar("U1", e1.id)).rejects.toThrow("reserva ativa")
        })

        it("depois que a reserva é cancelada, volta a renovar", async () => {
            const { servico } = montar()
            const { e1 } = await esgotarL1(servico)
            const reserva = await servico.reservar("U3", "L1")
            await servico.cancelarReserva("U3", reserva.id)
            await expect(servico.renovar("U1", e1.id)).resolves.toBeDefined()
        })
    })

    describe("consultas", () => {
        it("lista só os empréstimos do próprio usuário e filtra por situação", async () => {
            const { servico } = montar()
            const devolvido = await servico.emprestar("U1", "E3")
            const ativo = await servico.emprestar("U1", "E4")
            await servico.emprestar("U2", "E5")
            await servico.devolver("U1", devolvido.id)

            expect((await servico.listarEmprestimos("U1")).map(e => e.id)).toEqual([devolvido.id, ativo.id])
            expect((await servico.listarEmprestimos("U1", "ativos")).map(e => e.id)).toEqual([ativo.id])
            expect((await servico.listarEmprestimos("U1", "encerrados")).map(e => e.id)).toEqual([devolvido.id])
            await expect(servico.listarEmprestimos("U1", "outra" as never)).rejects.toThrow(ErroValidacao)
        })

        it("não mostra o empréstimo de outra pessoa", async () => {
            const { servico } = montar()
            const e = await servico.emprestar("U1", "E3")
            await expect(servico.obterEmprestimo("U2", e.id)).rejects.toThrow(ErroProibido)
        })
    })

    describe("reservar", () => {
    it("só reserva quando não há exemplar disponível", async () => {
            const { servico } = montar()
            await expect(servico.reservar("U3", "L1")).rejects.toThrow("Há exemplar disponível")
            await servico.emprestar("U1", "E1")
            await expect(servico.reservar("U3", "L1")).rejects.toThrow("Há exemplar disponível")
            await servico.emprestar("U2", "E2")
            const reserva = await servico.reservar("U3", "L1")
            expect(reserva.id).toBe("RES-001")
            expect(reserva.status).toBe(StatusReserva.ATIVA)
            expect(reserva.livroTitulo).toBe("Dom Casmurro")
        })

        it("informa a posição na fila e impede reserva duplicada do mesmo usuário", async () => {
            const { servico } = montar()
            await esgotarL1(servico)
            expect((await servico.reservar("U3", "L1")).posicao).toBe(1)
            expect((await servico.reservar("U4", "L1")).posicao).toBe(2)
            await expect(servico.reservar("U3", "L1")).rejects.toThrow("já tem uma reserva ativa")
        })

        it("rejeita livro inexistente, livro sem exemplares e usuário desconhecido", async () => {
            const { servico, acervo } = montar()
            await expect(servico.reservar("U3", "L99")).rejects.toThrow(ErroNaoEncontrado)
            await expect(servico.reservar("U99", "L1")).rejects.toThrow(ErroNaoAutenticado)
            acervo.adicionarLivro(new Livro("L3", "Esaú e Jacó", "Machado de Assis", "ISBN-3", 1904, "Romance", ""))
            await expect(servico.reservar("U3", "L3")).rejects.toThrow("não tem exemplares")
        })

        it("a posição aparece na consulta e as reservas de outros não são visíveis", async () => {
            const { servico } = montar()
            await esgotarL1(servico)
            const a = await servico.reservar("U3", "L1")
            const b = await servico.reservar("U4", "L1")
            expect((await servico.listarReservas("U4")).map(r => [r.id, r.posicao])).toEqual([[b.id, 2]])
            await expect(servico.obterReserva("U4", a.id)).rejects.toThrow(ErroProibido)
        })
    })

    describe("fila de reservas na devolução e no empréstimo", () => {
        it("a devolução guarda a unidade (RESERVADO) para o primeiro da fila", async () => {
            const { servico, acervo } = montar()
            const { e1 } = await esgotarL1(servico)
            const reserva = await servico.reservar("U3", "L1")
            expect(reserva.pronta).toBe(false)

            await servico.devolver("U1", e1.id)
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.RESERVADO)
            expect(acervo.quantidadeDisponivel("L1")).toBe(0)
            expect((await servico.obterReserva("U3", reserva.id)).pronta).toBe(true)
        })

        it("terceiros não pegam a unidade guardada; o titular pega e a reserva é atendida", async () => {
            const { servico, acervo } = montar()
            const { e1 } = await esgotarL1(servico)
            const reserva = await servico.reservar("U3", "L1")
            await servico.reservar("U4", "L1")
            await servico.devolver("U1", e1.id)

            // U1 (fora da fila) e U4 (segundo da fila) não podem pegar a unidade guardada para U3
            await expect(servico.emprestar("U1", "E1")).rejects.toThrow("guardada para outro usuário")
            await expect(servico.emprestar("U4", "E1")).rejects.toThrow("guardada para outro usuário")
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.RESERVADO)

            const emprestimo = await servico.emprestar("U3", "E1")
            expect(emprestimo.usuarioId).toBe("U3")
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.EMPRESTADO)

            const atendida = await servico.obterReserva("U3", reserva.id)
            expect(atendida.status).toBe(StatusReserva.ATENDIDA)
            expect(atendida.posicao).toBeNull()
            expect((await servico.listarReservas("U4"))[0]!.posicao).toBe(1)
        })

        it("com duas unidades liberadas, atende a fila na ordem e na quantidade de unidades", async () => {
            const { servico, acervo } = montar()
            const { e1, e2 } = await esgotarL1(servico)
            await servico.reservar("U3", "L1")
            await servico.reservar("U4", "L1")
            await servico.devolver("U1", e1.id)
            await servico.devolver("U2", e2.id)
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.RESERVADO)
            expect(acervo.obterExemplar("E2")!.status).toBe(StatusExemplar.RESERVADO)

            await expect(servico.emprestar("U1", "E1")).rejects.toThrow(ErroConflito)
            await servico.emprestar("U4", "E2")
            await servico.emprestar("U3", "E1")
            expect((await servico.listarReservas("U3"))[0]!.status).toBe(StatusReserva.ATENDIDA)
            expect((await servico.listarReservas("U4"))[0]!.status).toBe(StatusReserva.ATENDIDA)
        })

        it("o titular da reserva continua sujeito ao limite de 3 empréstimos e a reserva é mantida", async () => {
            const { servico, acervo } = montar()
            const { e1 } = await esgotarL1(servico)
            const reserva = await servico.reservar("U3", "L1")
            await servico.emprestar("U3", "E3")
            await servico.emprestar("U3", "E4")
            await servico.emprestar("U3", "E5")
            await servico.devolver("U1", e1.id)

            await expect(servico.emprestar("U3", "E1")).rejects.toThrow("limite de 3 empréstimos")
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.RESERVADO)
            expect((await servico.obterReserva("U3", reserva.id)).status).toBe(StatusReserva.ATIVA)
        })

        it("quem tem unidade guardada deve emprestar essa unidade, não outra", async () => {
            const { servico, acervo } = montar()
            const { e1 } = await esgotarL1(servico)
            await servico.reservar("U3", "L1")
            await servico.devolver("U1", e1.id) // E1 guardada para U3
            await servico.devolver("U2", (await servico.listarEmprestimos("U2"))[0]!.id) // E2 volta a ficar DISPONIVEL

            expect(acervo.obterExemplar("E2")!.status).toBe(StatusExemplar.DISPONIVEL)
            await expect(servico.emprestar("U3", "E2")).rejects.toThrow("empreste essa unidade")
            // ninguém mais da fila: E2 está livre para quem não é U3
            await expect(servico.emprestar("U4", "E2")).resolves.toBeDefined()
        })

        it("uma unidade que aparece com fila esperando (ex.: exemplar novo) vai para o primeiro da fila", async () => {
            const { servico, acervo } = montar()
            await esgotarL1(servico)
            await servico.reservar("U3", "L1")
            await servico.reservar("U4", "L1")
            acervo.adicionarExemplares(new Exemplar("E7", "L1", "TOMBO-7")) // o administrador cadastrou mais uma unidade

            await expect(servico.emprestar("U1", "E7")).rejects.toThrow("destinada à fila")
            await expect(servico.emprestar("U4", "E7")).rejects.toThrow("à frente na fila")
            await expect(servico.emprestar("U3", "E7")).resolves.toBeDefined()
            expect((await servico.listarReservas("U3"))[0]!.status).toBe(StatusReserva.ATENDIDA)
        })

        it("sem fila, a devolução deixa a unidade disponível", async () => {
            const { servico, acervo } = montar()
            const { e1 } = await esgotarL1(servico)
            await servico.devolver("U1", e1.id)
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.DISPONIVEL)
        })
    })

    describe("cancelar reserva", () => {
        it("o titular cancela e a prioridade passa para o próximo", async () => {
            const { servico, acervo } = montar()
            const { e1 } = await esgotarL1(servico)
            const primeira = await servico.reservar("U3", "L1")
            const segunda = await servico.reservar("U4", "L1")
            await servico.devolver("U1", e1.id) // E1 guardada para U3

            await servico.cancelarReserva("U3", primeira.id)
            expect((await servico.listarReservas("U3"))[0]!.status).toBe(StatusReserva.CANCELADA)
            // a unidade continua guardada, agora para U4
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.RESERVADO)
            const atual = await servico.obterReserva("U4", segunda.id)
            expect(atual.posicao).toBe(1)
            expect(atual.pronta).toBe(true)
            await expect(servico.emprestar("U4", "E1")).resolves.toBeDefined()
        })

        it("se não sobra ninguém na fila, a unidade guardada volta a ficar disponível", async () => {
            const { servico, acervo } = montar()
            const { e1 } = await esgotarL1(servico)
            const reserva = await servico.reservar("U3", "L1")
            await servico.devolver("U1", e1.id)
            await servico.cancelarReserva("U3", reserva.id)
            expect(acervo.obterExemplar("E1")!.status).toBe(StatusExemplar.DISPONIVEL)
        })

        it("só o titular cancela e uma reserva encerrada não cancela de novo", async () => {
            const { servico } = montar()
            await esgotarL1(servico)
            const reserva = await servico.reservar("U3", "L1")
            await expect(servico.cancelarReserva("U4", reserva.id)).rejects.toThrow(ErroProibido)
            await servico.cancelarReserva("U3", reserva.id)
            await expect(servico.cancelarReserva("U3", reserva.id)).rejects.toThrow(ErroConflito)
            await expect(servico.cancelarReserva("U3", "RES-999")).rejects.toThrow(ErroNaoEncontrado)
        })

        it("depois de cancelar, o usuário pode reservar de novo", async () => {
            const { servico } = montar()
            await esgotarL1(servico)
            const reserva = await servico.reservar("U3", "L1")
            await servico.cancelarReserva("U3", reserva.id)
            expect((await servico.reservar("U3", "L1")).id).toBe("RES-002")
        })
    })

    describe("relógio padrão", () => {
        it("usa a data real quando nenhum relógio é informado", async () => {
            const { acervo } = montar()
            const servico = new ServicoCirculacao(new RepositorioEmprestimosMemoria(acervo, ["U1"]))
            const antes = Date.now()
            const e = await servico.emprestar("U1", "E1")
            expect(new Date(e.dataEmprestimo).getTime()).toBeGreaterThanOrEqual(antes)
            expect(new Date(e.dataEmprestimo).getTime()).toBeLessThanOrEqual(Date.now())
        })
    })
})
