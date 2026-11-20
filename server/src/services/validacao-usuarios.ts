import { ErroValidacao } from "../domain/erros";

// a escolhe entre membro e administrador será feita pelo servidor 

/* estrutura aceita: 
"nome" : "Erick",
"email" : "erick@gmail.com",
"senha" : "Senha123!"

*/

// descreve os dados que o serviço receberá após a validação
export interface DadosCadastro { 
    nome : string
    email : string 
    senha : string
}

// unknown: exige conferir o conteúdo recebido antes de utilizá-lo
export function lerCadastro(corpo : unknown) : DadosCadastro {
    // verifica se o corpo é um objeto JSON
    if(
        typeof corpo !== "object" || // rejeita textos, números, booleanos e undefined
        corpo === null || 
        Array.isArray(corpo) // rejeita listas 
    ) {
        throw new ErroValidacao("O corpo da requisição deve ser um objeto JSON.")
    }

    // Record<string, unknown> : permite acessar os campos mantendo seus valores como desconhecidos até verificar os tipos
    const dados = corpo as Record<string, unknown>

    const camposPermitidos = ["nome", "email", "senha"]

    // rejeita campos que o cadastro não permite 
    // lista de camposPermitos: ["nome", "email", "senha"]
    if(
        Object.keys(dados).some((campo) => ! camposPermitidos.includes(campo))
    ) {
        throw new ErroValidacao("O cadastro contém campos não permitidos.")
    }

    // verifica o nome 
    if(
        typeof dados.nome !== "string" ||
        !dados.nome.trim()
    ) {
        throw new ErroValidacao("O nome é obrigatório.")
    }

    // conferir o tipo de e-mail    
    if(typeof dados.email !== "string") {
        throw new ErroValidacao("O e-mail é obrigatório.")
    }

    const email = dados.email.trim().toLowerCase()

    // conferir o formato básico do email 
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ErroValidacao("Informe um e-mail válido.")
    }

    // conferir o tipo e o tamanho mínimo da senha
    if(
        typeof dados.senha !== "string" || 
        dados.senha.length < 8
    ) {
        throw new ErroValidacao("A senha deve possuir pelo menos 8 caracteres.")
    }

    return {
        nome : dados.nome.trim(), 
        email, 
        senha : dados.senha,
    }
}
    