import cors from "cors"
import express, { type Express } from "express"
import { LivrosController } from "./controllers/livros.controller"
import { tratarErros } from "./middlewares/tratar-erros"
import type { RepositorioAcervo } from "./repositories/repositorio"
import { criarRotasLivros } from "./routes/livros.routes"
import { ServicoAcervo } from "./services/servico-acervo"

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

/* Monta a aplicação Express SEM abrir porta (quem abre é o server.ts).
Recebe o repositório de fora: a API usa SQLite, os testes podem usar memória. */
export function criarApp(repositorio: RepositorioAcervo): Express {
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
            endpoints: ENDPOINTS,
        })
    })

    app.get("/api/saude", (_req, res) => {
        res.json({ status: "ok" })
    })

    const servicoAcervo = new ServicoAcervo(repositorio)
    app.use("/api/livros", criarRotasLivros(new LivrosController(servicoAcervo)))

    app.use((_req, res) => {
        res.status(404).json({ erro: "Rota não encontrada." })
    })
    app.use(tratarErros)

    return app
}
