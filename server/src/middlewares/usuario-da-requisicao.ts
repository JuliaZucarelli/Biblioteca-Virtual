import type { Request } from "express"
import { ErroNaoAutenticado } from "../domain/erros"

/* Descobre quem está fazendo a requisição.

ATENÇÃO: o projeto ainda não tem login com JWT (RF07/RF08), então, por enquanto, o cliente informa o
próprio id no cabeçalho "X-Usuario-Id". Isso NÃO é seguro (qualquer um pode mandar o id de outra pessoa);
serve só para as rotas de empréstimo funcionarem e serem testadas.

Quando o login existir, troque o corpo desta função para validar o token (Authorization: Bearer ...)
e devolver o id do usuário que está no token. O resto do código não precisa mudar. */
export function usuarioDaRequisicao(req: Request): string {
    const id = req.header("x-usuario-id")?.trim()
    if (!id) {
        throw new ErroNaoAutenticado("Informe o usuário no cabeçalho X-Usuario-Id.")
    }
    return id
}
