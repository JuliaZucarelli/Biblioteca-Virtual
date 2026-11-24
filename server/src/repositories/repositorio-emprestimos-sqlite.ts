import type { Banco } from "../config/banco"
import { Emprestimo } from "../domain/emprestimo"
import { Exemplar, StatusExemplar } from "../domain/exemplares"
import { Livro } from "../domain/livro"
import { Reserva, StatusReserva } from "../domain/reserva"
import type { RepositorioEmprestimos } from "./repositorio-emprestimos"

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

interface LinhaEmprestimo {
    id: string
    usuario_id: string
    exemplar_id: string
    data_emprestimo: string
    data_vencimento: string
    data_devolucao: string | null
    renovacoes: number
}

interface LinhaReserva {
    id: string
    usuario_id: string
    livro_id: string
    criada_em: string
    status: string
}

const COLUNAS_EMPRESTIMO = "id, usuario_id, exemplar_id, data_emprestimo, data_vencimento, data_devolucao, renovacoes"
const COLUNAS_RESERVA = "id, usuario_id, livro_id, criada_em, status"

// "EMP-012" -> 12 (usado para ordenar e para achar o próximo ID)
const NUMERO_DO_ID = "CAST(SUBSTR(id, 5) AS INTEGER)"

/* Guarda empréstimos e reservas no SQLite. Mesma interface do RepositorioEmprestimosMemoria:
o ServicoCirculacao não sabe qual das duas está por trás. As datas são gravadas em texto ISO (UTC). */
export class RepositorioEmprestimosSQLite implements RepositorioEmprestimos {
    constructor(private readonly banco : Banco) {}

    // reconstrói os objetos de domínio a partir das linhas (a validação dos construtores continua valendo)
    private static paraLivro(l : LinhaLivro) : Livro {
        return new Livro(l.id, l.titulo, l.autor, l.isbn, l.ano, l.genero, l.sinopse, l.capa)
    }

    private static paraExemplar(e : LinhaExemplar) : Exemplar {
        return new Exemplar(e.id, e.livro_id, e.codigo, e.status as StatusExemplar)
    }

    private static paraEmprestimo(l : LinhaEmprestimo) : Emprestimo {
        const vencimento = new Date(l.data_vencimento)
        const emprestimo = new Emprestimo(l.id, l.usuario_id, l.exemplar_id, new Date(l.data_emprestimo), vencimento)
        // o domínio só conta renovações por registrarRenovacao: repete até chegar ao número salvo (o vencimento não muda)
        for (let i = 0; i < l.renovacoes; i++) {
            emprestimo.registrarRenovacao(vencimento)
        }
        if (l.data_devolucao !== null) {
            emprestimo.encerrar(new Date(l.data_devolucao))
        }
        return emprestimo
    }

    private static paraReserva(l : LinhaReserva) : Reserva {
        return new Reserva(l.id, l.usuario_id, l.livro_id, new Date(l.criada_em), l.status as StatusReserva)
    }

    // ---------- usuários, livros e exemplares ----------

    async usuarioExiste(id : string) : Promise < boolean > {
        const linha = this.banco.prepare("SELECT 1 AS existe FROM usuarios WHERE id = ?").get(id)
        return linha !== undefined
    }

    async obterLivro(id : string) : Promise < Livro | undefined > {
        const linha = this.banco
            .prepare("SELECT id, isbn, titulo, autor, ano, genero, sinopse, capa FROM livros WHERE id = ?")
            .get(id) as LinhaLivro | undefined
        return linha ? RepositorioEmprestimosSQLite.paraLivro(linha) : undefined
    }

    async obterExemplar(id : string) : Promise < Exemplar | undefined > {
        const linha = this.banco
            .prepare("SELECT id, livro_id, codigo, status FROM exemplares WHERE id = ?")
            .get(id) as LinhaExemplar | undefined
        return linha ? RepositorioEmprestimosSQLite.paraExemplar(linha) : undefined
    }

    async listarExemplaresDoLivro(livroId : string) : Promise < Exemplar[] > {
        const linhas = this.banco
            .prepare("SELECT id, livro_id, codigo, status FROM exemplares WHERE livro_id = ? ORDER BY id")
            .all(livroId) as LinhaExemplar[]
        return linhas.map(RepositorioEmprestimosSQLite.paraExemplar)
    }

    async atualizarExemplar(exemplar : Exemplar) : Promise < void > {
        const resultado = this.banco
            .prepare("UPDATE exemplares SET status = ? WHERE id = ?")
            .run(exemplar.status, exemplar.id)
        if (resultado.changes === 0) {
            throw new Error(`Exemplar ${exemplar.id} não encontrado.`)
        }
    }

    // ---------- empréstimos ----------

    async proximoIdEmprestimo() : Promise < string > {
        const { maior } = this.banco
            .prepare(`SELECT COALESCE(MAX(${NUMERO_DO_ID}), 0) AS maior FROM emprestimos WHERE id LIKE 'EMP-%'`)
            .get() as { maior : number }
        return `EMP-${String(maior + 1).padStart(3, "0")}`
    }

    async salvarEmprestimo(emprestimo : Emprestimo) : Promise < void > {
        this.banco
            .prepare(`INSERT INTO emprestimos (${COLUNAS_EMPRESTIMO}) VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .run(
                emprestimo.id,
                emprestimo.usuarioId,
                emprestimo.exemplarId,
                emprestimo.dataEmprestimo.toISOString(),
                emprestimo.dataVencimento.toISOString(),
                emprestimo.dataDevolucao?.toISOString() ?? null,
                emprestimo.renovacoes
            )
    }

    async atualizarEmprestimo(emprestimo : Emprestimo) : Promise < void > {
        const resultado = this.banco
            .prepare("UPDATE emprestimos SET data_vencimento = ?, data_devolucao = ?, renovacoes = ? WHERE id = ?")
            .run(
                emprestimo.dataVencimento.toISOString(),
                emprestimo.dataDevolucao?.toISOString() ?? null,
                emprestimo.renovacoes,
                emprestimo.id
            )
        if (resultado.changes === 0) {
            throw new Error(`Empréstimo ${emprestimo.id} não encontrado.`)
        }
    }

    async obterEmprestimo(id : string) : Promise < Emprestimo | undefined > {
        const linha = this.banco
            .prepare(`SELECT ${COLUNAS_EMPRESTIMO} FROM emprestimos WHERE id = ?`)
            .get(id) as LinhaEmprestimo | undefined
        return linha ? RepositorioEmprestimosSQLite.paraEmprestimo(linha) : undefined
    }

    async listarEmprestimosDoUsuario(usuarioId : string) : Promise < Emprestimo[] > {
        const linhas = this.banco
            .prepare(`SELECT ${COLUNAS_EMPRESTIMO} FROM emprestimos WHERE usuario_id = ? ORDER BY ${NUMERO_DO_ID}`)
            .all(usuarioId) as LinhaEmprestimo[]
        return linhas.map(RepositorioEmprestimosSQLite.paraEmprestimo)
    }

    // ---------- reservas ----------

    async proximoIdReserva() : Promise < string > {
        const { maior } = this.banco
            .prepare(`SELECT COALESCE(MAX(${NUMERO_DO_ID}), 0) AS maior FROM reservas WHERE id LIKE 'RES-%'`)
            .get() as { maior : number }
        return `RES-${String(maior + 1).padStart(3, "0")}`
    }

    async salvarReserva(reserva : Reserva) : Promise < void > {
        this.banco
            .prepare(`INSERT INTO reservas (${COLUNAS_RESERVA}) VALUES (?, ?, ?, ?, ?)`)
            .run(reserva.id, reserva.usuarioId, reserva.livroId, reserva.criadaEm.toISOString(), reserva.status)
    }

    async atualizarReserva(reserva : Reserva) : Promise < void > {
        const resultado = this.banco
            .prepare("UPDATE reservas SET status = ? WHERE id = ?")
            .run(reserva.status, reserva.id)
        if (resultado.changes === 0) {
            throw new Error(`Reserva ${reserva.id} não encontrada.`)
        }
    }

    async obterReserva(id : string) : Promise < Reserva | undefined > {
        const linha = this.banco
            .prepare(`SELECT ${COLUNAS_RESERVA} FROM reservas WHERE id = ?`)
            .get(id) as LinhaReserva | undefined
        return linha ? RepositorioEmprestimosSQLite.paraReserva(linha) : undefined
    }

    async listarReservasDoUsuario(usuarioId : string) : Promise < Reserva[] > {
        const linhas = this.banco
            .prepare(`SELECT ${COLUNAS_RESERVA} FROM reservas WHERE usuario_id = ? ORDER BY ${NUMERO_DO_ID}`)
            .all(usuarioId) as LinhaReserva[]
        return linhas.map(RepositorioEmprestimosSQLite.paraReserva)
    }

    // fila: mais antiga primeiro; empate decidido pelo número do ID (RN29)
    async listarReservasAtivasDoLivro(livroId : string) : Promise < Reserva[] > {
        const linhas = this.banco
            .prepare(
                `SELECT ${COLUNAS_RESERVA} FROM reservas WHERE livro_id = ? AND status = ? ORDER BY criada_em, ${NUMERO_DO_ID}`
            )
            .all(livroId, StatusReserva.ATIVA) as LinhaReserva[]
        return linhas.map(RepositorioEmprestimosSQLite.paraReserva)
    }

    // ---------- transação ----------

    /* BEGIN IMMEDIATE trava o banco para escrita: se der erro no meio, o ROLLBACK desfaz tudo (RN21, RN22).
    As funções do repositório terminam sem esperar I/O de verdade (o better-sqlite3 é síncrono), então
    outra requisição não consegue começar no meio desta: o Node só atende a próxima depois que esta termina. */
    async executarEmTransacao < T > (operacao : () => Promise < T >) : Promise < T > {
        if (this.banco.inTransaction) {
            return operacao() // já estamos dentro de uma transação: só participa dela
        }
        this.banco.exec("BEGIN IMMEDIATE")
        try {
            const resultado = await operacao()
            this.banco.exec("COMMIT")
            return resultado
        } catch (erro) {
            if (this.banco.inTransaction) {
                this.banco.exec("ROLLBACK")
            }
            throw erro
        }
    }
}
