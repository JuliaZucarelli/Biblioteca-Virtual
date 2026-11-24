import { beforeEach, describe, expect, it } from "vitest";
import express, { type Express } from "express";
import request from "supertest";
import { RegularUser } from "../domain/regular-user";
import { autenticar } from "../middlewares/autenticar";
import { tratarErros } from "../middlewares/tratar-erros";
import { ServicoTokens } from "../services/servico-tokens";

describe("Middleware de autenticação", () => {
    let app: Express;
    let tokens: ServicoTokens;

    beforeEach(() => {
        tokens = new ServicoTokens(
        "chave-de-teste-com-mais-de-32-bytes"
        );

        app = express();

        app.get(
        "/protegida",
        autenticar(tokens),
        (_req, res) => {
            res.json({
            usuario: res.locals.usuario,
            });
        }
        );

        app.use(tratarErros);
    });

    it("retorna 401 quando o token não é enviado", async () => {
        await request(app)
        .get("/protegida")
        .expect(401);
    });

    it("permite o acesso e disponibiliza a identidade validada", async () => {
        const usuario = new RegularUser(
        "U01",
        "Ana",
        "ana@email.com"
        );

        const token = tokens.gerarToken(usuario);

        const resposta = await request(app)
        .get("/protegida")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

        expect(resposta.body).toEqual({
        usuario: {
            id: "U01",
            papel: "MEMBRO",
        },
        });
    });
});