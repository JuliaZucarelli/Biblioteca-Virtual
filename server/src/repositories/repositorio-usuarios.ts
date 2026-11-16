import type { Usuario } from "../domain/usuario";

export interface UsuarioComCredenciais {
    usuario : Usuario
    senhaHash : string
}

export interface RepositorioUsuarios {
    obterPorEmail (
        email : string
    ) : Promise<UsuarioComCredenciais | undefined>

    salvar(
        usuario : Usuario,
        senhaHash : string, 
    ) : Promise<void>
}