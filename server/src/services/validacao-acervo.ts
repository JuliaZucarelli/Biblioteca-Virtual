import { ErroValidacao } from "../domain/erros"

/* Validação do corpo (JSON) das requisições de livros e exemplares.
Devolve dados já limpos (sem espaços nas pontas, ISBN só com dígitos) ou lança ErroValidacao,
que a API converte em 400 Bad Request. */

export interface DadosLivro {
    titulo: string
    autor: string
    isbn: string
    ano: number
    genero: string
    sinopse: string
    capa: string
}

const CAMPOS_LIVRO = ["titulo", "autor", "isbn", "ano", "genero", "sinopse", "capa"]
const LIMITES: Record<string, number> = { titulo: 200, autor: 200, genero: 100, sinopse: 5000, capa: 300, codigo: 50 }

type Corpo = Record<string, unknown>

// ISBN pode ser digitado com hífens e espaços; guardamos só os dígitos (e o X final do ISBN-10)
export function normalizarIsbn(valor: string): string {
    return valor.replace(/[^0-9Xx]/g, "").toUpperCase()
}

function lerObjeto(corpo: unknown): Corpo {
    if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) {
        throw new ErroValidacao("O corpo da requisição deve ser um objeto JSON.")
    }
    return corpo as Corpo
}

function rejeitarCamposDesconhecidos(corpo: Corpo, permitidos: string[]): void {
    const desconhecidos = Object.keys(corpo).filter(campo => !permitidos.includes(campo))
    if (desconhecidos.length > 0) {
        throw new ErroValidacao(`Campos não permitidos: ${desconhecidos.join(", ")}.`)
    }
}

// devolve undefined se o campo não foi enviado
function lerTexto(corpo: Corpo, campo: string, naoVazio: boolean): string | undefined {
    const valor = corpo[campo]
    if (valor === undefined) return undefined
    if (typeof valor !== "string") {
        throw new ErroValidacao(`O campo '${campo}' deve ser um texto.`)
    }
    const texto = valor.trim()
    if (naoVazio && texto === "") {
        throw new ErroValidacao(`O campo '${campo}' não pode ficar vazio.`)
    }
    const limite = LIMITES[campo]
    if (limite !== undefined && texto.length > limite) {
        throw new ErroValidacao(`O campo '${campo}' aceita no máximo ${limite} caracteres.`)
    }
    return texto
}

function lerIsbn(corpo: Corpo): string | undefined {
    const texto = lerTexto(corpo, "isbn", true)
    if (texto === undefined) return undefined
    const isbn = normalizarIsbn(texto)
    if (!/^(\d{9}[\dX]|\d{13})$/.test(isbn)) {
        throw new ErroValidacao("O campo 'isbn' deve ter 10 ou 13 dígitos (hífens são opcionais).")
    }
    return isbn
}

function lerAno(corpo: Corpo): number | undefined {
    const valor = corpo.ano
    if (valor === undefined) return undefined
    if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0 || valor > 9999) {
        throw new ErroValidacao("O campo 'ano' deve ser um número inteiro positivo.")
    }
    return valor
}

function exigir<T>(valor: T | undefined, campo: string): T {
    if (valor === undefined) {
        throw new ErroValidacao(`O campo '${campo}' é obrigatório.`)
    }
    return valor
}

// POST e PUT: o livro inteiro. titulo, autor, isbn, ano e genero são obrigatórios; sinopse e capa são opcionais.
export function lerLivroCompleto(corpo: unknown): DadosLivro {
    const c = lerObjeto(corpo)
    rejeitarCamposDesconhecidos(c, CAMPOS_LIVRO)
    return {
        titulo: exigir(lerTexto(c, "titulo", true), "titulo"),
        autor: exigir(lerTexto(c, "autor", true), "autor"),
        isbn: exigir(lerIsbn(c), "isbn"),
        ano: exigir(lerAno(c), "ano"),
        genero: exigir(lerTexto(c, "genero", true), "genero"),
        sinopse: lerTexto(c, "sinopse", false) ?? "",
        capa: lerTexto(c, "capa", false) ?? "",
    }
}

// PATCH: só os campos enviados (pelo menos um)
export function lerLivroParcial(corpo: unknown): Partial<DadosLivro> {
    const c = lerObjeto(corpo)
    rejeitarCamposDesconhecidos(c, CAMPOS_LIVRO)
    if (Object.keys(c).length === 0) {
        throw new ErroValidacao("Informe ao menos um campo para atualizar.")
    }

    const dados: Partial<DadosLivro> = {}
    const titulo = lerTexto(c, "titulo", true)
    const autor = lerTexto(c, "autor", true)
    const isbn = lerIsbn(c)
    const ano = lerAno(c)
    const genero = lerTexto(c, "genero", true)
    const sinopse = lerTexto(c, "sinopse", false)
    const capa = lerTexto(c, "capa", false)
    if (titulo !== undefined) dados.titulo = titulo
    if (autor !== undefined) dados.autor = autor
    if (isbn !== undefined) dados.isbn = isbn
    if (ano !== undefined) dados.ano = ano
    if (genero !== undefined) dados.genero = genero
    if (sinopse !== undefined) dados.sinopse = sinopse
    if (capa !== undefined) dados.capa = capa
    return dados
}

// POST de exemplar: o corpo é opcional; se vier, só aceita o código de tombo
export function lerExemplar(corpo: unknown): { codigo?: string } {
    const c = lerObjeto(corpo ?? {})
    rejeitarCamposDesconhecidos(c, ["codigo"])
    const codigo = lerTexto(c, "codigo", true)
    return codigo === undefined ? {} : { codigo }
}
