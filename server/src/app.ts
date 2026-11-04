import cors from "cors"
import express, { type Express } from "express"
import { LivrosController } from "./controllers/livros.controller"
import { tratarErros } from "./middlewares/tratar-erros"
import type { RepositorioAcervo } from "./repositories/repositorio"
import { criarRotasLivros } from "./routes/livros.routes"
import { ServicoAcervo } from "./services/servico-acervo"

// array de strings de rotas disponíveis na aplicação
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

// monta a aplicação express sem abrir porta (quem abre é o server.ts)
// recebe o repositório de fora: a API usa SQLite, os testes podem usar memória 
export function criarApp (repositorio : RepositorioAcervo) : Express {
    const app = express() // instancia principal do Express

    app.disable("x-powered-by")
    /* preflightContinue: o cors só acrescenta seus cabeçalhos e deixa o OPTIONS seguir até a rota
    que responde com o cabeçalho Allow */
    app.use(cors({preflightContinue : true}))
    /* habilita o interpretador de JSON nativo do express para ler o corpo req(body) de requisições
    POST, PUT e PATCH */
    app.use(express.json())

    // GET /api: apresentação da API com o que ela oferece 
    app.get("/api", (_req, res) => {
        res.json({
            nome: "Biblioteca Virtual API",
            livros: "/api/livros",
            endpoints: ENDPOINTS,
        })
    })

    // verificar se a api está online
    app.get("/api/saude", (_req, res) => {
        res.json({status : "ok"})
    })

    // cria uma instância do serviço do acervo injetando o repositório recebido    
    const servicoAcervo = new ServicoAcervo(repositorio)
    app.use("/api/livros", criarRotasLivros(new LivrosController(servicoAcervo)))
    
    // captura qualquer requisição feita a rotas não mapeadas e devolve status HTTP 404
    app.use((_req, res) => {
        res.status(404).json({ erro: "Rota não encontrada. "})
    })

    app.use(tratarErros)
    return app
}