import { Router } from "express"
import type { LivrosController } from "../controllers/livros.controller"
import { metodoNaoPermitido } from "../middlewares/metodo-nao-permitido"

/* Recursos (substantivos no plural) e hierarquia com barras:
/livros -> /livros/{id} -> /livros/{id}/exemplares -> /livros/{id}/exemplares/{exemplarId}
Cada recurso aceita só os métodos listados; qualquer outro recebe 405 (com o cabeçalho Allow).
GET aceita HEAD automaticamente (o Express responde só com os cabeçalhos). */
export function criarRotasLivros(c: LivrosController): Router {
    const rotas = Router()

    rotas.route("/")
        .get(c.listar)                                  // GET    /api/livros          200
        .post(c.criar)                                  // POST   /api/livros          201
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id")
        .get(c.obter)                                   // GET    /api/livros/L01      200 | 404
        .put(c.substituir)                              // PUT    /api/livros/L01      200 | 400 | 404 | 409
        .patch(c.atualizar)                             // PATCH  /api/livros/L01      200 | 400 | 404 | 409
        .delete(c.remover)                              // DELETE /api/livros/L01      204 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "PUT", "PATCH", "DELETE"]))

    rotas.route("/:id/exemplares")
        .get(c.listarExemplares)                        // GET    .../exemplares       200 | 404
        .post(c.adicionarExemplar)                      // POST   .../exemplares       201 | 400 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id/exemplares/:exemplarId")
        .get(c.obterExemplar)                           // GET    .../exemplares/E001  200 | 404
        .delete(c.removerExemplar)                      // DELETE .../exemplares/E001  204 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "DELETE"]))

    return rotas
}
