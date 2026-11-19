import { afterEach, beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { abrirBanco, type Banco } from "../config/banco";
import { RegularUser } from "../domain/regular-user";
import { RepositorioUsuariosSQLite } from "../repositories/repositorio-usuarios-sqlite";
import { ServicoUsuarios } from "../services/servico-usuarios";
import { AdminUser } from "../domain/admin-user";
import { ErroConflito } from "../domain/erros";

describe("Serviço de usuários", () => {
    let banco: Banco;
    let repositorio: RepositorioUsuariosSQLite;
    let servico: ServicoUsuarios;

    beforeEach(() => {
        banco = abrirBanco(":memory:");
        repositorio = new RepositorioUsuariosSQLite(banco);
        servico = new ServicoUsuarios(repositorio);
    });

    afterEach(() => {
        banco.close();
    });

    // teste cadastro completo de um membro
    it("cadastra um membro e persiste o hash da senha", async () => {
        const senha = "SenhaDeTeste123!";

        const usuario = await servico.cadastrar({
        nome: "  Ana  ",
        email: "  ANA@EMAIL.COM  ",
        senha,
        });

        expect(usuario).toBeInstanceOf(RegularUser);
        expect(usuario.nome).toBe("Ana");
        expect(usuario.email).toBe("ana@email.com");
        expect(usuario.papel).toBe("MEMBRO");
        expect(usuario.id).not.toBe("");

        const registro = await repositorio.obterPorEmail(
        "ana@email.com"
        );

        if (!registro) {
        throw new Error("O usuário não foi encontrado no banco.");
        }

        expect(registro.usuario.id).toBe(usuario.id);
        expect(registro.senhaHash).not.toBe(senha);

        const corresponde = await bcrypt.compare(
        senha,
        registro.senhaHash
        );

        expect(corresponde).toBe(true);
    });

    // teste de atribuição do papel de administrador pelo e-mail
    it("cadastra um administrador para o domínio admin.com", async () => {
        const usuario = await servico.cadastrar({
            nome: "Julia",
            email: "  JULIA@ADMIN.COM  ",
            senha: "SenhaDeTeste123!",
        });

        expect(usuario).toBeInstanceOf(AdminUser);
        expect(usuario.email).toBe("julia@admin.com");
        expect(usuario.papel).toBe("ADMIN");
        expect(usuario.podeAdministrarAcervo()).toBe(true);

        const registro = await repositorio.obterPorEmail(
            "julia@admin.com"
        );

        expect(registro?.usuario).toBeInstanceOf(AdminUser);
        expect(registro?.usuario.papel).toBe("ADMIN");
    });

    // teste para ver se o serviço rejeita um cadastro com e-mail já utilizado
    it("rejeita cadastro com e-mail já utilizado", async () => {
        await servico.cadastrar({
            nome: "Ana",
            email: "ana@email.com",
            senha: "SenhaDeTeste123!",
        });

        await expect(
            servico.cadastrar({
            nome: "Outra pessoa",
            email: "  ANA@EMAIL.COM  ",
            senha: "OutraSenha123!",
            })
        ).rejects.toBeInstanceOf(ErroConflito);

        const registro = await repositorio.obterPorEmail(
            "ana@email.com"
        );

        expect(registro?.usuario.nome).toBe("Ana");
    });
});