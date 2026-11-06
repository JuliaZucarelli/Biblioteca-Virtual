// Configurações da API. Podem ser trocadas por variáveis de ambiente (PORT, DB_PATH).
export const PORT = Number(process.env.PORT ?? 3000)
export const DB_PATH = process.env.DB_PATH ?? "database/biblioteca.db"
