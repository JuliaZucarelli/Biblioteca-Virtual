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