import {Livro} from "./models/livro";

// exemplo temporário pare teste da classe Livro 
const livroExemplo = new Livro (
    "livro-001",
    "Noites Brancas",
    "Fiódor Dostoiévski",
    "978-85-359-0277-5",
    1848,
    "Literarura Russa",
    "Uma história sobre encontros, solidão e expectativas durante quatro noites."
); 

console.log("Modelo Livro criado com sucesso!");
console.log(livroExemplo);