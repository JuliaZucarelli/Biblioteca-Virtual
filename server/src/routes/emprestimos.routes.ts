import { Router, type RequestHandler } from "express"
import type { EmprestimosController } from "../controllers/emprestimos.controller"
import { metodoNaoPermitido } from "../middlewares/metodo-nao-permitido"

/* /emprestimos -> /emprestimos/{id} -> /emprestimos/{id}/devolucao e /emprestimos/{id}/renovacoes
Todas as rotas exigem o usuÃ¡rio identificado (401 sem identificaÃ§Ã£o). Cada recurso aceita sÃ³ os mÃ©todos
listados; qualquer outro recebe 405 (com o cabeÃ§alho Allow). */
export function criarRotasEmprestimos(c: EmprestimosController, autenticar: RequestHandler): Router {
    const rotas = Router()

    rotas.route("/")
        .get(autenticar, c.listarEmprestimos)                       // GET  /api/emprestimos          200 | 401
        .post(autenticar, c.emprestar)                              // POST /api/emprestimos          201 | 400 | 401 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id")
        .get(autenticar, c.obterEmprestimo)                         // GET  /api/emprestimos/EMP-001  200 | 401 | 403 | 404
        .all(metodoNaoPermitido(["GET", "HEAD"]))

    rotas.route("/:id/devolucao")
        .post(autenticar, c.devolver)                               // POST .../devolucao             200 | 401 | 403 | 404 | 409
        .all(metodoNaoPermitido(["POST"]))

    rotas.route("/:id/renovacoes")
        .post(autenticar, c.renovar)                                // POST .../renovacoes            200 | 401 | 403 | 404 | 409
        .all(metodoNaoPermitido(["POST"]))

    return rotas
}

/* /reservas -> /reservas/{id}. O membro sÃ³ vÃª e cancela as prÃ³prias reservas. */
export function criarRotasReservas(c: EmprestimosController, autenticar: RequestHandler): Router {
    const rotas = Router()

    rotas.route("/")
        .get(autenticar, c.listarReservas)                          // GET    /api/reservas          200 | 401
        .post(autenticar, c.reservar)                               // POST   /api/reservas          201 | 400 | 401 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id")
        .get(autenticar, c.obterReserva)                            // GET    /api/reservas/RES-001  200 | 401 | 403 | 404
        .delete(autenticar, c.cancelarReserva)                      // DELETE /api/reservas/RES-001  204 | 401 | 403 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "DELETE"]))

    return rotas
}
