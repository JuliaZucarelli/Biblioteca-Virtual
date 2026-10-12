export class Livro {
    constructor (
        public readonly id : string, //id imutável 
        public titulo : string,
        public autor : string, 
        public isbn : string, 
        public ano : number, 
        public genero : string, 
        public sinopse: string
    ) {
        if (!id.trim()) {
            throw new Error("O ID do livro é obrigatório.")
        }
        if (!titulo.trim()) {
            throw new Error("O título do livro é obrigatório.")
        }
        if (!autor.trim()) {
            throw new Error("O autor do livro é obrigatório.")
        }
        if (!isbn.trim()) {
            throw new Error("O ISBN do livro é obrigatório.")
        }
        if (!genero.trim()) {
            throw new Error("O gênero do livro é obrigatório.")
        }
        if (!Number.isInteger(ano) || ano <= 0) {
            throw new Error("O ano do livro deve ser um número inteiro positivo.")
        }
    }
}