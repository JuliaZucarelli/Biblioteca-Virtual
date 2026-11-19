import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { criarApp } from "../app";
import { abrirBanco, type Banco } from "../config/banco";
import { RepositorioSQLite } from "../repositories/repositorio-sqlite";
import { RepositorioUsuariosSQLite } from "../repositories/repositorio-usuarios-sqlite";

describe("API de usuários", () => {
    let banco: Banco;
    let app: ReturnType<typeof criarApp>;

    beforeEach(() => {
        banco = abrirBanco(":memory:");

        app = criarApp(
        new RepositorioSQLite(banco),
        new RepositorioUsuariosSQLite(banco)
        );
    });

    afterEach(() => {
        banco.close();
    });

    // teste automatizado da rota de HTTP
    it("cadastra um membro e retorna somente os dados públicos", async () => {
        const resposta = await request(app)
        .post("/api/usuarios")
        .send({
            nome: "Bruna",
            email: "bruna@email.com",
            senha: "SenhaDeTeste123!",
        });

        expect(resposta.status).toBe(201);
        expect(resposta.body.id).toEqual(expect.any(String));
        expect(resposta.body.nome).toBe("Bruna");
        expect(resposta.body.email).toBe("bruna@email.com");
        expect(resposta.body.papel).toBe("MEMBRO");

        expect(Object.keys(resposta.body).sort()).toEqual(
        ["id", "nome", "email", "papel"].sort()
        );

        expect(resposta.headers.location).toBe(`/api/usuarios/${resposta.body.id}`);
    });

    // teste se a rota corresponde ao conflito 409  para um e-mail repetido
    it("retorna 409 quando o e-mail já está cadastrado", async () => {
        await request(app)
            .post("/api/usuarios")
            .send({
            nome: "Ana",
            email: "ana@email.com",
            senha: "SenhaDeTeste123!",
            })
            .expect(201);

        const resposta = await request(app)
            .post("/api/usuarios")
            .send({
            nome: "Outra pessoa",
            email: "  ANA@EMAIL.COM  ",
            senha: "OutraSenha123!",
            });

        expect(resposta.status).toBe(409);
        expect(resposta.body.erro).toEqual(expect.any(String));
    });

    // teste para verificar a resposta 400 para dados inválidos
    it("retorna 400 quando a senha possui menos de 8 caracteres", async () => {
        const resposta = await request(app)
            .post("/api/usuarios")
            .send({
            nome: "Ana",
            email: "ana@email.com",
            senha: "123",
            });

            expect(resposta.status).toBe(400);
            expect(resposta.body.erro).toBe("A senha deve possuir pelo menos 8 caracteres.");
    });

    it("retorna 400 quando o cliente tenta informar o papel", async () => {
        const resposta = await request(app)
        .post("/api/usuarios")
        .send({
        nome: "Ana",
        email: "ana@email.com",
        senha: "SenhaDeTeste123!",
        papel: "ADMIN",
        });

        expect(resposta.status).toBe(400);
        expect(resposta.body.erro).toBe(
            "O cadastro contém campos não permitidos."
        );
    });
});