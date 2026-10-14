import { Acervo } from "../models/exemplares"
import { Emprestimo, RegrasEmprestimo, REGRAS_PADRAO, adicionarDias } from "../models/emprestimo"

// Função que devolve "agora". Nos testes, é trocada por um relógio controlável.
export type Relogio = () => Date

export interface ResultadoDevolucao {
    readonly emprestimo : Emprestimo
    readonly diasDeAtraso : number
    readonly multaCentavos : number
}

export class ServicoEmprestimos {
    private emprestimos = new Map<string, Emprestimo>()
    private sequencia = 1

    constructor (
        private readonly acervo : Acervo,
        private readonly regras : RegrasEmprestimo = REGRAS_PADRAO,
        private readonly relogio : Relogio = () => new Date()
    ) {}

    emprestar(usuarioId: string, exemplarId: string): Emprestimo {
        if (!usuarioId.trim()) {
            throw new Error("O usuário é obrigatório.")
        }
        const exemplar = this.acervo.obterExemplar(exemplarId)
        if (!exemplar) {
            throw new Error(`Exemplar ${exemplarId} não encontrado.`)
        }
        if (this.listarAtivosDoUsuario(usuarioId).length >= this.regras.limitePorUsuario) {
            throw new Error(`O usuário atingiu o limite de ${this.regras.limitePorUsuario} empréstimos ativos.`)
        }

        exemplar.emprestar() // lança erro se o exemplar não estiver disponível

        const agora = this.relogio()
        const id = `EMP-${String(this.sequencia++).padStart(3, "0")}`
        const emprestimo = new Emprestimo(id, usuarioId, exemplarId, agora, adicionarDias(agora, this.regras.prazoDias))
        this.emprestimos.set(id, emprestimo)
        return emprestimo
    }

    devolver(emprestimoId: string): ResultadoDevolucao {
        const emprestimo = this.obterOuFalhar(emprestimoId)
        if (!emprestimo.ativo) {
            throw new Error("Este empréstimo já foi encerrado.")
        }

        // Um empréstimo só nasce de um exemplar existente, então o exemplar sempre é encontrado.
        const exemplar = this.acervo.obterExemplar(emprestimo.exemplarId)!
        exemplar.devolver()

        const agora = this.relogio()
        emprestimo.encerrar(agora)

        const diasDeAtraso = emprestimo.diasDeAtraso(agora)
        return { emprestimo, diasDeAtraso, multaCentavos: diasDeAtraso * this.regras.multaPorDiaCentavos }
    }

    renovar(emprestimoId: string): Emprestimo {
        const emprestimo = this.obterOuFalhar(emprestimoId)
        if (!emprestimo.ativo) {
            throw new Error("Não é possível renovar um empréstimo já encerrado.")
        }

        const agora = this.relogio()
        if (emprestimo.diasDeAtraso(agora) > 0) {
            throw new Error("Não é possível renovar um empréstimo em atraso.")
        }
        if (emprestimo.renovacoes >= this.regras.maxRenovacoes) {
            throw new Error(`O limite de renovações (${this.regras.maxRenovacoes}) foi atingido.`)
        }

        // O novo prazo conta a partir da data da renovação.
        emprestimo.registrarRenovacao(adicionarDias(agora, this.regras.prazoDias))
        return emprestimo
    }

    // Multa acumulada até agora (empréstimo ativo) ou fixada na devolução (empréstimo encerrado).
    calcularMulta(emprestimoId: string): number {
        const emprestimo = this.obterOuFalhar(emprestimoId)
        return emprestimo.diasDeAtraso(this.relogio()) * this.regras.multaPorDiaCentavos
    }

    obterEmprestimo(emprestimoId: string): Emprestimo | undefined {
        return this.emprestimos.get(emprestimoId)
    }

    listarAtivosDoUsuario(usuarioId: string): Emprestimo[] {
        return [...this.emprestimos.values()].filter(e => e.usuarioId === usuarioId && e.ativo)
    }

    listarAtrasados(): Emprestimo[] {
        const agora = this.relogio()
        return [...this.emprestimos.values()].filter(e => e.atrasado(agora))
    }

    private obterOuFalhar(emprestimoId: string): Emprestimo {
        const emprestimo = this.emprestimos.get(emprestimoId)
        if (!emprestimo) {
            throw new Error(`Empréstimo ${emprestimoId} não encontrado.`)
        }
        return emprestimo
    }
}