import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { abrirBanco, type Banco } from "../config/banco";
import { RepositorioUsuariosSQLite } from "../repositories/repositorio-usuarios-sqlite";
import { ServicoUsuarios } from "../services/servico-usuarios";
import { ServicoSessoes } from "../services/servico-sessoes";
import { ErroAutenticacao } from "../domain/erros";
import { ServicoTokens } from "../services/servico-tokens";

describe("Serviço de sessões", () => {
    let banco: Banco;
    let usuarios: ServicoUsuarios;
    let sessoes: ServicoSessoes;

    // cria um banco SQLite temporário e monta os serviços
    beforeEach(() => {
        banco = abrirBanco(":memory:");

        const repositorio = new RepositorioUsuariosSQLite(banco);

        usuarios = new ServicoUsuarios(repositorio);

        // chave exclusiva dos testes 
        const tokens = new ServicoTokens("chave-de-teste-com-mais-de-32-bytes");

        sessoes = new ServicoSessoes(repositorio, tokens);
    });

    // fecha o banco
    afterEach(() => {
        banco.close();
    });

    // autentica um usuário com e-mail e senha corretos, verifica se o usuário devolvido possui o mesmo ID do cadastro, nome, e-mail e papel MEMBRO
    it("autentica um usuário com e-mail e senha corretos", async () => {
        const cadastrado = await usuarios.cadastrar({
        nome: "Ana",
        email: "ana@email.com",
        senha: "SenhaDeTeste123!",
        });

        const autenticado = await sessoes.autenticar({
        email: "  ANA@EMAIL.COM  ",
        senha: "SenhaDeTeste123!",
        });

        expect(autenticado.id).toBe(cadastrado.id);
        expect(autenticado.nome).toBe("Ana");
        expect(autenticado.email).toBe("ana@email.com");
        expect(autenticado.papel).toBe("MEMBRO");
    });

    // rejeita a senha incorreta
    it("rejeita uma senha incorreta", async () => {
        await usuarios.cadastrar({
            nome: "Ana",
            email: "ana@email.com",
            senha: "SenhaDeTeste123!",
        });

        await expect(
            sessoes.autenticar({
            email: "ana@email.com",
            senha: "SenhaErrada123!",
            })
        ).rejects.toBeInstanceOf(ErroAutenticacao);
    });

    // rejeita um e-mail não cadastrado
    it("rejeita um e-mail não cadastrado", async () => {
        await expect(
            sessoes.autenticar({
            email: "inexistente@email.com",
            senha: "SenhaDeTeste123!",
            })
        ).rejects.toBeInstanceOf(ErroAutenticacao);
    });

    it("cria uma sessão com token válido para o usuário", async () => {
        const cadastrado = await usuarios.cadastrar({
            nome: "Ana",
            email: "ana@email.com",
            senha: "SenhaDeTeste123!",
        });

        const sessao = await sessoes.criarSessao({
            email: "ana@email.com",
            senha: "SenhaDeTeste123!",
        });

        expect(sessao.usuario.id).toBe(cadastrado.id);
        expect(sessao.usuario.email).toBe("ana@email.com");
        expect(sessao.token).toEqual(expect.any(String));

        const verificador = new ServicoTokens(
            "chave-de-teste-com-mais-de-32-bytes"
        );

        const identidade = verificador.verificarToken(sessao.token);

        expect(identidade).toEqual({
            id: cadastrado.id,
            papel: "MEMBRO",
        });
    });
});