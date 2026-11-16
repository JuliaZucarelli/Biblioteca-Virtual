import { describe, expect, it } from "vitest"
import { AdminUser } from "../domain/admin-user"
import { RegularUser } from "../domain/regular-user"

// describe: agrupa os testes de usuários
// it: descreve um comportamento esperado 
// expect(...).toBe(...): compara o resultado obtido com o valor esperado
describe ("Usuários", () => {
    it("permite que o administrador gerencie o acervo", () => {
        const usuario = new AdminUser(
            "U01",
            "Julia",
            "julia@admin.com"
        )

        expect(usuario.papel).toBe("ADMIN")
        expect(usuario.podeAdministrarAcervo()).toBe(true)
    })

    it("impede que o membro comum gerencie o acervo", () => {
        const usuario = new RegularUser(
            "U02",
            "Erick",
            "erick@gmail.com"
        )

        expect(usuario.papel).toBe("MEMBRO")
        expect(usuario.podeAdministrarAcervo()).toBe(false)
    })

    it("remove espaços do nome e normaliza e-mail", () => {
        const usuario = new RegularUser(
            "U03",
            " Tomas ",
            " TOMAS@GMAIL.COM "
        )

        expect(usuario.nome).toBe("Tomas")
        expect(usuario.email).toBe("tomas@gmail.com")
    })
})