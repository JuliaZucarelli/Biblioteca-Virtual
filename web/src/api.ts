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

// descreve os campos enviados pelo formulário
export interface DadosCadastroUsuario {
    nome : string
    email : string
    senha : string
}

// descreve os dados públicos devolvidos pela API
export interface UsuarioResumo {
    id : string
    nome : string
    email : string
    papel : "ADMIN" | "MEMBRO"
}

// descreve os dados enviados pelo formulário
export interface DadosLogin {
    email : string
    senha : string
}

// descreve o retorno da API: o JWT e os dados públicos do usuário
export interface RespostaLogin {
    token : string
    usuario : UsuarioResumo
}

// função para busca de livro - entrega uma lista de livros
export async function listarLivros(): Promise<LivroResumo[]> {
    // faz uma requisição GET
    // const resposta = await fetch("/api/livros")
    const enderecoApi = import.meta.env.VITE_API_URL ?? ""
    const resposta = await fetch(`${enderecoApi}/api/livros`)

    // verifica se status HTPP está entre 200 e 299
    if(!resposta.ok) {
        throw new Error(`Não foi possível carregar os livros (${resposta.status}).`)   
    }

    // lê e converte o JSON em dados js 
    const livros: LivroResumo[] = await resposta.json()
    return livros
}

// função que envia cadastro para a API
export async function cadastrarUsuario(dados : DadosCadastroUsuario) : Promise<UsuarioResumo> {
    // utiliza o endereço do Render na publicação, localmente o valor vazio permite usar o proxy do vite
    const enderecoApi = import.meta.env.VITE_API_URL ?? ""

    const resposta = await fetch(`${enderecoApi}/api/usuarios`, {
        method : "POST", // solicita criação do usuário
        headers : {
            "Content-Type" : "application/json"
        }, // informa que o corpo contém JSON
        body : JSON.stringify(dados)
    })

    // trata respostas de erro como 400 e 409 tentando ler a mensagem enviada pelo backend
    if(!resposta.ok) {
        // se não puder ser interpretado como JSON, o trecho devolve null
        const dadosErro = await resposta.json().catch(() => null)

        // permite consultar erro 
        const mensagem = dadosErro?.erro

        // utiliza a mensagem recebida quando ela é texto, caso contrario utiliza a mensagem genérica
        throw new Error(typeof mensagem === "string" ? mensagem : "Não foi possível realizar o cadastro.")
    }

    const usuario : UsuarioResumo = await resposta.json()

    return usuario
}

// envia uma requisição POST /api/sessoes
export async function iniciarSessao(dados : DadosLogin) : Promise<RespostaLogin> {
    const enderecoApi = import.meta.env.VITE_API_URL ?? ""

    const resposta = await fetch(`${enderecoApi}/api/sessoes`, {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(dados) // transforma o e-mail e senha em JSON
    })

    // trata respostas de falha como senha incorreta 
    // tenta recuperar a mensagem da API e lança um erro no overlay 
    if(!resposta.ok) {
        const dadosErro = await resposta.json().catch(() => null)
        const mensagem = dadosErro?.erro

        throw new Error(
            typeof mensagem === "string"
            ? mensagem
            : "Não foi possível entrar na conta."
        )
    }

    const sessao : RespostaLogin = await resposta.json()
    return sessao
}

// a função pode devolver uma sessão ou ausência dela
export function obterSessao() : RespostaLogin | null {
    // busca os dados que guarda após o login
    const texto = sessionStorage.getItem("biblioteca.sessao")

    // retorna null quando nenhuma sessão foi salva 
    if(!texto) return null

    try {
        // transforma o texto armazenado novamente em objeto 
        const sessao : RespostaLogin = JSON.parse(texto)
        return sessao 
    } catch { // remova o conteúdo caso ele não seja um JSON válido e retorna null
        sessionStorage.removeItem("biblioteca.sessao")
        return null
    }
}

// remove a sessaão salva naquela aba
export function encerrarSessao() : void {
    sessionStorage.removeItem("biblioteca.sessao")
}