import { rmSync } from "node:fs"
import { abrirBanco } from "../config/banco"
import { DB_PATH } from "../config/ambiente"
import { semearSeVazio } from "./seed"

// npm run db:reset -> apaga o arquivo do banco e recria com os dados iniciais
rmSync(DB_PATH, { force: true })
const banco = abrirBanco(DB_PATH)
semearSeVazio(banco)
banco.close()
console.log(`Banco recriado em ${DB_PATH} com os dados iniciais.`)
