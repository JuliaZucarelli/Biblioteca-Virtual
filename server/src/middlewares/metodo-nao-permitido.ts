import type { Request, Response } from "express"

/* Usado no fim de cada rota: se o caminho existe mas o método HTTP não é aceito,
responde 405 Method Not Allowed com o cabeçalho Allow listando os métodos válidos.
OPTIONS recebe 204 com a mesma lista (é assim que o cliente descobre o que pode usar). */
export function metodoNaoPermitido(permitidos: string[]) {
    const allow = [...permitidos, "OPTIONS"].join(", ")

    return (req: Request, res: Response): void => {
        res.set("Allow", allow)
        if (req.method === "OPTIONS") {
            res.status(204).end()
            return
        }
        res.status(405).json({ erro: `O método ${req.method} não é permitido neste recurso.` })
    }
}
