/* Erros de regra de negócio. Não sabem nada de HTTP: quem converte cada um
em código de status (400, 404, 409) é o middleware tratar-erros. */

export class ErroValidacao extends Error {
    constructor(mensagem: string) {
        super(mensagem)
        this.name = "ErroValidacao"
    }
}

export class ErroNaoEncontrado extends Error {
    constructor(mensagem: string) {
        super(mensagem)
        this.name = "ErroNaoEncontrado"
    }
}

export class ErroConflito extends Error {
    constructor(mensagem: string) {
        super(mensagem)
        this.name = "ErroConflito"
    }
}
