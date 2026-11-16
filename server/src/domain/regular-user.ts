import { Usuario } from "./usuario";

export class RegularUser extends Usuario {
    public readonly papel = "MEMBRO"

    constructor(id : string, nome : string, email : string) {
        super(id, nome, email)
    }

    // o usuário não tem permissão administrativa 
    public podeAdministrarAcervo(): boolean {
        return false 
    }
}