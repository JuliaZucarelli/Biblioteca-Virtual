import bcrypt from "bcryptjs"; 
import { ErroValidacao } from "../domain/erros";

export async function gerarHashSenha(senha : string) : Promise<string> { 
    // identifica senhas que ultrapassam 72 bytes do bcrypt 
    if (bcrypt.truncates(senha)) {
        throw new ErroValidacao("A senha deve possuir no máximo 72 bytes.")
    }

    // genha o hash usando o fator de custo 10 que controla o esforço computacional da operação
    return bcrypt.hash(senha, 10)
}