import {Livro} from "../domain/livro";
import {Exemplar, Acervo} from "../domain/exemplares";

/* Dados brutos (objetos simples). As instâncias de Livro e Exemplar
são criadas dentro de criarAcervoInicial(), a cada chamada.
Esta é a ÚNICA fonte dos dados iniciais: os testes (em memória) e o banco
SQLite (database/seed.ts) usam as mesmas informações. */
interface DadosLivro {
    readonly id : string
    readonly titulo : string
    readonly autor : string
    readonly isbn : string
    readonly ano : number
    readonly genero : string
    readonly sinopse : string
    readonly capa : string
}

/* ISBNs fictícios, mas com formato ISBN-13 e dígito verificador válidos.
Se quiser, troque pelos ISBNs reais das edições que você usa. */
const dadosLivros: readonly DadosLivro[] = [
    { id: "L01",
      titulo: "Noites Brancas",
      autor: "Fiódor Dostoiévski",
      isbn: "9780000000019",
      ano: 1848,
      genero: "Literatura russa",
      sinopse: "Uma história sobre encontros, solidão e expectativas, acompanha um jovem sonhador durante quatro noites pelas ruas de São Petersburgo.",
      capa: "/img/noites-brancas.jpg" },

    { id: "L02",
      titulo: "A Metamorfose",
      autor: "Franz Kafka",
      isbn: "9780000000026",
      ano: 1915,
      genero: "Novela",
      sinopse: "A Metamorfose, de Franz Kafka, narra a história de Gregor Samsa, um caixeiro-viajante que acorda certo dia transformado em um inseto gigante. Incapaz de trabalhar, ele passa a ser gradualmente rejeitado e isolado pela própria família. A obra é uma marcante metáfora sobre a alienação, a solidão e como as relações humanas muitas vezes se baseiam apenas na utilidade financeira.",
      capa: "/img/a-metamorfose.jpg" },

    { id: "L03",
      titulo: "A Queda",
      autor: "Albert Camus",
      isbn: "9780000000033",
      ano: 1956,
      genero: "Filosofia",
      sinopse: "A Queda, de Albert Camus, apresenta o perturbador monólogo de Jean-Baptiste Clamence, um ex-advogado parisiense que relata sua decadência moral em um bar de Amsterdã. Após ignorar o suicídio de uma mulher no rio Sena, ele é assombrado pela culpa e abandona sua vida prestigiada. A obra é uma profunda reflexão sobre a hipocrisia, o julgamento alheio e a cumplicidade humana diante da moralidade.",
      capa: "/img/a-queda.jpg" },

    { id: "L04",
      titulo: "Água Viva",
      autor: "Clarice Lispector",
      isbn: "9780000000040",
      ano: 1973,
      genero: "Literatura brasileira",
      sinopse: "Água Viva, de Clarice Lispector, é um fluxo de consciência em forma de carta escrito por uma pintora anônima a seu ex-amante. Sem uma narrativa tradicional, a obra explora a busca obsessiva pelo “instante-já”, a criação artística e os mistérios da existência. É uma intensa reflexão poética sobre a identidade, o tempo e os limites do próprio pensamento.",
      capa: "/img/agua-viva.jpg" },

    { id: "L05",
      titulo: "O Apanhador no Campo de Centeio",
      autor: "J. D. Salinger",
      isbn: "9780000000057",
      ano: 1951,
      genero: "Romance",
      sinopse: "Holden Caulfield, expulso do colégio, vaga por Nova York durante alguns dias e narra, com ironia e angústia, a dificuldade de lidar com a hipocrisia do mundo adulto.",
      capa: "/img/o-apanhador-de-centeio.jpg" },

    { id: "L06",
      titulo: "O Design como Storytelling",
      autor: "Ellen Lupton",
      isbn: "9780000000064",
      ano: 2017,
      genero: "Design",
      sinopse: "Ellen Lupton mostra como personagens, tramas e arcos narrativos podem orientar projetos de design, de produtos e embalagens a experiências e serviços.",
      capa: "/img/design-como-storyteling.jpg" },

    { id: "L07",
      titulo: "Frida: A Biografia",
      autor: "Hayden Herrera",
      isbn: "9780000000071",
      ano: 1983,
      genero: "Biografia",
      sinopse: "Biografia da pintora mexicana Frida Kahlo: a infância, o acidente que marcou sua vida, o casamento com Diego Rivera e a construção de uma obra inconfundível.",
      capa: "/img/frida.jpg" },

    { id: "L08",
      titulo: "O Código Da Vinci",
      autor: "Dan Brown",
      isbn: "9780000000088",
      ano: 2003,
      genero: "Suspense",
      sinopse: "O simbologista Robert Langdon é envolvido na investigação de um assassinato no Louvre e segue pistas escondidas em obras de arte atrás de um segredo guardado há séculos.",
      capa: "/img/o-codigo-da-vinci.jpg" },

    { id: "L09",
      titulo: "Grande Sertão: Veredas",
      autor: "João Guimarães Rosa",
      isbn: "9780000000095",
      ano: 1956,
      genero: "Literatura brasileira",
      sinopse: "Riobaldo conta sua trajetória de jagunço pelo sertão, entre o amor, a violência e o pacto com o diabo.",
      capa: "/img/grande-sertao-veredas.jpg" },
]

// livroId -> [exemplares disponíveis, exemplares emprestados]
// L03 tem tudo emprestado e L08 não tem exemplares (casos úteis para testar o filtro de disponibilidade).
const estoque: Readonly <Record <string, readonly [number, number]>> = {
    L01: [2, 1],
    L02: [1, 1],
    L03: [0, 1],
    L04: [2, 0],
    L05: [3, 1],
    L06: [1, 1],
    L07: [0, 2],
    L09: [3, 0],
}

export function criarAcervoInicial(): Acervo {
    const acervo = new Acervo()

    for (const dados of dadosLivros) {
        acervo.adicionarLivro(new Livro(dados.id, dados.titulo, dados.autor, dados.isbn, dados.ano, dados.genero, dados.sinopse, dados.capa))
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
