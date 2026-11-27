import { porId } from "./dom";
import { listarMeusEmprestimos, listarLivros, renovarEmprestimo } from "./api";
import type { EmprestimoResumo, LivroResumo } from "./api";

function criarCardEmprestimo(emprestimo : EmprestimoResumo, livro : LivroResumo | undefined) : HTMLElement {
    // representa o card
    const card = document.createElement("article") 
    card.className = "emprestimos-card"

    // cria a imagem da capa do livro 
    const capa = document.createElement("div")
    capa.className = "emprestimos-card__cover emprestimos-cover--noite"

    if(livro?.capa) {
        const imagem = document.createElement("img")

        imagem.src = import.meta.env.BASE_URL + livro.capa.replace(/^\/+/, "")

        imagem.alt = `Capa de ${emprestimo.livroTitulo}`

        capa.append(imagem)
    }

    // organiza o conteúdo e reaproveita o CSS existente
    const corpo = document.createElement("div")
    corpo.className = "emprestimos-card__body"

    // mostra o nome do livro usando textContent
    const titulo = document.createElement("h3")
    titulo.className = "emprestimos-card__title"
    titulo.textContent = emprestimo.livroTitulo

    // mostra o autor
    const autor = document.createElement("p")
    autor.className = "emprestimos-card__author"
    autor.textContent = livro?.autor ?? "Autor não informado"

    const formatoData : Intl.DateTimeFormatOptions = {
        day : "2-digit",
        month : "short",
        year : "numeric"
    }

    // organiza informações de retirada
    const retirada = document.createElement("p")
    retirada.className = "emprestimos-card__date"
    retirada.textContent =
        `emprestado: ${new Date(emprestimo.dataEmprestimo)
        .toLocaleDateString("pt-BR", formatoData)}`

    const vencimento = document.createElement("p")
    vencimento.className = "emprestimos-card__devolution"
    vencimento.textContent = 
            `devolução: ${new Date(emprestimo.dataVencimento)
                .toLocaleDateString("pt-BR", formatoData)}`

    // informa se o empréstimo está ativo ou encerrado
    const situacao = document.createElement("p")
    situacao.textContent = emprestimo.ativo
        ? "Empréstimo ativo"
        : "Empréstimo encerrado"

    const restante = document.createElement("p")
    restante.className = "emprestimos-card__remainder"

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const prazo = new Date(emprestimo.dataVencimento)
    prazo.setHours(0, 0, 0, 0)

    const diaEmMilissegundos = 24 * 60 * 60 * 1000

    const diasRestantes = Math.round(
        (
            Date.UTC(prazo.getFullYear(), prazo.getMonth(), prazo.getDate()) -
            Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
        ) / diaEmMilissegundos
    )

    if(!emprestimo.ativo) {
        restante.textContent = "Encerrando..."
    } else if(diasRestantes < 0) {
        restante.textContent = `${Math.abs(diasRestantes)}d em atraso`
    } else if (diasRestantes === 0) {
        restante.textContent = "Vence hoje"
    } else {
        restante.textContent = `${diasRestantes}d restantes`
    }

    // organiza os elementos 
    corpo.append(titulo, autor, retirada, vencimento, restante)

    // mostra a ação somente nos empréstimos ativos
    if(emprestimo.ativo) {
        const renovar = document.createElement("button")
        renovar.type = "button"
        renovar.className = "emprestimos-card__renovation"
        renovar.textContent = "↻ renovar por mais 14 dias"

        renovar.addEventListener("click", async () => {
            if(renovar.disabled) return // disabled: impede solicitações repetidas enquanto aguarda a API

            renovar.disabled = true
            renovar.textContent = "Renovando..."

            const status = porId("emprestimosStatus")

            try {
                // solicita a renovação - o backend verifica suas regras
                const atualizado = await renovarEmprestimo(emprestimo.id)

                const novoCard = criarCardEmprestimo(atualizado, livro)
                card.replaceWith(novoCard) // substitui o card pelos dados retornados, atualizando prazo e dias restantes

                if(status) {
                    status.textContent = `Empréstimo de ${atualizado.livroTitulo} renovado com sucesso.`
                }
            } catch(erro : unknown) { // mostra o motivo de uma renovação recusada
                if(status) {
                    status.textContent = 
                        erro instanceof Error   
                            ? erro.message
                            : "Não foi possível renovar o empréstimo."
                }
            } finally { // restaura o botão caso ele continue na página
                renovar.disabled = false
                renovar.textContent = "↻ renovar por mais 14 dias"
            }
        })

        corpo.append(renovar)
    }

    card.append(capa, corpo)

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
        const livros = await listarLivros()

        // limpa a lista antes de preenchê-la
        lista.replaceChildren()

        // percorre os empréstimos, cria um card para cada um e o adiciona a página
        for(const emprestimo of emprestimos) {
            const livro = livros.find(item => item.id === emprestimo.livroId)

            const card = criarCardEmprestimo(emprestimo, livro)
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