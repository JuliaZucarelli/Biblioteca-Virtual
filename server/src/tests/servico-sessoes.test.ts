import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { abrirBanco, type Banco } from "../config/banco";
import { RepositorioUsuariosSQLite } from "../repositories/repositorio-usuarios-sqlite";
import { ServicoUsuarios } from "../services/servico-usuarios";
import { ServicoSessoes } from "../services/servico-sessoes";
import { ErroAutenticacao } from "../domain/erros";

describe("Serviço de sessões", () => {
    let banco: Banco;
    let usuarios: ServicoUsuarios;
    let sessoes: ServicoSessoes;

    beforeEach(() => {
        banco = abrirBanco(":memory:");

        const repositorio = new RepositorioUsuariosSQLite(banco);

        usuarios = new ServicoUsuarios(repositorio);
        sessoes = new ServicoSessoes(repositorio);
    });

    afterEach(() => {
        banco.close();
    });

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

        it("rejeita um e-mail não cadastrado", async () => {
        await expect(
            sessoes.autenticar({
            email: "inexistente@email.com",
            senha: "SenhaDeTeste123!",
            })
        ).rejects.toBeInstanceOf(ErroAutenticacao);
    });
});