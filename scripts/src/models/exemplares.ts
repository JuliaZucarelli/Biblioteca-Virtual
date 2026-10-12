import {Livro} from "./livro"

export enum StatusExemplar {
    DISPONIVEL = "DISPONIVEL",
    EMPRESTADO = "EMPRESTADO",
    RESERVADO = "RESERVADO",
    INDISPONIVEL = "INDISPONIVEL"
}

export class Exemplar {
    private _status: StatusExemplar

    constructor (
        public readonly id : string,
        public readonly livroId : string, // referência ao Livro (1 livro -> N exemplares)
        public readonly codigo : string,
        status : StatusExemplar = StatusExemplar.DISPONIVEL // inicializa o status do livro como disponível 
    ) {
        if (!id.trim()) {
            throw new Error('O ID do exemplar é obrigatório.')
        }
        if (!livroId.trim()) {
            throw new Error('O exemplar deve estar vinculado a um livro.')
        }
        if (!codigo.trim()) {
            throw new Error('O código do exemplar é obrigatório.')
        }

        this._status = status
    }

    get status() : StatusExemplar {
        return this.status // acessa a propriedade interna da própria classe e entrega o valor dela para quem solicitou
    }

    /* propriedade computada: ao invés de guardar uma variável extra para saber se o item está livre ou não,
    o código calcula isso na hora olhando diratamente o status atual */
    get disponivel() : boolean {
        return this._status === StatusExemplar.DISPONIVEL // comparação entre status atual do objeto e a constante DISPONIVEL
    }

    emprestar() : void {
        if (!this.disponivel) {
            throw new Error('O exemplar ${this.codigo} não está disponível para empréstimo.')
        }
        this._status = StatusExemplar.EMPRESTADO
    }

    devolver() : void {
        if (this._status !== StatusExemplar.EMPRESTADO) {
            throw new Error('O exemplar ${this.codigo} não está emprestado.')
        }
        this._status = StatusExemplar.DISPONIVEL
    }

    marcarIndisponivel() : void {
        this._status = StatusExemplar.INDISPONIVEL
    }
}
