import { criarAcervoInicial } from "./data/dados_inicias"
import { RepositorioMemoria } from "./repositories/repositorio"

async function main() {
    const repo = new RepositorioMemoria(criarAcervoInicial(), { latenciaMs: 500 })

    console.log("Carregando...")
    const livros = await repo.listarLivros()
    for (const livro of livros) {
        const disponiveis = await repo.quantidadeDisponivel(livro.id)
        console.log(`${livro.titulo} (${livro.ano}) - ${disponiveis} disponível(is)`)
    }
}

main().catch(erro => console.error("Erro:", erro.message))