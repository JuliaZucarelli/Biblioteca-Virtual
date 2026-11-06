import { ErroConflito, ErroNaoEncontrado, ErroValidacao } from "../domain/erros"
import { Exemplar, StatusExemplar } from "../domain/exemplares"
import { Livro } from "../domain/livro"
import type { RepositorioAcervo } from "../repositories/repositorio"
import {
    lerExemplar,
    lerLivroCompleto,
    lerLivroParcial,
    normalizarIsbn,
    type DadosLivro,
} from "./validacao-acervo"

// o que a API devolve para cada livro: dados do livro + contagem de exemplares
export interface LivroResumo {
    id: string
    isbn: string
    titulo: string
    autor: string
    ano: number
    genero: string
    sinopse: string
    capa: string
    total: number       // exemplares cadastrados
    disponiveis: number // exemplares que podem ser emprestados agora
}

export interface ExemplarResumo {
    id: string
    livroId: string
    codigo: string
    status: StatusExemplar
    disponivel: boolean
}

// próximo ID livre: L09 -> L10, E012 -> E013
function proximoId(prefixo: string, idsExistentes: string[], largura: number): string {
    const numeros = idsExistentes
        .filter(id => id.startsWith(prefixo))
        .map(id => Number(id.slice(prefixo.length)))
        .filter(n => Number.isInteger(n))
    const proximo = (numeros.length > 0 ? Math.max(...numeros) : 0) + 1
    return `${prefixo}${String(proximo).padStart(largura, "0")}`
}

function paraExemplarResumo(e: Exemplar): ExemplarResumo {
    return { id: e.id, livroId: e.livroId, codigo: e.codigo, status: e.status, disponivel: e.disponivel }
}

// exemplar com empréstimo ou reserva em andamento não pode ser apagado
function emUso(e: Exemplar): boolean {
    return e.status === StatusExemplar.EMPRESTADO || e.status === StatusExemplar.RESERVADO
}

/* Regras de negócio do acervo. Depende só da interface RepositorioAcervo,
então funciona igual com o RepositorioMemoria (testes) e com o RepositorioSQLite (API).
Não conhece HTTP: sinaliza problemas com ErroValidacao, ErroNaoEncontrado e ErroConflito. */
export class ServicoAcervo {
    constructor(private readonly repositorio: RepositorioAcervo) {}

    // ---------- livros ----------

    async listarLivros(): Promise<LivroResumo[]> {
        const livros = await this.repositorio.listarLivros()
        return Promise.all(livros.map(livro => this.resumir(livro)))
    }

    async obterLivro(id: string): Promise<LivroResumo> {
        return this.resumir(await this.exigirLivro(id))
    }

    // POST /livros
    async criarLivro(corpo: unknown): Promise<LivroResumo> {
        const dados = lerLivroCompleto(corpo)
        await this.garantirIsbnLivre(dados.isbn)

        const ids = (await this.repositorio.listarLivros()).map(l => l.id)
        const livro = this.montarLivro(proximoId("L", ids, 2), dados)
        await this.repositorio.salvarLivro(livro)
        return this.resumir(livro)
    }

    // PUT /livros/:id  (substitui o livro inteiro)
    async substituirLivro(id: string, corpo: unknown): Promise<LivroResumo> {
        await this.exigirLivro(id)
        const dados = lerLivroCompleto(corpo)
        await this.garantirIsbnLivre(dados.isbn, id)

        const livro = this.montarLivro(id, dados)
        await this.repositorio.atualizarLivro(livro)
        return this.resumir(livro)
    }

    // PATCH /livros/:id  (altera só os campos enviados)
    async atualizarLivro(id: string, corpo: unknown): Promise<LivroResumo> {
        const atual = await this.exigirLivro(id)
        const alteracoes = lerLivroParcial(corpo)

        const dados: DadosLivro = {
            titulo: atual.titulo,
            autor: atual.autor,
            isbn: atual.isbn,
            ano: atual.ano,
            genero: atual.genero,
            sinopse: atual.sinopse,
            capa: atual.capa,
            ...alteracoes,
        }
        if (alteracoes.isbn !== undefined) {
            await this.garantirIsbnLivre(dados.isbn, id)
        }

        const livro = this.montarLivro(id, dados)
        await this.repositorio.atualizarLivro(livro)
        return this.resumir(livro)
    }

    // DELETE /livros/:id  (apaga também os exemplares, desde que nenhum esteja em uso)
    async removerLivro(id: string): Promise<void> {
        await this.exigirLivro(id)
        const exemplares = await this.repositorio.listarExemplares(id)
        if (exemplares.some(emUso)) {
            throw new ErroConflito("Não é possível excluir o livro: há exemplares emprestados ou reservados.")
        }
        await this.repositorio.removerLivro(id)
    }

    // ---------- exemplares (sub-recurso de livro) ----------

    async listarExemplares(livroId: string): Promise<ExemplarResumo[]> {
        await this.exigirLivro(livroId)
        return (await this.repositorio.listarExemplares(livroId)).map(paraExemplarResumo)
    }

    async obterExemplar(livroId: string, exemplarId: string): Promise<ExemplarResumo> {
        return paraExemplarResumo(await this.exigirExemplar(livroId, exemplarId))
    }

    // POST /livros/:id/exemplares  (o código de tombo é opcional: sem ele, é gerado)
    async adicionarExemplar(livroId: string, corpo: unknown): Promise<ExemplarResumo> {
        await this.exigirLivro(livroId)
        const { codigo } = lerExemplar(corpo)

        const id = proximoId("E", await this.idsDeTodosExemplares(), 3)
        const tombo = codigo ?? `TOMBO-${id.slice(1)}`
        if (await this.repositorio.existeTombo(tombo)) {
            throw new ErroConflito(`Já existe um exemplar com o código de tombo ${tombo}.`)
        }

        const exemplar = new Exemplar(id, livroId, tombo)
        await this.repositorio.adicionarExemplar(exemplar)
        return paraExemplarResumo(exemplar)
    }

    // DELETE /livros/:id/exemplares/:exemplarId
    async removerExemplar(livroId: string, exemplarId: string): Promise<void> {
        const exemplar = await this.exigirExemplar(livroId, exemplarId)
        if (emUso(exemplar)) {
            throw new ErroConflito("Não é possível excluir o exemplar: ele está emprestado ou reservado.")
        }
        await this.repositorio.removerExemplar(exemplarId)
    }

    // ---------- auxiliares ----------

    private async exigirLivro(id: string): Promise<Livro> {
        const livro = await this.repositorio.obterLivro(id)
        if (!livro) {
            throw new ErroNaoEncontrado("Livro não encontrado.")
        }
        return livro
    }

    private async exigirExemplar(livroId: string, exemplarId: string): Promise<Exemplar> {
        await this.exigirLivro(livroId)
        const exemplar = (await this.repositorio.listarExemplares(livroId)).find(e => e.id === exemplarId)
        if (!exemplar) {
            throw new ErroNaoEncontrado("Exemplar não encontrado.")
        }
        return exemplar
    }

    // dois livros não podem ter o mesmo ISBN (ignorando o próprio livro, no PUT/PATCH)
    private async garantirIsbnLivre(isbn: string, idIgnorado?: string): Promise<void> {
        const alvo = normalizarIsbn(isbn)
        const livros = await this.repositorio.listarLivros()
        if (livros.some(l => l.id !== idIgnorado && normalizarIsbn(l.isbn) === alvo)) {
            throw new ErroConflito("Já existe um livro cadastrado com este ISBN.")
        }
    }

    private async idsDeTodosExemplares(): Promise<string[]> {
        const livros = await this.repositorio.listarLivros()
        const porLivro = await Promise.all(livros.map(l => this.repositorio.listarExemplares(l.id)))
        return porLivro.flat().map(e => e.id)
    }

    // o construtor de Livro valida os dados; se reclamar, vira 400
    private montarLivro(id: string, d: DadosLivro): Livro {
        try {
            return new Livro(id, d.titulo, d.autor, d.isbn, d.ano, d.genero, d.sinopse, d.capa)
        } catch (erro) {
            throw new ErroValidacao(erro instanceof Error ? erro.message : "Dados do livro inválidos.")
        }
    }

    private async resumir(livro: Livro): Promise<LivroResumo> {
        const exemplares = await this.repositorio.listarExemplares(livro.id)
        return {
            id: livro.id,
            isbn: livro.isbn,
            titulo: livro.titulo,
            autor: livro.autor,
            ano: livro.ano,
            genero: livro.genero,
            sinopse: livro.sinopse,
            capa: livro.capa,
            total: exemplares.length,
            disponiveis: exemplares.filter(e => e.disponivel).length,
        }
    }
}
