/* REGRAS DE EMPRÉSTIMO 
- Limite de 3: conta os empréstimos ativos do usuário. Devolver libera uma vaga, e o limite é por usuário.
Um empréstimo bloqueado não consome o exemplar. 
- Prazo de 14 dias: o vencimento é a data do empréstimo mais 14 dias de calendário.
- Multa: R$0,50 por dia de atraso, calculado na devolução. 'calcularMulta' mostra o valor acumulado 
enquanto o livro não volta, e o valor fica fixo depois da devolução. 
- Renovação: estende o prazo em 14 dias a partir da data de renovação. Não renova empréstimos atrasados, 
já devolvidos ou que já atingiu o limite de renovações. */

export interface RegrasEmprestimo {
    readonly limitePorUsuario : number
    readonly prazoDias : number
    readonly multaPorDiaCentavos : number
    readonly maxRenovacoes : number
}

export const REGRAS_PADRAO : RegrasEmprestimo {
    limitePorUsuario: 3,
    prazoDias: 14,
    multaPorDiaCentavos: 50, 
    maxRenovacoes: 1,
}

const MS_POR_DIA = 24 * 60 * 60 * 1000

// soma dias de calendário
export function adicionarDias(data : Date, dias : number) : Date {
    const resultado = new Date(data)

    resultado.setDate(resultado.getDate() + dias)
    return resultado
}

function inicioDoDia(data : Date ) : Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

// diferença em dias de calendário entra duas datas, ignorando o horário
export function diferencaEmDias(a : Date, b : Date) : number {
    return Math.round((inicioDoDia(a).getTime() - inicioDoDia(b).getTime()) / MS_POR_DIA)
}

export class Emprestimo {
    private readonly _dataEmprestimo : Date
    private _dataVencimento : Date 
    private _dataDevolucao : Date | undefined
    private _renovacoes = 0

    constructor (
        public readonly id : string,
        public readonly usuarioId : string, 
        public readonly exemplarId : string, 
        dataEmprestimo : Date, 
        dataVencimento : Date
    ) {
        if(!id.trim()) {
            throw new Error(`O ID do empréstimo é obrigatório.`)
        }
        if(!usuarioId.trim()) {
            throw new Error(`O usuário do empréstimo é obrigatório.`)
        }
        if(!exemplarId.trim()) {
            throw new Error(`O exemplar do empréstimo é obrigatório.`)
        }
        if(dataVencimento.getTime() < dataEmprestimo.getTime()) {
            throw new Error(`O vencimento não pode ser anterior a data de empréstimo.`)
        }

        // guarda cópias: quem recebe uma Date não consegue alterar o empréstimo por fora
        this._dataEmprestimo = new Date(dataEmprestimo)
        this._dataVencimento = new Date(dataVencimento)
    }

    get dataEmprestimo() : Date {
        return new Date(this._dataEmprestimo)
    }

    get dataVencimento() : Date {
        return new Date(this._dataVencimento)
    }

    get dataDevolucao() : Date | undefined {
        return this._dataDevolucao ? new Date(this._dataDevolucao) : undefined
    }

    get renovacoes() : number {
        return this._renovacoes
    }

    get ativo() : boolean {
        return this._dataDevolucao === undefined
    }

    diasDeAtraso(referencia : Date) : number {
        const fim = this._dataDevolucao ?? referencia
        return Math.max(0, diferencaEmDias(fim, this._dataVencimento))
    }

    atrasado(referencia : Date) : boolean {
        return this.ativo && this.diasDeAtraso(referencia) > 0
    }

    encerrar(dataDevolucao : Date) : void {
        if(!this.ativo) {
            throw new Error(`Este empréstimo já foi encerrado.`)
        }
        this._dataDevolucao = new Date(dataDevolucao)
    }

    registrarRenovacao(novoVencimento : Date) : void {
        if(!this.ativo) {
            throw new Error(`Não é possível renovar um empréstimo já encerrado.`)
        }
        this._dataVencimento = new Date(novoVencimento)
        this._renovacoes++
    }
}