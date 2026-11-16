import { Usuario } from "./usuario";

// recebe os dados e comportamento de Usuario
export class AdminUser extends Usuario {
    public readonly papel = "ADMIN"

    constructor(id : string, nome : string, email : string) {
        // super: serve para acessar e chamar recursos da classe pai (superclasse) dentro de uma classe filha (subclasse)
        super(id, nome, email)
    }

    // indica permissão administrativa
    public podeAdministrarAcervo(): boolean {
        return true
    }

}