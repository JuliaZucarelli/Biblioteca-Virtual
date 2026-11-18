import cors from "cors"
import express, { type Express } from "express"
import { EmprestimosController } from "./controllers/emprestimos.controller"
import { LivrosController } from "./controllers/livros.controller"
import { tratarErros } from "./middlewares/tratar-erros"
import type { RepositorioEmprestimos } from "./repositories/repositorio-emprestimos"
import type { RepositorioAcervo } from "./repositories/repositorio"
import { criarRotasEmprestimos, criarRotasReservas } from "./routes/emprestimos.routes"
import { criarRotasLivros } from "./routes/livros.routes"
import { ServicoAcervo } from "./services/servico-acervo"
import { ServicoCirculacao } from "./services/servico-circulacao"

const ENDPOINTS = [
    "GET /api/livros",
    "POST /api/livros",
    "GET /api/livros/:id",
    "PUT /api/livros/:id",
    "PATCH /api/livros/:id",
    "DELETE /api/livros/:id",
    "GET /api/livros/:id/exemplares",
    "POST /api/livros/:id/exemplares",
    "GET /api/livros/:id/exemplares/:exemplarId",
    "DELETE /api/livros/:id/exemplares/:exemplarId",
]

// só aparecem em GET /api quando a aplicação recebe o repositório de empréstimos
const ENDPOINTS_EMPRESTIMOS = [
    "GET /api/emprestimos",
    "POST /api/emprestimos",
    "GET /api/emprestimos/:id",
    "POST /api/emprestimos/:id/devolucao",
    "POST /api/emprestimos/:id/renovacoes",
    "GET /api/reservas",
    "POST /api/reservas",
    "GET /api/reservas/:id",
    "DELETE /api/reservas/:id",
]

/* Monta a aplicação Express SEM abrir porta (quem abre é o server.ts).
Recebe os repositórios de fora: a API usa SQLite, os testes podem usar memória.
O repositório de empréstimos é opcional: sem ele, as rotas /emprestimos e /reservas não existem. */
export function criarApp(repositorio: RepositorioAcervo, repositorioEmprestimos?: RepositorioEmprestimos): Express {
    const app = express()

    app.disable("x-powered-by")
    // preflightContinue: o cors só acrescenta seus cabeçalhos e deixa o OPTIONS seguir até a rota,
    // que responde com o cabeçalho Allow (métodos aceitos naquele recurso)
    app.use(cors({ preflightContinue: true }))
    app.use(express.json())

    // GET /api: apresentação da API, com o que ela oferece
    app.get("/api", (_req, res) => {
        res.json({
            nome: "Biblioteca Virtual API",
            livros: "/api/livros",
            ...(repositorioEmprestimos ? { emprestimos: "/api/emprestimos", reservas: "/api/reservas" } : {}),
            endpoints: repositorioEmprestimos ? [...ENDPOINTS, ...ENDPOINTS_EMPRESTIMOS] : ENDPOINTS,
        })
    })

    app.get("/api/saude", (_req, res) => {
        res.json({ status: "ok" })
    })

    const servicoAcervo = new ServicoAcervo(repositorio)
    app.use("/api/livros", criarRotasLivros(new LivrosController(servicoAcervo)))

    if (repositorioEmprestimos) {
        const controller = new EmprestimosController(new ServicoCirculacao(repositorioEmprestimos))
        app.use("/api/emprestimos", criarRotasEmprestimos(controller))
        app.use("/api/reservas", criarRotasReservas(controller))
    }

    app.use((_req, res) => {
        res.status(404).json({ erro: "Rota não encontrada." })
    })
    app.use(tratarErros)

    return app
}
