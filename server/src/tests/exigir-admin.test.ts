import { beforeEach, describe, expect, it } from "vitest";
import express, { type Express } from "express";
import request from "supertest";
import { AdminUser } from "../domain/admin-user";
import { RegularUser } from "../domain/regular-user";
import { autenticar } from "../middlewares/autenticar";
import { exigirAdmin } from "../middlewares/exigir-admin";
import { tratarErros } from "../middlewares/tratar-erros";
import { ServicoTokens } from "../services/servico-tokens";

describe("Permissão administrativa", () => {
    let app: Express;
    let tokens: ServicoTokens;

    // monta uma aplicação nova antes de cada teste
    beforeEach(() => {
        tokens = new ServicoTokens(
            "chave-de-teste-com-mais-de-32-bytes"
        );

        app = express();

        app.get(
            "/administrativa",
            autenticar(tokens), // verifica o token e disponibiliza a identidade
            exigirAdmin, // verifica o papel 
            (_req, res) => {
                res.json({ acesso: "permitido" }); // acessa caso o acesso seja autorizado
            }
        );

        app.use(tratarErros);
    });

    // 401: a autenticação bloqueia a requisição antes da verificação administrativa 
    it("retorna 401 quando não há token", async () => {
        await request(app)
            .get("/administrativa")
            .expect(401);
    });

    // 403: a autenticação passa, mas exigirAdmin bloqueia a operação
    it("retorna 403 quando o usuário é membro", async () => {
        const usuario = new RegularUser(
            "U01",
            "Ana",
            "ana@email.com"
        );

        const token = tokens.gerarToken(usuario);

        await request(app)
            .get("/administrativa")
            .set("Authorization", `Bearer ${token}`)
            .expect(403);
    });

    // 200: os dois middlewares permitem continuar, o expect também confirmar que a resposta veio do handler final
    it("permite o acesso de um administrador", async () => {
        const usuario = new AdminUser(
            "U02",
            "Bruna",
            "bruna@admin.com"
        );

        const token = tokens.gerarToken(usuario);

        const resposta = await request(app)
            .get("/administrativa")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(resposta.body).toEqual({
            acesso: "permitido",
        });
    });
});