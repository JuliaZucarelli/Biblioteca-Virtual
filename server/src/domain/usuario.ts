// limita os papéis aos dois valores aceitos pelo banco 
export type PapelUsuario = "ADMIN" | "MEMBRO"

// abstract: define uma base compartilhada onde as instâncias serão AdminUser ou RegularUser (definir)
export abstract class Usuario {
    public readonly id : string; 
    public readonly nome : string; 
    public readonly email : string; 

    // exige que cada classe filha informe seu papel
    public abstract readonly papel : PapelUsuario; 

    protected constructor(id : string, nome : string, email : string) {
        // validações para impedir de criar usuários com campos obrigatórios vazios
        if (!id.trim()) {
            throw new Error("O ID do usuário é obrigatório.")
        }

        if (!nome.trim()) {
            throw new Error("O nome do usuário é obrigatório.")
        }

        if (!email.trim()) {
            throw new Error("O e-mail do usuário é obrigatório.")
        }

        this.id = id.trim()
        this.nome = nome.trim()
        this.email = email.trim().toLowerCase()
    }

    // exige um comportamento de permissão de cada classe filha (vai usar na autorização)
    public abstract podeAdministrarAcervo() : boolean
}