import { describe, it, expect } from "vitest"
import { Emprestimo } from "../domain/emprestimo"
import { ErroConflito } from "../domain/erros"
import { StatusExemplar } from "../domain/exemplares"
import { Reserva, StatusReserva } from "../domain/reserva"
import { RepositorioEmprestimosSQLite } from "../repositories/repositorio-emprestimos-sqlite"
import { ServicoCirculacao } from "../services/servico-circulacao"
import { criarBancoDeTeste } from "./auxiliar-circulacao"

const dia = (n: number, hora = 10) => new Date(2026, 9, 1 + n, hora, 0)

function montar() {
    const banco = criarBancoDeTeste()
    const repositorio = new RepositorioEmprestimosSQLite(banco)
    const relogio = { agora: dia(0) }
    const servico = new ServicoCirculacao(repositorio, undefined, () => new Date(relogio.agora))
    return { banco, repositorio, servico, relogio }
}

const statusNoBanco = (banco: ReturnType<typeof criarBancoDeTeste>, id: string) =>
    (banco.prepare("SELECT status FROM exemplares WHERE id = ?").get(id) as { status: string }).status

describe("RepositorioEmprestimosSQLite", () => {
    it("grava empréstimo e estado da unidade e os dados sobrevivem a um repositório novo (reiniciar)", async () => {
        const { banco, servico, relogio } = montar()
        const e = await servico.emprestar("U1", "E1")
        relogio.agora = dia(5)
        await servico.renovar("U1", e.id)

        // "reinicia" a aplicação: novos objetos sobre o mesmo banco
        const depois = new ServicoCirculacao(new RepositorioEmprestimosSQLite(banco), undefined, () => dia(5))
        const [lido] = await depois.listarEmprestimos("U1", "ativos")
        expect(lido!.id).toBe(e.id)
        expect(lido!.renovacoes).toBe(1)
        expect(lido!.dataVencimento).toBe(dia(19).toISOString())
        expect(statusNoBanco(banco, "E1")).toBe(StatusExemplar.EMPRESTADO)
    })

    it("a multa de um empréstimo devolvido fica fixa mesmo depois de reiniciar", async () => {
        const { banco, servico, relogio } = montar()
        const e = await servico.emprestar("U1", "E1")
        relogio.agora = dia(19)
        await servico.devolver("U1", e.id)

        const depois = new ServicoCirculacao(new RepositorioEmprestimosSQLite(banco), undefined, () => dia(90))
        const lido = await depois.obterEmprestimo("U1", e.id)
        expect(lido.ativo).toBe(false)
        expect(lido.dataDevolucao).toBe(dia(19).toISOString())
        expect(lido.multaCentavos).toBe(250)
        expect(statusNoBanco(banco, "E1")).toBe(StatusExemplar.DISPONIVEL)
    })

    it("reservas: fila em ordem, unidade guardada e atendimento ficam gravados", async () => {
        const { banco, servico, relogio } = montar()
        const e1 = await servico.emprestar("U1", "E1")
        await servico.emprestar("U2", "E2")
        const r3 = await servico.reservar("U3", "L1")
        relogio.agora = dia(1)
        const r4 = await servico.reservar("U4", "L1")
        expect([r3.id, r4.id]).toEqual(["RES-001", "RES-002"])

        await servico.devolver("U1", e1.id)
        expect(statusNoBanco(banco, "E1")).toBe(StatusExemplar.RESERVADO)

        const depois = new ServicoCirculacao(new RepositorioEmprestimosSQLite(banco))
        expect((await depois.listarReservas("U3"))[0]!.pronta).toBe(true)
        await expect(depois.emprestar("U4", "E1")).rejects.toThrow(ErroConflito)
        await depois.emprestar("U3", "E1")
        expect((await depois.listarReservas("U3"))[0]!.status).toBe(StatusReserva.ATENDIDA)
        expect((await depois.listarReservas("U4"))[0]!.posicao).toBe(1)
    })

    it("a fila respeita a ordem de criação mesmo com IDs passando de 9 para 10", async () => {
        const { banco, repositorio } = montar()
        const insere = banco.prepare("INSERT INTO reservas (id, usuario_id, livro_id, criada_em, status) VALUES (?, ?, ?, ?, 'ATIVA')")
        insere.run("RES-010", "U1", "L1", dia(0).toISOString())
        insere.run("RES-009", "U2", "L1", dia(0).toISOString())
        const fila = await repositorio.listarReservasAtivasDoLivro("L1")
        expect(fila.map(r => r.id)).toEqual(["RES-009", "RES-010"])
        expect(await repositorio.proximoIdReserva()).toBe("RES-011")
    })

    it("transação: se algo falha no meio, nada é gravado (rollback)", async () => {
        const { banco, repositorio } = montar()
        const agora = dia(0)

        await expect(
            repositorio.executarEmTransacao(async () => {
                const exemplar = (await repositorio.obterExemplar("E1"))!
                exemplar.emprestar()
                await repositorio.atualizarExemplar(exemplar)
                await repositorio.salvarEmprestimo(new Emprestimo("EMP-001", "U1", "E1", agora, dia(14)))
                throw new Error("falha simulada")
            })
        ).rejects.toThrow("falha simulada")

        expect(statusNoBanco(banco, "E1")).toBe(StatusExemplar.DISPONIVEL)
        expect(await repositorio.obterEmprestimo("EMP-001")).toBeUndefined()
        expect(banco.inTransaction).toBe(false)
    })

    it("transação: um erro do próprio SQLite no meio também desfaz o que já tinha sido gravado", async () => {
        const { banco, repositorio } = montar()
        // o empréstimo é inserido, mas a reserva repete um ID e quebra a transação
        await repositorio.salvarReserva(new Reserva("RES-001", "U3", "L1", dia(0)))

        await expect(
            repositorio.executarEmTransacao(async () => {
                await repositorio.salvarEmprestimo(new Emprestimo("EMP-001", "U1", "E1", dia(0), dia(14)))
                await repositorio.salvarReserva(new Reserva("RES-001", "U4", "L1", dia(0)))
            })
        ).rejects.toThrow()

        expect(await repositorio.obterEmprestimo("EMP-001")).toBeUndefined()
        expect(banco.inTransaction).toBe(false)
    })

    it("uma operação recusada pelas regras não altera o banco", async () => {
        const { banco, servico } = montar()
        for (const exemplar of ["E3", "E4", "E5"]) {
            await servico.emprestar("U1", exemplar)
        }
        await expect(servico.emprestar("U1", "E6")).rejects.toThrow(ErroConflito)
        expect(statusNoBanco(banco, "E6")).toBe(StatusExemplar.DISPONIVEL)
        const { total } = banco.prepare("SELECT COUNT(*) AS total FROM emprestimos").get() as { total: number }
        expect(total).toBe(3)
    })

    it("o banco recusa empréstimo de usuário ou exemplar que não existem (integridade referencial)", async () => {
        const { repositorio } = montar()
        await expect(
            repositorio.salvarEmprestimo(new Emprestimo("EMP-001", "U99", "E1", dia(0), dia(14)))
        ).rejects.toThrow()
        await expect(
            repositorio.salvarEmprestimo(new Emprestimo("EMP-001", "U1", "E99", dia(0), dia(14)))
        ).rejects.toThrow()
    })

    it("IDs de empréstimo continuam de onde o banco parou", async () => {
        const { banco, repositorio } = montar()
        expect(await repositorio.proximoIdEmprestimo()).toBe("EMP-001")
        await repositorio.salvarEmprestimo(new Emprestimo("EMP-007", "U1", "E1", dia(0), dia(14)))
        expect(await repositorio.proximoIdEmprestimo()).toBe("EMP-008")
        expect(banco.inTransaction).toBe(false)
    })
})
