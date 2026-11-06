import type { NextFunction, Request, Response } from "express"
import { ErroConflito, ErroNaoEncontrado, ErroValidacao } from "../domain/erros"

/* Último middleware: transforma qualquer erro em uma resposta JSON { erro: "mensagem" }.
  ErroValidacao      -> 400 Bad Request
  ErroNaoEncontrado  -> 404 Not Found
  ErroConflito       -> 409 Conflict
  JSON malformado    -> 400 (o body-parser do Express sinaliza com type "entity.parse.failed")
  qualquer outro     -> 500, com mensagem genérica (o detalhe fica só no log do servidor) */
export function tratarErros(erro: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (erro instanceof ErroValidacao) {
        res.status(400).json({ erro: erro.message })
        return
    }
    if (erro instanceof ErroNaoEncontrado) {
        res.status(404).json({ erro: erro.message })
        return
    }
    if (erro instanceof ErroConflito) {
        res.status(409).json({ erro: erro.message })
        return
    }

    const tipo = typeof erro === "object" && erro !== null && "type" in erro ? erro.type : undefined
    if (tipo === "entity.parse.failed") {
        res.status(400).json({ erro: "O corpo da requisição não é um JSON válido." })
        return
    }
    if (tipo === "entity.too.large") {
        res.status(413).json({ erro: "O corpo da requisição é grande demais." })
        return
    }

    console.error("Erro na API:", erro)
    res.status(500).json({ erro: "Não foi possível processar a requisição." })
}
