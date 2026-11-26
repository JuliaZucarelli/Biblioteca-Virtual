import { porId } from "./dom";
import { listarMeusEmprestimos } from "./api";

async function iniciarEmprestimos() : Promise<void> {
    const lista = porId("emprestimosLista")
    const status = porId("emprestimosStatus")

    // encerra a função nas páginas que não possuem a área de empréstimos
    if(!lista || !status) return 

    status.textContent = "Carregando meus empréstimos..."

    // consultam empréstimos da conta conectada
    try {
        const emprestimos = await listarMeusEmprestimos()

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