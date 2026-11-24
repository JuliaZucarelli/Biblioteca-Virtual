import type { Emprestimo } from "../domain/emprestimo"
import type { Acervo, Exemplar } from "../domain/exemplares"
import type { Livro } from "../domain/livro"
import type { Reserva } from "../domain/reserva"

/* Contrato que o ServicoCirculacao usa para guardar empréstimos, reservas e o status dos exemplares.
Tem duas implementações: RepositorioEmprestimosMemoria (testes) e RepositorioEmprestimosSQLite (API). */
export interface RepositorioEmprestimos {
    // consultas de apoio (usuários, livros e exemplares)
    usuarioExiste(id : string) : Promise < boolean >
    obterLivro(id : string) : Promise < Livro | undefined >
    obterExemplar(id : string) : Promise < Exemplar | undefined >
    listarExemplaresDoLivro(livroId : string) : Promise < Exemplar[] >
    atualizarExemplar(exemplar : Exemplar) : Promise < void > // grava o status atual da unidade

    // empréstimos
    proximoIdEmprestimo() : Promise < string >
    salvarEmprestimo(emprestimo : Emprestimo) : Promise < void >
    atualizarEmprestimo(emprestimo : Emprestimo) : Promise < void > // vencimento, devolução e renovações
    obterEmprestimo(id : string) : Promise < Emprestimo | undefined >
    listarEmprestimosDoUsuario(usuarioId : string) : Promise < Emprestimo[] > // ativos e encerrados

    // reservas
    proximoIdReserva() : Promise < string >
    salvarReserva(reserva : Reserva) : Promise < void >
    atualizarReserva(reserva : Reserva) : Promise < void >
    obterReserva(id : string) : Promise < Reserva | undefined >
    listarReservasDoUsuario(usuarioId : string) : Promise < Reserva[] >
    listarReservasAtivasDoLivro(livroId : string) : Promise < Reserva[] > // já na ordem da fila

    /* Agrupa várias gravações numa só operação: ou tudo é gravado, ou nada (RN21).
    Dentro da função só se pode usar os métodos deste repositório. */
    executarEmTransacao < T > (operacao : () => Promise < T >) : Promise < T >
}

// "EMP-012" -> 12
function numeroDoId(id : string) : number {
    const numero = Number(id.replace(/\D+/g, ""))
    return Number.isInteger(numero) ? numero : 0
}

// próximo ID livre com o prefixo dado: EMP-001, EMP-002...
function proximoIdSequencial(prefixo : string, ids : Iterable < string >) : string {
    let maior = 0
    for (const id of ids) {
        if (id.startsWith(prefixo)) {
            maior = Math.max(maior, numeroDoId(id))
        }
    }
    return `${prefixo}${String(maior + 1).padStart(3, "0")}`
}

/* Versão em memória, para testar as regras sem banco. Os exemplares ficam no Acervo
(o mesmo objeto é alterado, por isso atualizarExemplar não precisa fazer nada). */
export class RepositorioEmprestimosMemoria implements RepositorioEmprestimos {
    private readonly emprestimos = new Map < string, Emprestimo > ()
    private readonly reservas = new Map < string, Reserva > ()
    private readonly usuarios : Set < string >

    constructor (
        private readonly acervo : Acervo,
        usuarios : string[] = []
    ) {
        this.usuarios = new Set(usuarios)
    }

    cadastrarUsuario(id : string) : void {
        this.usuarios.add(id)
    }

    async usuarioExiste(id : string) : Promise < boolean > {
        return this.usuarios.has(id)
    }

    async obterLivro(id : string) : Promise < Livro | undefined > {
        return this.acervo.obterLivro(id)
    }

    async obterExemplar(id : string) : Promise < Exemplar | undefined > {
        return this.acervo.obterExemplar(id)
    }

    async listarExemplaresDoLivro(livroId : string) : Promise < Exemplar[] > {
        return this.acervo.obterExemplares(livroId)
    }

    async atualizarExemplar(_exemplar : Exemplar) : Promise < void > {
        // nada a fazer: o Acervo guarda o próprio objeto, que já foi alterado
    }

    async proximoIdEmprestimo() : Promise < string > {
        return proximoIdSequencial("EMP-", this.emprestimos.keys())
    }

    async salvarEmprestimo(emprestimo : Emprestimo) : Promise < void > {
        this.emprestimos.set(emprestimo.id, emprestimo)
    }

    async atualizarEmprestimo(emprestimo : Emprestimo) : Promise < void > {
        this.emprestimos.set(emprestimo.id, emprestimo)
    }

    async obterEmprestimo(id : string) : Promise < Emprestimo | undefined > {
        return this.emprestimos.get(id)
    }

    async listarEmprestimosDoUsuario(usuarioId : string) : Promise < Emprestimo[] > {
        return [...this.emprestimos.values()]
            .filter(e => e.usuarioId === usuarioId)
            .sort((a, b) => numeroDoId(a.id) - numeroDoId(b.id))
    }

    async proximoIdReserva() : Promise < string > {
        return proximoIdSequencial("RES-", this.reservas.keys())
    }

    async salvarReserva(reserva : Reserva) : Promise < void > {
        this.reservas.set(reserva.id, reserva)
    }

    async atualizarReserva(reserva : Reserva) : Promise < void > {
        this.reservas.set(reserva.id, reserva)
    }

    async obterReserva(id : string) : Promise < Reserva | undefined > {
        return this.reservas.get(id)
    }

    async listarReservasDoUsuario(usuarioId : string) : Promise < Reserva[] > {
        return [...this.reservas.values()]
            .filter(r => r.usuarioId === usuarioId)
            .sort((a, b) => numeroDoId(a.id) - numeroDoId(b.id))
    }

    // fila: mais antiga primeiro; empate decidido pelo número do ID (RN29)
    async listarReservasAtivasDoLivro(livroId : string) : Promise < Reserva[] > {
        return [...this.reservas.values()]
            .filter(r => r.livroId === livroId && r.ativa)
            .sort((a, b) => a.criadaEm.getTime() - b.criadaEm.getTime() || numeroDoId(a.id) - numeroDoId(b.id))
    }

    // em memória não há o que desfazer: o serviço só altera o estado depois de validar tudo
    async executarEmTransacao < T > (operacao : () => Promise < T >) : Promise < T > {
        return operacao()
    }
}
