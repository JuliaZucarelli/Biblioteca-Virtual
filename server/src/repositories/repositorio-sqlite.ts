import type { Banco } from "../config/banco"
import { Livro } from "../domain/livro"
import { Exemplar, StatusExemplar } from "../domain/exemplares"
import type { RepositorioAcervo } from "./repositorio"

// formato das linhas como vêm do banco (colunas em snake_case)
interface LinhaLivro {
    id: string
    isbn: string
    titulo: string
    autor: string
    ano: number
    genero: string
    sinopse: string
    capa: string
}

interface LinhaExemplar {
    id: string
    livro_id: string
    codigo: string
    status: string
}

/* Mesma interface do RepositorioMemoria, mas lendo do SQLite.
Quem usa o RepositorioAcervo (serviços, controllers) não sabe qual das duas está por trás. */
export class RepositorioSQLite implements RepositorioAcervo {
    constructor(private readonly banco: Banco) {}

    // reconstrói os objetos de domínio a partir das linhas (a validação do construtor continua valendo)
    private static paraLivro(l: LinhaLivro): Livro {
        return new Livro(l.id, l.titulo, l.autor, l.isbn, l.ano, l.genero, l.sinopse, l.capa)
    }

    private static paraExemplar(e: LinhaExemplar): Exemplar {
        return new Exemplar(e.id, e.livro_id, e.codigo, e.status as StatusExemplar)
    }

    async listarLivros(): Promise<Livro[]> {
        const linhas = this.banco
            .prepare("SELECT id, isbn, titulo, autor, ano, genero, sinopse, capa FROM livros ORDER BY id")
            .all() as LinhaLivro[]
        return linhas.map(RepositorioSQLite.paraLivro)
    }

    async obterLivro(id: string): Promise<Livro | undefined> {
        const linha = this.banco
            .prepare("SELECT id, isbn, titulo, autor, ano, genero, sinopse, capa FROM livros WHERE id = ?")
            .get(id) as LinhaLivro | undefined
        return linha ? RepositorioSQLite.paraLivro(linha) : undefined
    }

    async listarExemplares(livroId: string): Promise<Exemplar[]> {
        const linhas = this.banco
            .prepare("SELECT id, livro_id, codigo, status FROM exemplares WHERE livro_id = ? ORDER BY id")
            .all(livroId) as LinhaExemplar[]
        return linhas.map(RepositorioSQLite.paraExemplar)
    }

    async quantidadeDisponivel(livroId: string): Promise<number> {
        const { total } = this.banco
            .prepare("SELECT COUNT(*) AS total FROM exemplares WHERE livro_id = ? AND status = ?")
            .get(livroId, StatusExemplar.DISPONIVEL) as { total: number }
        return total
    }

    async salvarLivro(livro: Livro): Promise<void> {
        this.banco
            .prepare("INSERT INTO livros (id, isbn, titulo, autor, ano, genero, sinopse, capa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .run(livro.id, livro.isbn, livro.titulo, livro.autor, livro.ano, livro.genero, livro.sinopse, livro.capa)
    }

    async atualizarLivro(livro: Livro): Promise<void> {
        const resultado = this.banco
            .prepare("UPDATE livros SET isbn = ?, titulo = ?, autor = ?, ano = ?, genero = ?, sinopse = ?, capa = ? WHERE id = ?")
            .run(livro.isbn, livro.titulo, livro.autor, livro.ano, livro.genero, livro.sinopse, livro.capa, livro.id)
        if (resultado.changes === 0) {
            throw new Error(`Livro ${livro.id} não encontrado.`)
        }
    }

    // os exemplares são removidos junto (ON DELETE CASCADE no esquema)
    async removerLivro(id: string): Promise<void> {
        const resultado = this.banco.prepare("DELETE FROM livros WHERE id = ?").run(id)
        if (resultado.changes === 0) {
            throw new Error(`Livro ${id} não encontrado.`)
        }
    }

    async adicionarExemplar(exemplar: Exemplar): Promise<void> {
        this.banco
            .prepare("INSERT INTO exemplares (id, livro_id, codigo, status) VALUES (?, ?, ?, ?)")
            .run(exemplar.id, exemplar.livroId, exemplar.codigo, exemplar.status)
    }

    async removerExemplar(id: string): Promise<void> {
        const resultado = this.banco.prepare("DELETE FROM exemplares WHERE id = ?").run(id)
        if (resultado.changes === 0) {
            throw new Error(`Exemplar ${id} não encontrado.`)
        }
    }

    async existeTombo(codigo: string): Promise<boolean> {
        const linha = this.banco
            .prepare("SELECT 1 AS existe FROM exemplares WHERE codigo = ? COLLATE NOCASE LIMIT 1")
            .get(codigo.trim())
        return linha !== undefined
    }
}
