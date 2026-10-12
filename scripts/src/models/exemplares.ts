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
            throw new Error(`O ID do exemplar é obrigatório.`)
        }
        if (!livroId.trim()) {
            throw new Error(`O exemplar deve estar vinculado a um livro.`)
        }
        if (!codigo.trim()) {
            throw new Error(`O código do exemplar é obrigatório.`)
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
            throw new Error(`O exemplar ${this.codigo} não está disponível para empréstimo.`)
        }
        this._status = StatusExemplar.EMPRESTADO
    }

    devolver() : void {
        if (this._status !== StatusExemplar.EMPRESTADO) {
            throw new Error(`O exemplar ${this.codigo} não está emprestado.`)
        }
        this._status = StatusExemplar.DISPONIVEL
    }

    marcarIndisponivel() : void {
        this._status = StatusExemplar.INDISPONIVEL
    }
}

/* Guarda livros e exemplares em memória e mantém a relação entre eles */
export class Acervo {
    // cria banco de dados temporários na memória
    private livros = new Map <string, Livro> ()
    private exemplares = new Map <string, Exemplar> ()

    adicionarLivro (livro : Livro) : void {
        if (!this.livros.has(livro.id)) { // verifica se aquele id já é um livro cadastrado
            throw new Error(`Já existe um livro com o ID ${livro.id}.`)
        }
        this.livros.set(livro.id, livro)
    }

    adicionarExemplares(exemplar : Exemplar) : void {
        if (!this.livros.has(exemplar.livroId)) {
            throw new Error(`Livro ${exemplar.livroId} não encontrado.`)
        }
        if (!this.exemplares.has(exemplar.id)) {
            throw new Error(`Já existe um exemplar com o ID ${exemplar.id}`)
        }
        this.exemplares.set(exemplar.id, exemplar)
    }    
}