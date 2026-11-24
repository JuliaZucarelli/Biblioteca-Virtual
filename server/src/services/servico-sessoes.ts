import bcrypt from "bcryptjs";
import { ErroAutenticacao } from "../domain/erros";
import type { Usuario } from "../domain/usuario";
import type { RepositorioUsuarios } from "../repositories/repositorio-usuarios";
import { lerLogin } from "./validacao-sessoes";
import type { ServicoTokens } from "./servico-tokens";

export class ServicoSessoes {
    constructor (
        private readonly repositorio : RepositorioUsuarios,
        private readonly tokens : ServicoTokens
    ) {}

    async autenticar(corpo : unknown) : Promise<Usuario> {
        // valida os campos e normaliza o e-mail
        const dados = lerLogin(corpo)

        // procura o cadastro e recupera o usuário com seu hash
        const registro = await this.repositorio.obterPorEmail(dados.email)

        // rejeita a autenticação quando o usuário não existe ou quando a senha ultrapassa os 72 bytes
        if(!registro || bcrypt.truncates(dados.senha)) {
            throw new ErroAutenticacao("E-mail ou senha inválidos.")
        }

        // compara a senha informada com o hash armazenado e devolve o booleano
        const senhaCorreta = await bcrypt.compare(dados.senha, registro.senhaHash)

        // lança o erro de autenticação quando a comparação returna false
        if(!senhaCorreta) {
            throw new ErroAutenticacao("E-mail ou senha inválidos.")
        }

        return registro.usuario
    }

    // validar credenciais -> obter usuário -> gerar token -> devolver
    async criarSessao(corpo : unknown) : Promise<{
        token : string
        usuario : Usuario
    }> {
        // se autenticar lançar um erro, a execução será interrompida antes de gerar o token
        const usuario = await this.autenticar(corpo)

        const token = this.tokens.gerarToken(usuario)

        return {
            token,
            usuario,
        }
    }
}