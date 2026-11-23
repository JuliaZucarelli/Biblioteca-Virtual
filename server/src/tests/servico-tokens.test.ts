import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { RegularUser } from "../domain/regular-user";
import { ServicoTokens } from "../services/servico-tokens";

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
});