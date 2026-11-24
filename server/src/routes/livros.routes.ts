import { Router, type RequestHandler } from "express"
import type { LivrosController } from "../controllers/livros.controller"
import { metodoNaoPermitido } from "../middlewares/metodo-nao-permitido"
import { exigirAdmin } from "../middlewares/exigir-admin"

/* Recursos e hierarquia com barras:
/livros -> /livros/{id} -> /livros/{id}/exemplares -> /livros/{id}/exemplares/{exemplarId}
Cada recurso aceita só os métodos listados; qualquer outro recebe 405 (com o cabeçalho Allow).
GET aceita HEAD automaticamente (o Express responde só com os cabeçalhos). */
export function criarRotasLivros(c: LivrosController, autenticarUsuario : RequestHandler) : Router {
    const rotas = Router()

    rotas.route("/")
        .get(c.listar)                                  // GET    /api/livros          200
        .post(autenticarUsuario, exigirAdmin ,c.criar)                                  // POST   /api/livros          201
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id")
        .get(c.obter)                                   // GET    /api/livros/L01      200 | 404
        .put(autenticarUsuario, exigirAdmin, c.substituir)                              // PUT    /api/livros/L01      200 | 400 | 404 | 409
        .patch(autenticarUsuario, exigirAdmin, c.atualizar)                             // PATCH  /api/livros/L01      200 | 400 | 404 | 409
        .delete(autenticarUsuario, exigirAdmin, c.remover)                              // DELETE /api/livros/L01      204 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "PUT", "PATCH", "DELETE"]))

    rotas.route("/:id/exemplares")
        .get(c.listarExemplares)                        // GET    .../exemplares       200 | 404
        .post(autenticarUsuario, exigirAdmin, c.adicionarExemplar)                      // POST   .../exemplares       201 | 400 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id/exemplares/:exemplarId")
        .get(c.obterExemplar)                           // GET    .../exemplares/E001  200 | 404
        .delete(autenticarUsuario, exigirAdmin, c.removerExemplar)                      // DELETE .../exemplares/E001  204 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "DELETE"]))

    return rotas
}
