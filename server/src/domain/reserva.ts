export enum StatusReserva {
    ATIVA = "ATIVA",
    ATENDIDA = "ATENDIDA",
    CANCELADA = "CANCELADA"
}

/* Pedido de um usuário para pegar um livro que não tem exemplar disponível.
A reserva é do LIVRO (não de um exemplar): quem pega a próxima unidade liberada é o primeiro da fila. */
export class Reserva {
    private readonly _criadaEm : Date
    private _status : StatusReserva

    constructor (
        public readonly id : string,
        public readonly usuarioId : string,
        public readonly livroId : string,
        criadaEm : Date,
        status : StatusReserva = StatusReserva.ATIVA
    ) {
        if (!id.trim()) {
            throw new Error(`O ID da reserva é obrigatório.`)
        }
        if (!usuarioId.trim()) {
            throw new Error(`O usuário da reserva é obrigatório.`)
        }
        if (!livroId.trim()) {
            throw new Error(`O livro da reserva é obrigatório.`)
        }

        this._criadaEm = new Date(criadaEm) // cópia: ninguém altera a data por fora
        this._status = status
    }

    get criadaEm() : Date {
        return new Date(this._criadaEm)
    }

    get status() : StatusReserva {
        return this._status
    }

    get ativa() : boolean {
        return this._status === StatusReserva.ATIVA
    }

    // o titular pegou o livro emprestado
    atender() : void {
        if (!this.ativa) {
            throw new Error(`Esta reserva não está ativa.`)
        }
        this._status = StatusReserva.ATENDIDA
    }

    cancelar() : void {
        if (!this.ativa) {
            throw new Error(`Esta reserva não está ativa.`)
        }
        this._status = StatusReserva.CANCELADA
    }
}
