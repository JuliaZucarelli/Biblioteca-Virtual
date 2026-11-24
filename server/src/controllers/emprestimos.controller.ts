import type { Request, Response } from "express"
import { usuarioDaRequisicao } from "../middlewares/usuario-da-requisicao"
import type { ServicoCirculacao, SituacaoEmprestimos } from "../services/servico-circulacao"

const idDoEmprestimo = (req: Request): string => String(req.params.id)
const idDaReserva = (req: Request): string => String(req.params.id)

/* Controller de empréstimos e reservas: lê a requisição HTTP, chama o serviço e escolhe o código de status.
Não tem regra de negócio. Erros (ErroValidacao, ErroConflito...) sobem para o middleware tratar-erros. */
export class EmprestimosController {
    constructor(private readonly servico: ServicoCirculacao) {}

    // ---------- /emprestimos ----------

    // GET /emprestimos?situacao=ativos|encerrados  (só os do usuário identificado)
    listarEmprestimos = async (req: Request, res: Response): Promise<void> => {
        const situacao = typeof req.query.situacao === "string" ? req.query.situacao : undefined
        res.json(await this.servico.listarEmprestimos(usuarioDaRequisicao(res), situacao as SituacaoEmprestimos | undefined))
    }

    // 201 Created + Location. Corpo: { "exemplarId": "E001" }
    emprestar = async (req: Request, res: Response): Promise<void> => {
        const emprestimo = await this.servico.emprestar(usuarioDaRequisicao(res), req.body?.exemplarId)
        res.status(201).location(`${req.baseUrl}/${emprestimo.id}`).json(emprestimo)
    }

    // ---------- /emprestimos/:id ----------

    obterEmprestimo = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.obterEmprestimo(usuarioDaRequisicao(res), idDoEmprestimo(req)))
    }

    // ---------- /emprestimos/:id/devolucao e /emprestimos/:id/renovacoes ----------

    // 200 com o empréstimo encerrado e a multa fixada
    devolver = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.devolver(usuarioDaRequisicao(res), idDoEmprestimo(req)))
    }

    // 200 com o empréstimo e o novo vencimento
    renovar = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.renovar(usuarioDaRequisicao(res), idDoEmprestimo(req)))
    }

    // ---------- /reservas ----------

    listarReservas = async (_req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.listarReservas(usuarioDaRequisicao(res)))
    }

    // 201 Created + Location. Corpo: { "livroId": "L01" }
    reservar = async (req: Request, res: Response): Promise<void> => {
        const reserva = await this.servico.reservar(usuarioDaRequisicao(res), req.body?.livroId)
        res.status(201).location(`${req.baseUrl}/${reserva.id}`).json(reserva)
    }

    // ---------- /reservas/:id ----------

    obterReserva = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.obterReserva(usuarioDaRequisicao(res), idDaReserva(req)))
    }

    // 204 No Content: a reserva foi cancelada
    cancelarReserva = async (req: Request, res: Response): Promise<void> => {
        await this.servico.cancelarReserva(usuarioDaRequisicao(res), idDaReserva(req))
        res.status(204).end()
    }
}
