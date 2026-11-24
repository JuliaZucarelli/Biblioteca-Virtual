// Configurações da API. Podem ser trocadas por variáveis de ambiente (PORT, DB_PATH).
export const PORT = Number(process.env.PORT ?? 3000)
export const DB_PATH = process.env.DB_PATH ?? "database/biblioteca.db"

export function lerSegredoJwt() : string {
    // lê a variável carregada do .env pelo comando de desenvolvimento 
    const segredo = process.env.JWT_SECRET

    // identifica uma variável ausente ou vazia e interrompe a operação com uma mensagem clara
    if(!segredo) {
        throw new Error("Configure a variável JWT_SECRET para iniciar a autenticação.")
    }

    return segredo
}
