import jwt from "jsonwebtoken";
import type { Usuario } from "../domain/usuario";

export class ServicoTokens {
    // recebe segredo que será utilizado para assinar tokens
    constructor(
        private readonly segredo : string
    ) {
        // verifica o tamanho da chave em bytes
        if(Buffer.byteLength(segredo, "utf8") < 32) {
            throw new Error("A chave de assinatura deve possuir pelo menos 32 bytes.")
        }
    }

    // recebe a identidade já autenticada e devolve o token como texto
    gerarToken(usuario : Usuario) : string {
        // cria a assinatura e monta o JWT (https://github.com/auth0/node-jsonwebtoken)
        return jwt.sign(
            {
                papel : usuario.papel, // informa o papel obtido do usuário
            },
            this.segredo,
            {
                algorithm: "HS256",// define o algoritmo de assinatura
                subject : usuario.id, // registra o ID do usuário no campo sub
                expiresIn : "1h", // define validade de uma hora
                issuer : "biblioteca-virtual", // identifica a API emissora
                audience : "biblioteca-virtual-web" // identifica a aplicação destinatária
            }
        )
    }
}