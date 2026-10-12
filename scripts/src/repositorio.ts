import {Livro} from "./models/livro";
import {Exemplar, Acervo} from './models/exemplares';

// Contrato que a interface usa para acessar os dados

export interface RepositorioAcervo {
    listarLivros() : Promise < Livro[] >
    obterLivro(id : string) : Promise < Livro | undefined >
    listarExemplares(livroId : string) : Promise < Exemplar[] >
    quantidadeDisponivel(livroId : string) : Promise < number > 
}

export interface OpcoesRepositorioMemoria {
    latenciaMs?: number // simula o tempo de resposta para testar o carregando 
    falhar?: boolean // simula uma falha para testar o estado de erro
}

/* simular o comportamente de uma API ou banco de dados remoto,
permite testar como o sistema reage a latência e falhas inesperadas */
export class RepositorioMemoria implements RepositorioAcervo {
    constructor (
        private readonly acervo : Acervo,
        private readonly opcoes : OpcoesRepositorioMemoria = {}
    ) {}

    private async responder <T> (obter: () => T) : Promise <T> {
        if (this.opcoes.latenciaMs) { // verifica se existe um tempo de latência já configurado
            await new Promise(resolve => setTimeout(resolve, this.opcoes.latenciaMs))
        }

        if (this.opcoes.falhar) {
            throw new Error("Não foi possível carregar dados do acervo.")
        }
        return obter()
    }

    listarLivros(): Promise<Livro[]> {
        return this.responder(() => this.acervo.listarLivros())
    }
    
    obterLivro(id: string): Promise<Livro | undefined> {
        return this.responder(() => this.acervo.obterLivro(id))
    }

    listarExemplares(livroId: string): Promise<Exemplar[]> {
        return this.responder(() => this.acervo.obterExemplares(livroId))
    }

    quantidadeDisponivel(livroId: string): Promise<number> {
        return this.responder(() => this.acervo.quantidadeDisponivel(livroId))
    }

}