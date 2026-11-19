import { randomUUID } from "node:crypto";
import { AdminUser } from "../domain/admin-user";
import { RegularUser } from "../domain/regular-user";
import type { Usuario } from "../domain/usuario";
import { ErroConflito } from "../domain/erros";
import type { RepositorioUsuarios } from "../repositories/repositorio-usuarios";
import { gerarHashSenha } from "./senhas";
import { lerCadastro } from "./validacao-usuarios";

/* execução do cadastro: 
validar dados -> verificar e-mail -> gerar hash -> criar usuários com seu papel -> salvar -> devolver usuário
*/

export class ServicoUsuarios {
    // fornece o armazenamento ao serviço por dependência
    constructor(
        private readonly repositorio : RepositorioUsuarios
    ) {}

    async cadastrar(corpo : unknown) : Promise<Usuario> {
        // valida os campos e devolve nome e e-mail normalizados
        const dados = lerCadastro(corpo)

        // verifica se o e-mail já está cadastrado
        const existente = await this.repositorio.obterPorEmail(dados.email)

        // verifica se o e-mail já está cadastrado
        if(existente) {
            throw new ErroConflito("Já existe um usuários com este e-mail.")
        }

        // transforma a senha no valor que será armazenado
        // o await aguarda sua geração 
        const senhaHash = await gerarHashSenha(dados.senha)
        const id = randomUUID() // gera um identificador para o usuário usando uma função do node

        const usuario = dados.email.endsWith("@admin.com")
            ? new AdminUser(id, dados.nome, dados.email)
            : new RegularUser(id, dados.nome, dados.email)
        
        await this.repositorio.salvar(usuario, senhaHash)

        return usuario
    }
}