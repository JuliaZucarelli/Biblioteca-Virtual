import type { Response } from "express"
import { ErroNaoAutenticado } from "../domain/erros"

export function usuarioDaRequisicao(res: Response): string {
    const id: unknown = res.locals.usuario?.id
    if (typeof id !== "string" || !id) {
        throw new ErroNaoAutenticado("Informe um token de autenticação válido.")
    }
    return id
}
