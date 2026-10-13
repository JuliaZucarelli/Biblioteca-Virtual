import {Livro} from "../models/livro";
import {Exemplar, Acervo} from '../models/exemplares';

// Dados brutos (objetos simples). As instâncias de Livro e Exemplar
// são criadas dentro de criarAcervoInicial(), a cada chamada.
interface DadosLivro {
    readonly id : string
    readonly titulo : string
    readonly autor : string
    readonly isbn : string
    readonly ano : number
    readonly genero : string
    readonly sinopse : string
}

// ISBNs fictícios, usados apenas para desenvolvimento.
const dadosLivros: readonly DadosLivro[] = [
    { id: "L01", titulo: "Dom Casmurro", autor: "Machado de Assis", isbn: "9780000000011", ano: 1899, genero: "Romance",
      sinopse: "Bentinho revisita a juventude e a suspeita de traição de Capitu, em um dos maiores clássicos da literatura brasileira." },
    { id: "L02", titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis", isbn: "9780000000028", ano: 1881, genero: "Romance",
      sinopse: "Um defunto autor narra sua vida com ironia e humor ácido, criticando a sociedade do Segundo Reinado." },
    { id: "L03", titulo: "O Cortiço", autor: "Aluísio Azevedo", isbn: "9780000000035", ano: 1890, genero: "Romance",
      sinopse: "A vida em um cortiço do Rio de Janeiro revela a exploração, a ambição e as desigualdades do século XIX." },
    { id: "L04", titulo: "Grande Sertão: Veredas", autor: "João Guimarães Rosa", isbn: "9780000000042", ano: 1956, genero: "Romance",
      sinopse: "Riobaldo conta sua trajetória de jagunço pelo sertão, entre o amor, a violência e o pacto com o diabo." },
    { id: "L05", titulo: "Capitães da Areia", autor: "Jorge Amado", isbn: "9780000000059", ano: 1937, genero: "Romance",
      sinopse: "Um grupo de meninos abandonados vive de pequenos crimes nas ruas de Salvador." },
    { id: "L06", titulo: "O Hobbit", autor: "J. R. R. Tolkien", isbn: "9780000000066", ano: 1937, genero: "Fantasia",
      sinopse: "Bilbo Bolseiro parte em uma aventura com anões para recuperar um tesouro guardado por um dragão." },
    { id: "L07", titulo: "Fundação", autor: "Isaac Asimov", isbn: "9780000000073", ano: 1951, genero: "Ficção científica",
      sinopse: "Um matemático prevê a queda do Império Galáctico e cria um plano para reduzir a era de trevas que virá." },
    { id: "L08", titulo: "Orgulho e Preconceito", autor: "Jane Austen", isbn: "9780000000080", ano: 1813, genero: "Romance",
      sinopse: "Elizabeth Bennet e o Sr. Darcy enfrentam orgulho, classe social e mal-entendidos." },
]

// livroId -> [exemplares disponíveis, exemplares emprestados]
// L07 tem tudo emprestado e L08 não tem exemplares (casos úteis para testar o filtro de disponibilidade).
const estoque: Readonly<Record<string, readonly [number, number]>> = {
    L01: [2, 1],
    L02: [1, 0],
    L03: [0, 2],
    L04: [3, 0],
    L05: [1, 1],
    L06: [2, 2],
    L07: [0, 1],
}

export function criarAcervoInicial(): Acervo {
    const acervo = new Acervo()

    for (const dados of dadosLivros) {
        acervo.adicionarLivro(new Livro(
            dados.id, dados.titulo, dados.autor, dados.isbn,
            dados.ano, dados.genero, dados.sinopse
        ))
    }

    let sequencia = 1
    for (const [livroId, [disponiveis, emprestados]] of Object.entries(estoque)) {
        for (let i = 0; i < disponiveis + emprestados; i++) {
            const numero = String(sequencia).padStart(3, "0")
            const exemplar = new Exemplar(`E${numero}`, livroId, `TOMBO-${numero}`)
            if (i >= disponiveis) {
                exemplar.emprestar()
            }
            acervo.adicionarExemplares(exemplar)
            sequencia++
        }
    }
    return acervo
}