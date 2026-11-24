import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { criarApp } from "../app";
import { abrirBanco, type Banco } from "../config/banco";
import { RepositorioSQLite } from "../repositories/repositorio-sqlite";
import { RepositorioUsuariosSQLite } from "../repositories/repositorio-usuarios-sqlite";
import { ServicoTokens } from "../services/servico-tokens";

describe("API de sessões", () => {
    let banco: Banco;
    let app: ReturnType<typeof criarApp>;
    let tokens: ServicoTokens;

    // monta a aplicação com o banco temporário e chave exclusiva de teste
    beforeEach(() => {
        banco = abrirBanco(":memory:");

        tokens = new ServicoTokens(
        "chave-de-teste-com-mais-de-32-bytes"
        );

        app = criarApp(
        new RepositorioSQLite(banco),
        new RepositorioUsuariosSQLite(banco),
        tokens
        );
    });

    afterEach(() => {
        banco.close();
    });

    it("retorna 201 com token válido e dados públicos do usuário", async () => {
        const cadastro = await request(app)
        .post("/api/usuarios")
        .send({
            nome: "Ana",
            email: "ana@email.com",
            senha: "SenhaDeTeste123!",
        })
        .expect(201);

        const resposta = await request(app)
        .post("/api/sessoes")
        .send({
            email: "ana@email.com",
            senha: "SenhaDeTeste123!",
        });

        expect(resposta.status).toBe(201);
        expect(resposta.body.usuario).toEqual(cadastro.body);
        expect(resposta.body.token).toEqual(expect.any(String));

        expect(Object.keys(resposta.body).sort()).toEqual(
        ["token", "usuario"]
        );

        expect(tokens.verificarToken(resposta.body.token)).toEqual({
        id: cadastro.body.id,
        papel: "MEMBRO",
        });
    });

    it("retorna 401 quando a senha está incorreta", async () => {
        await request(app)
        .post("/api/usuarios")
        .send({
        nome: "Ana",
        email: "ana@email.com",
        senha: "SenhaDeTeste123!",
        })
        .expect(201);

        const resposta = await request(app)
            .post("/api/sessoes")
            .send({
            email: "ana@email.com",
            senha: "SenhaErrada123!",
            });

        expect(resposta.status).toBe(401);
        expect(resposta.body).toEqual({
            erro: "E-mail ou senha inválidos.",
        });
    });

    it("retorna 400 quando a senha não é enviada", async () => {
        const resposta = await request(app)
            .post("/api/sessoes")
            .send({
            email: "ana@email.com",
            });

        expect(resposta.status).toBe(400);
        expect(resposta.body).toEqual({
            erro: "A senha é obrigatória.",
        });
    });
});