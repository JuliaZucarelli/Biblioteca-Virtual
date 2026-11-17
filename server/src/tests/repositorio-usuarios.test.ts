import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { abrirBanco,  type Banco } from "../config/banco";
import { RegularUser } from "../domain/regular-user";
import { RepositorioUsuariosSQLite } from "../repositories/repositorio-usuarios-sqlite";

describe("Repositórios de usuários", () => {
    let banco : Banco
    let repositorio : RepositorioUsuariosSQLite

    // cria um banco novo antes de cada teste    
    beforeEach(() => {
        banco = abrirBanco(":memory:") // :memory: : mantém esse banco temporariamente em memória, sem alterar o arquivo usado pela aplicação
        repositorio = new RepositorioUsuariosSQLite(banco)
    })

    // fecha a conexão ao terminar cada teste
    afterEach(() => {
        banco.close()
    })

    it("salva e consulta um membro pelo email", async () => {
        const usuario = new RegularUser(
            "U01",
            "Erick",
            "erick@gmail.com"
        )

        await repositorio.salvar(usuario, "hash-de-teste")

        const resultado = await repositorio.obterPorEmail(
            "erick@gmail.com"
        )

        expect(resultado?.usuario.id).toBe("U01")
        expect(resultado?.usuario.nome).toBe("Erick")
        expect(resultado?.usuario.papel).toBe("MEMBRO")
        expect(resultado?.usuario).toBeInstanceOf(RegularUser)
        expect(resultado?.senhaHash).toBe("hash-de-teste")
    })
})