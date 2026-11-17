import type { Banco } from "../config/banco";
import { AdminUser } from "../domain/admin-user";
import { RegularUser } from "../domain/regular-user";
import type { Usuario } from "../domain/usuario";
import { ErroConflito } from "../domain/erros";
import type { RepositorioUsuarios, UsuarioComCredenciais, } from "./repositorio-usuarios";

// descreve campos retornados pelo SQL
// o banco usa senha_hash enquanto o contrato do repositório usa senhaHash
interface LinhaUsuario {
  id: string
  nome: string
  email: string
  senha_hash: string
  papel: "ADMIN" | "MEMBRO"
}

export class RepositorioUsuariosSQLite implements RepositorioUsuarios {
    // recebe Banco para utilizar a conexão criada pela aplicação
    constructor(private readonly banco: Banco) {}

    // executa a consulta e o email é passado separadamente mantendo os dados 
    // quando encontra o registro, o método reconstrói AdminUser ou RegularUser pelo papel salvo no banco
    // e devolve o usuáruio com seu hash
    async obterPorEmail( email: string): Promise<UsuarioComCredenciais | undefined> {
        const linha = this.banco
        .prepare(`
            SELECT id, nome, email, senha_hash, papel
            FROM usuarios
            WHERE email = ?
        `)
        .get(email.trim().toLowerCase()) as LinhaUsuario | undefined;

        if (!linha) return undefined;

        const usuario =
        linha.papel === "ADMIN"
            ? new AdminUser(linha.id, linha.nome, linha.email)
            : new RegularUser(linha.id, linha.nome, linha.email)

        return {
        usuario,
        senhaHash: linha.senha_hash,
        }
    }

    // insere os dados recebidos
    // o hash deve ser produzido pelo serviço de cadastro antes dessa chamada
    async salvar(usuario: Usuario, senhaHash: string): Promise<void> {
        try {
        this.banco
            .prepare(`
            INSERT INTO usuarios (id, nome, email, senha_hash, papel)
            VALUES (?, ?, ?, ?, ?)
            `)
            .run(
            usuario.id,
            usuario.nome,
            usuario.email,
            senhaHash,
            usuario.papel
            )
        } catch (erro: unknown) { // cathc: duplicidade de email
        if (
            typeof erro === "object" &&
            erro !== null &&
            "code" in erro &&
            erro.code === "SQLITE_CONSTRAINT_UNIQUE"
        ) {
            throw new ErroConflito("Já existe um usuário com este e-mail.");
        }

        throw erro
        }
    }
}