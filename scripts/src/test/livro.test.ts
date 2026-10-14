import { describe, it, expect, beforeEach } from "vitest"
import {Livro} from "../models/livro";
import {Exemplar, Acervo, StatusExemplar} from '../models/exemplares';

// tipo personalizado que extrai automaticamente os tipos dos parâmetros do constructor da classe Livro
type DadosLivro = ConstructorParameters <typeof Livro>

const dadosValidos = () : DadosLivro => [
    "L1", "Dom Casmurro", "Machado de Assis", "9780000000011", 1899, "Romance", "Bentinho e Capitu."
]

// cria um livro válido trocando apenas o campo da posição indice
function criarComCampo(indice : number, valor : string | number) : Livro {
    const dados : unknown[] = dadosValidos()
    dados[indice] = valor
    return new Livro(...(dados as DadosLivro))
}

describe("Livro", () => {
    describe("criação válida", () => {
        it("guarda todos os campos informados", () => {
            const livro = new Livro(...dadosValidos())
            expect(livro.id).toBe("L1")
            expect(livro.titulo).toBe("Dom Casmurro")
            expect(livro.autor).toBe("Machado de Assis")
            expect(livro.isbn).toBe("9780000000011")
            expect(livro.ano).toBe(1899)
            expect(livro.genero).toBe("Romance")
            expect(livro.sinopse).toBe("Bentinho e Capitu.")
        })

        it("aceita sinopse vazia (campo opcional)", () => {
            expect(criarComCampo(6, "").sinopse).toBe("")
        })

        it("aceita ano 1 (menor inteiro positivo)", () => {
            expect(criarComCampo(4, 1).ano).toBe(1)
        })

        it("permite alterar campos mutáveis", () => {
            const livro = new Livro(...dadosValidos())
            livro.titulo = "Novo título"
            livro.autor = "Novo autor"
            livro.genero = "Conto"
            expect(livro.titulo).toBe("Novo título")
            expect(livro.autor).toBe("Novo autor")
            expect(livro.genero).toBe("Conto")
        })
    })

    describe("campos obrigatórios", () => {
        it.each([
            ["id", 0, "O ID do livro é obrigatório."],
            ["título", 1, "O título do livro é obrigatório."], 
            ["autor", 2, "O autor do livro é obrigatório."],
            ["ISBN", 3, "O ISBN do livro é obrigatório."],
            ["gênero", 5, "O gênero do livro é obrigatório."],
        ]) ("rejeita %s vazio ou só com espaços", (_nome, indice, mensagem) => {
            expect(() => criarComCampo(indice, "")).toThrow(mensagem)
            expect(() => criarComCampo(indice, "  ")).toThrow(mensagem)
        })
    })

    describe("ano", () => {
        it.each([0, -1, -1899, 1.5, NaN, Infinity]) ("rejeita ano %s", (ano) => {
            expect(() => criarComCampo(4, ano)).toThrow("O ano do livro deve ser um número inteiro positivo.")
        })
    })
})

