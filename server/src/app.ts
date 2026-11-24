import cors from "cors"
import express, { type Express } from "express"
import { LivrosController } from "./controllers/livros.controller"
import { tratarErros } from "./middlewares/tratar-erros"
import type { RepositorioAcervo } from "./repositories/repositorio"
import { criarRotasLivros } from "./routes/livros.routes"
import { ServicoAcervo } from "./services/servico-acervo"
import { UsuariosController } from "./controllers/usuarios.controller"
import type { RepositorioUsuarios } from "./repositories/repositorio-usuarios"
import { criarRotasUsuarios } from "./routes/usuarios.routes"
import { ServicoUsuarios } from "./services/servico-usuarios"
import { SessoesController } from "./controllers/sessoes-controller"
import { criarRotasSessoes } from "./routes/sessoes.routes"
import { ServicoSessoes } from "./services/servico-sessoes"
import type { ServicoTokens } from "./services/servico-tokens"

import { EmprestimosController } from "./controllers/emprestimos.controller"
import { autenticar } from "./middlewares/autenticar"
import type { RepositorioEmprestimos } from "./repositories/repositorio-emprestimos"
import { criarRotasEmprestimos, criarRotasReservas } from "./routes/emprestimos.routes"
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
Recebe o repositório de fora: a API usa SQLite, os testes podem usar memória. */
export function criarApp(
    repositorio: RepositorioAcervo,
    repositorioUsuario?: RepositorioUsuarios,
    tokens?: ServicoTokens,
    repositorioEmprestimos?: RepositorioEmprestimos
): Express {
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
            ...(repositorioEmprestimos && tokens ? { emprestimos: "/api/emprestimos", reservas: "/api/reservas" } : {}),
            endpoints: repositorioEmprestimos && tokens ? [...ENDPOINTS, ...ENDPOINTS_EMPRESTIMOS] : ENDPOINTS,
        })
    })

    app.get("/api/saude", (_req, res) => {
        res.json({ status: "ok" })
    })

    const servicoAcervo = new ServicoAcervo(repositorio)
    app.use("/api/livros", criarRotasLivros(new LivrosController(servicoAcervo)))

    if(repositorioUsuario) {
        const servicoUsuarios = new ServicoUsuarios(repositorioUsuario)

        const controllerUsuarios = new UsuariosController(servicoUsuarios)

        app.use("/api/usuarios", criarRotasUsuarios(controllerUsuarios))
    }

    /* 
    - repositório + serviço de tokens 
    - serviço de sessões 
    - controller 
    - POST /api/sessoes
    */
   // verifica se as duas dependência foram fornecidas antes de registrar o login 
    if(repositorioUsuario && tokens) {
        const servicoSessoes = new ServicoSessoes(repositorioUsuario, tokens)
        const controllerSessoes = new SessoesController(servicoSessoes)

        app.use(
            "/api/sessoes", criarRotasSessoes(controllerSessoes)
        )
    }

    if (repositorioEmprestimos && tokens) {
        const autenticarUsuario = autenticar(tokens)
        const controller = new EmprestimosController(new ServicoCirculacao(repositorioEmprestimos))
        app.use("/api/emprestimos", criarRotasEmprestimos(controller, autenticarUsuario))
        app.use("/api/reservas", criarRotasReservas(controller, autenticarUsuario))
    }

    app.use((_req, res) => {
        res.status(404).json({ erro: "Rota não encontrada." })
    })
    app.use(tratarErros)

    return app
}
