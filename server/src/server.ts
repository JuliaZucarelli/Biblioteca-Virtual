import { criarApp } from "./app"
import { DB_PATH, PORT, lerSegredoJwt } from "./config/ambiente"
import { abrirBanco } from "./config/banco"
import { semearSeVazio } from "./database/seed"
import { RepositorioSQLite } from "./repositories/repositorio-sqlite"
import { RepositorioUsuariosSQLite } from "./repositories/repositorio-usuarios-sqlite"
import { ServicoTokens } from "./services/servico-tokens"

/* fluxo: 
POST /api/usuarios -> controller -> serviço de cadastro -> repositório de usuários -> SQLite
*/

const tokens = new ServicoTokens(lerSegredoJwt())

const banco = abrirBanco(DB_PATH)
if (semearSeVazio(banco)) {
    console.log("Banco criado e populado com os dados iniciais.")
}

const app = criarApp(
    new RepositorioSQLite(banco), // acessa livros e exemplares
    new RepositorioUsuariosSQLite(banco), // acessa usuários
    tokens
)

const servidor = app.listen(PORT, (erro?: Error) => {
    if (erro) return // no Express 5 o callback também recebe erros; quem trata é o servidor.on("error") abaixo
    console.log(`API rodando em http://localhost:${PORT}  (banco: ${DB_PATH})`)
})

servidor.on("error", (erro: NodeJS.ErrnoException) => {
    if (erro.code === "EADDRINUSE") {
        console.error(`A porta ${PORT} já está em uso. Feche o outro servidor ou rode com PORT=3001.`)
    } else {
        console.error("Erro ao iniciar o servidor:", erro)
    }
    process.exit(1)
})
