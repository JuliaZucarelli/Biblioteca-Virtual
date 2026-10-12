import {Livro} from "../models/livro";
import {Exemplar, Acervo} from '../models/exemplares';


// ISBNs fictícios, usados apenas para desenvolvimento.
const livros: Livro[] = [
    new Livro("L01", "Dom Casmurro", "Machado de Assis", "9780000000011", 1899, "Romance",
        "Bentinho revisita a juventude e a suspeita de traição de Capitu, em um dos maiores clássicos da literatura brasileira."),
    new Livro("L02", "Memórias Póstumas de Brás Cubas", "Machado de Assis", "9780000000028", 1881, "Romance",
        "Um defunto autor narra sua vida com ironia e humor ácido, criticando a sociedade do Segundo Reinado."),
    new Livro("L03", "O Cortiço", "Aluísio Azevedo", "9780000000035", 1890, "Romance",
        "A vida em um cortiço do Rio de Janeiro revela a exploração, a ambição e as desigualdades do século XIX."),
    new Livro("L04", "Grande Sertão: Veredas", "João Guimarães Rosa", "9780000000042", 1956, "Romance",
        "Riobaldo conta sua trajetória de jagunço pelo sertão, entre o amor, a violência e o pacto com o diabo."),
    new Livro("L05", "Capitães da Areia", "Jorge Amado", "9780000000059", 1937, "Romance",
        "Um grupo de meninos abandonados vive de pequenos crimes nas ruas de Salvador."),
    new Livro("L06", "O Hobbit", "J. R. R. Tolkien", "9780000000066", 1937, "Fantasia",
        "Bilbo Bolseiro parte em uma aventura com anões para recuperar um tesouro guardado por um dragão."),
    new Livro("L07", "Fundação", "Isaac Asimov", "9780000000073", 1951, "Ficção científica",
        "Um matemático prevê a queda do Império Galáctico e cria um plano para reduzir a era de trevas que virá."),
    new Livro("L08", "Orgulho e Preconceito", "Jane Austen", "9780000000080", 1813, "Romance",
        "Elizabeth Bennet e o Sr. Darcy enfrentam orgulho, classe social e mal-entendidos."),
]

// livroId -> [exemplares disponíveis, exemplares emprestados]
// L07 tem tudo emprestado e L08 não tem exemplares (casos úteis para testar o filtro de disponibilidade).
const estoque: Record<string, [number, number]> = {
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
    livros.forEach(livro => acervo.adicionarLivro(livro))

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