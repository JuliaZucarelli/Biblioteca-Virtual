import type { Request, Response } from "express"
import type { ServicoAcervo } from "../services/servico-acervo"

const idDoLivro = (req: Request): string => String(req.params.id)
const idDoExemplar = (req: Request): string => String(req.params.exemplarId)

/* Controller: lê a requisição HTTP, chama o serviço e escolhe o código de status da resposta.
Não tem regra de negócio. Erros (ErroValidacao, ErroNaoEncontrado...) sobem para o middleware tratar-erros. */
export class LivrosController {
    constructor(private readonly servico: ServicoAcervo) {}

    // ---------- /livros ----------

    listar = async (_req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.listarLivros())
    }

    // 201 Created + cabeçalho Location apontando para o recurso novo
    criar = async (req: Request, res: Response): Promise<void> => {
        const livro = await this.servico.criarLivro(req.body)
        res.status(201).location(`${req.baseUrl}/${livro.id}`).json(livro)
    }

    // ---------- /livros/:id ----------

    obter = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.obterLivro(idDoLivro(req)))
    }

    substituir = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.substituirLivro(idDoLivro(req), req.body))
    }

    atualizar = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.atualizarLivro(idDoLivro(req), req.body))
    }

    // 204 No Content: apagou e não há nada para devolver
    remover = async (req: Request, res: Response): Promise<void> => {
        await this.servico.removerLivro(idDoLivro(req))
        res.status(204).end()
    }

    // ---------- /livros/:id/exemplares ----------

    listarExemplares = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.listarExemplares(idDoLivro(req)))
    }

    adicionarExemplar = async (req: Request, res: Response): Promise<void> => {
        const exemplar = await this.servico.adicionarExemplar(idDoLivro(req), req.body)
        res.status(201).location(`${req.baseUrl}/${exemplar.livroId}/exemplares/${exemplar.id}`).json(exemplar)
    }

    // ---------- /livros/:id/exemplares/:exemplarId ----------

    obterExemplar = async (req: Request, res: Response): Promise<void> => {
        res.json(await this.servico.obterExemplar(idDoLivro(req), idDoExemplar(req)))
    }

    removerExemplar = async (req: Request, res: Response): Promise<void> => {
        await this.servico.removerExemplar(idDoLivro(req), idDoExemplar(req))
        res.status(204).end()
    }
}
