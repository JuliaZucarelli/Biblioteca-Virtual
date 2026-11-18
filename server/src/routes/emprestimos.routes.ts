import { Router } from "express"
import type { EmprestimosController } from "../controllers/emprestimos.controller"
import { metodoNaoPermitido } from "../middlewares/metodo-nao-permitido"

/* /emprestimos -> /emprestimos/{id} -> /emprestimos/{id}/devolucao e /emprestimos/{id}/renovacoes
Todas as rotas exigem o usuário identificado (401 sem identificação). Cada recurso aceita só os métodos
listados; qualquer outro recebe 405 (com o cabeçalho Allow). */
export function criarRotasEmprestimos(c: EmprestimosController): Router {
    const rotas = Router()

    rotas.route("/")
        .get(c.listarEmprestimos)                       // GET  /api/emprestimos          200 | 401
        .post(c.emprestar)                              // POST /api/emprestimos          201 | 400 | 401 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id")
        .get(c.obterEmprestimo)                         // GET  /api/emprestimos/EMP-001  200 | 401 | 403 | 404
        .all(metodoNaoPermitido(["GET", "HEAD"]))

    rotas.route("/:id/devolucao")
        .post(c.devolver)                               // POST .../devolucao             200 | 401 | 403 | 404 | 409
        .all(metodoNaoPermitido(["POST"]))

    rotas.route("/:id/renovacoes")
        .post(c.renovar)                                // POST .../renovacoes            200 | 401 | 403 | 404 | 409
        .all(metodoNaoPermitido(["POST"]))

    return rotas
}

/* /reservas -> /reservas/{id}. O membro só vê e cancela as próprias reservas. */
export function criarRotasReservas(c: EmprestimosController): Router {
    const rotas = Router()

    rotas.route("/")
        .get(c.listarReservas)                          // GET    /api/reservas          200 | 401
        .post(c.reservar)                               // POST   /api/reservas          201 | 400 | 401 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "POST"]))

    rotas.route("/:id")
        .get(c.obterReserva)                            // GET    /api/reservas/RES-001  200 | 401 | 403 | 404
        .delete(c.cancelarReserva)                      // DELETE /api/reservas/RES-001  204 | 401 | 403 | 404 | 409
        .all(metodoNaoPermitido(["GET", "HEAD", "DELETE"]))

    return rotas
}
