// importa o Usuario para descrever os tipos utilizados nesse contrato 
import type { Usuario } from "../domain/usuario";

// consulta o email antes do cadastro para produzir uma mensagem conflitante. A restrição 
// UNIQUE que já existe no SQLite é necessária para impedir duplicidades em cadastros simultaneos 

// será usado internamente pelo serviço de autenticação 
export interface UsuarioComCredenciais {
    usuario : Usuario
    senhaHash : string
}

export interface RepositorioUsuarios {
    // permite consultar se o email já está cadastrado e recuperar as credenciais para o login
    obterPorEmail (
        email : string
    ) : Promise<UsuarioComCredenciais | undefined>

    // recebe o hash para gravar
    salvar(
        usuario : Usuario,
        senhaHash : string, 
    ) : Promise<void>
}