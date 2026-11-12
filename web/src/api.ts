// descreve um livro na resposta da API
export interface LivroResumo {
    id : string 
    isbn : string 
    titulo : string 
    autor : string 
    ano : number 
    genero : string 
    sinopse : string 
    capa  : string
    total : number // quantos exemplares existem
    disponiveis : number 
}

// função para busca de livro - entrega uma lista de livros
export async function listarLivros(): Promise<LivroResumo[]> {
    // faz uma requisição GET
    const resposta = await fetch("/api/livros")

    // verifica se status HTPP está entre 200 e 299
    if(!resposta.ok) {
        throw new Error(`Não foi possível carregar os livros (${resposta.status}).`)   
    }

    // lê e converte o JSON em dados js 
    const livros: LivroResumo[] = await resposta.json()
    return livros
}