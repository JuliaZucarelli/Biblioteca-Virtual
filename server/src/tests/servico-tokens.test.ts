import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { RegularUser } from "../domain/regular-user";
import { ServicoTokens } from "../services/servico-tokens";
import { ErroAutenticacao } from "../domain/erros";

describe("Serviço de tokens", () => {
    it("gera um token válido com a identidade do usuário", () => {
        const segredo = "chave-de-teste-com-mais-de-32-bytes";
        const tokens = new ServicoTokens(segredo);

        const usuario = new RegularUser(
        "U01",
        "Ana",
        "ana@email.com"
        );

        // produz o JWT para o usuário informado
        const token = tokens.gerarToken(usuario);

        // confere assinatura, validade, algoritmo, emissor e destinatário
        // se a verificação falhar, lança um erro e o teste falha
        const conteudo = jwt.verify(token, segredo, {
        algorithms: ["HS256"],
        issuer: "biblioteca-virtual",
        audience: "biblioteca-virtual-web",
        });

        // verifica os campos indicados, permitindo que existam outros campos no conteúdo
        expect(conteudo).toMatchObject({
        sub: "U01",
        papel: "MEMBRO",
        iss: "biblioteca-virtual",
        aud: "biblioteca-virtual-web",
        exp: expect.any(Number), // confirma a presença da expiração como número
        });
    });

    it("recupera a identidade de um token válido", () => {
        const tokens = new ServicoTokens(
            "chave-de-teste-com-mais-de-32-bytes"
        );

        const usuario = new RegularUser(
            "U01",
            "Ana",
            "ana@email.com"
        );

        const token = tokens.gerarToken(usuario);

        expect(tokens.verificarToken(token)).toEqual({
            id: "U01",
            papel: "MEMBRO",
        });
        });

        it("rejeita um token assinado com outra chave", () => {
        const emissor = new ServicoTokens(
            "primeira-chave-de-teste-com-32-bytes"
        );

        const verificador = new ServicoTokens(
            "segunda-chave-de-teste-com-32-bytes"
        );

        const usuario = new RegularUser(
            "U01",
            "Ana",
            "ana@email.com"
        );

        const token = emissor.gerarToken(usuario);

        expect(() => verificador.verificarToken(token))
            .toThrow(ErroAutenticacao);
        });
});