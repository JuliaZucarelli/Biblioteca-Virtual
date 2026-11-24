/* Erros de regra de negócio. Não sabem nada de HTTP: quem converte cada um
em código de status (400, 401, 403, 404, 409) é o middleware tratar-erros. */

export class ErroValidacao extends Error {
    constructor(mensagem: string) {
        super(mensagem)
        this.name = "ErroValidacao"
    }
}

// quem está fazendo a requisição não foi identificado (ou não existe)
export class ErroNaoAutenticado extends Error {
    constructor(mensagem: string) {
        super(mensagem)
        this.name = "ErroNaoAutenticado"
    }
}

// o usuário foi identificado, mas o recurso é de outra pessoa
export class ErroProibido extends Error {
    constructor(mensagem: string) {
        super(mensagem)
        this.name = "ErroProibido"
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

export class ErroAutenticacao extends Error {
    constructor(mensagem : string) {
        super(mensagem)
        this.name = "ErroAutenticacao"
    }
}

export class ErroPermissao extends Error {
    constructor(mensagem : string) {
        super(mensagem)
        this.name = "ErroPermissao"
    }
}