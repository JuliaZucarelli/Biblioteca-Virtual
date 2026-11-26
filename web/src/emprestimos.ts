import { porId } from "./dom";
import { listarMeusEmprestimos } from "./api";
import type { EmprestimoResumo } from "./api";

function criarCardEmprestimo(emprestimo : EmprestimoResumo) : HTMLElement {
    // representa o card
    const card = document.createElement("article") 
    card.className = "emprestimos-card"

    // organiza o conteúdo e reaproveita o CSS existente
    const corpo = document.createElement("div")
    corpo.className = "emprestimos-card__body"

    // mostra o nome do livro usando textContent
    const titulo = document.createElement("h3")
    titulo.className = "emprestimos-card__title"
    titulo.textContent = emprestimo.livroTitulo

    // converte a data recebida em uma apresentação brasileira
    const vencimento = document.createElement("p")
    vencimento.className = "emprestimos-card__devolution"
    vencimento.textContent = 
        `Prazo de devolução: ${new Date(emprestimo.dataVencimento).toLocaleDateString("pt-BR")}`

    // informa se o empréstimo está ativo ou encerrado
    const situacao = document.createElement("p")
    situacao.textContent = emprestimo.ativo
        ? "Empréstimo ativo"
        : "Empréstimo encerrado"

    // organiza os elementos 
    corpo.append(titulo, vencimento, situacao)
    card.append(corpo)

    return card
}

async function iniciarEmprestimos() : Promise<void> {
    const lista = porId("emprestimosLista")
    const status = porId("emprestimosStatus")

    // encerra a função nas páginas que não possuem a área de empréstimos
    if(!lista || !status) return 

    status.textContent = "Carregando meus empréstimos..."

    // consultam empréstimos da conta conectada
    try {
        const emprestimos = await listarMeusEmprestimos()

        // limpa a lista antes de preenchê-la
        lista.replaceChildren()

        // percorre os empréstimos, cria um card para cada um e o adiciona a página
        for(const emprestimo of emprestimos) {
            const card = criarCardEmprestimo(emprestimo)
            lista.append(card)
        }

        // mostra a mensagem de lista vazia quando a API retorna []
        if(emprestimos.length === 0) {
            status.textContent = "Você ainda não possui empréstimos."
            return
        }

        status.textContent = 
            `${emprestimos.length} empréstimo(s) encontrado(s).`
    } catch(erro : unknown) { // apresenta falhas e orientações para entrar na conta
        status.textContent = 
            erro instanceof Error
                ? erro.message
                : "Não foi possível carregar seus empréstimos."
    }
}

void iniciarEmprestimos()