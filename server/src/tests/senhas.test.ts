import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { gerarHashSenha } from "../services/senhas";
import { ErroValidacao } from "../domain/erros";

describe("Hash de senha", () => {
  it("gera um hash que corresponde à senha original", async () => {
    const senha = "SenhaDeTeste123!";

    const hash = await gerarHashSenha(senha);

    // confirma que o valor produzido é diferente da senha original
    expect(hash).not.toBe(senha);

    // verifica se a senha corresponde ao hash - mecanismo utilizado no login
    const corresponde = await bcrypt.compare(senha, hash);

    expect(corresponde).toBe(true);
  });

  // confirma que uma senha incorreta falha na comparação
  it("não aceita uma senha diferente da original", async () => {
  const hash = await gerarHashSenha("SenhaCorreta123!");

  const corresponde = await bcrypt.compare(
    "SenhaErrada123!",
    hash
  );

  expect(corresponde).toBe(false);
});

// verifica o limite do bcrypt 
it("rejeita senha que ultrapassa 72 bytes", async () => {
  const senha = "é".repeat(37);

  await expect(
    gerarHashSenha(senha)
  ).rejects.toBeInstanceOf(ErroValidacao);
  });

});