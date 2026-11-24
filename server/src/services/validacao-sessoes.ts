import { ErroValidacao } from "../domain/erros";

// descrece os campos necessários para entrar
export interface DadosLogin {
    email : string
    senha : string
}

export function lerLogin(corpo : unknown) : DadosLogin {
    // verifica se o corpo é um objeto
    if(
        typeof corpo !== "object" || 
        corpo === null ||
        Array.isArray(corpo) 
    ) {
        throw new ErroValidacao("O corpo da requisição deve ser um objeto JSON.")
    }

    const dados = corpo as Record<string, unknown>
    const camposPermitidos = ["email", "senha"]

    // verifica se existem campos não permitidos -> ["email", "senha"]
    if(
        Object.keys(dados).some(
            (campo => !camposPermitidos.includes(campo))
        )
    ) {
        throw new ErroValidacao("O login contém campos não permitidos.")
    }

    // verifica o e-mail
    if(
        typeof dados.email !== "string" ||
        !dados.email.trim()
    ) {
        throw new ErroValidacao("O e-mail é obrigatório.")
    }

    // verifica a senha
    if(
        typeof dados.senha !== "string" ||
        dados.senha.length === 0
    ) {
        throw new ErroValidacao("A senha é obrigatória.")
    }

    return {
        email : dados.email.trim().toLowerCase(),
        senha : dados.senha,
    }
}