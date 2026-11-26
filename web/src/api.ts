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

// descreve o empréstimo pelo catálogo
export interface ExemplarResumo {
    id : string
    livroId : string
    codigo : string 
    status : string
    disponivel : boolean
}

// descreve os campos da resposta que usaremos inicialmente
export interface EmprestimoResumo {
    id : string 
    exemplarId : string
    livroId : string 
    livroTitulo : string 
    dataVencimento : string 
    ativo : boolean
}

// função para busca de livro - entrega uma lista de livros
export async function listarLivros(): Promise<LivroResumo[]> {
    // faz uma requisição GET
    // const resposta = await fetch("/api/livros")
    const enderecoApi = import.meta.env.VITE_API_URL ?? ""
    const resposta = await fetch(`${enderecoApi}/api/livros/`)

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

// lista os exemplares
/* a propriedade disponivel ajuda a localizar uma unidade disponível. 
A decisão final de permitir o empréstimo continuará sendo do backend, já que a disponibilidade pode mudar depois da consulta */
export async function listarExemplares(livroId : string) : Promise<ExemplarResumo[]> {
    const enderecoApi = import.meta.env.VITE_API_URL ?? ""

    // encodeURIComponent: prepara esse identificador para ser colocado na URL
    // fetch: consulta GET /api/livros/:id/exemplares -> essa consulta é pública então não precisa de token
    const resposta = await fetch(`${enderecoApi}/api/livros/${encodeURIComponent(livroId)}/exemplares`)

    // interrompe a operação quando a consulta falha
    if(!resposta.ok) {
        throw new Error("Não foi possível consultar os exemplares deste livro.")
    }

    // lê a lista de exemplares retornada pela API
    const exemplares : ExemplarResumo[] = await resposta.json()
    return exemplares
}

export async function emprestarExemplar(exemplarId : string) : Promise<EmprestimoResumo> {
    // recupera o token salvo
    const sessao = obterSessao()

    // impede a solicitação quando não há sessão 
    if(!sessao) {
        throw new Error("Entre na sua conta para solicitar um empréstimo.")
    }

    const enderecoApi = import.meta.env.VITE_API_URL ?? ""   

    const resposta = await fetch(`${enderecoApi}/api/emprestimos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessao.token}` // envia o JWT para a API identificar o usuário -> o corpo envia somente o exemplar, a identidade vem do token
        },
        body: JSON.stringify({ exemplarId })
    })

    if(!resposta.ok) {
        if(resposta.status === 401) { // remove a sessão inválida e pede um novo login
            encerrarSessao()
            throw new Error("Sua sessão não é válida. Entre novamente.")
        }

        const dadosErro = await resposta.json().catch(() => null)

        throw new Error(
            typeof dadosErro?.erro === "string"
            ? dadosErro.erro
            : "Não foi possível realizar o empréstimo."
        )
    }

    const emprestimo : EmprestimoResumo = await resposta.json()
    return emprestimo
}

// recupera a sessão e impede a consulta sem login 
// () indica que ela não recebe argumentos, a identidade será obtida pelo token
export async function listarMeusEmprestimos() : Promise<EmprestimoResumo[]> {
    // recuperar sessão 
    const sessao = obterSessao()

    // chama a função que lê "biblioteca.sessao" do sessionStorage
    // se não existir sessão, cria um erro e interrompe a função antes de consultat a API
    if(!sessao) {
        throw new Error("Entre na sua conta para consultar os empréstimos.")
    }

    // definir endereço da API
    const enderecoApi = import.meta.env.VITE_API_URL ?? ""

    // consultar os empréstimos
    // fetch: envia a requisição
    // Authorization: envia o JWT no formato Bearer token 
    // o middleware valida o token e recupera a identidade, o serviço usa esse identidade para consultar os empréstimos daquele usuário 
    const resposta = await fetch(`${enderecoApi}/api/emprestimos`, {
        headers : {
            "Authorization" : `Bearer ${sessao.token}`
        }
    })

    // identificar uma resposta de falha 
    if(!resposta.ok) {
        // se a API responder 401, o token não foi aceito 
        if(resposta.status === 401) {
            encerrarSessao() // remove a sessão armazenada na aba 
            throw new Error("Sua sessão não é válida. Entre novamente.")
        }

        // recuperar outras mensagens de erro 
        const dadosErro = await resposta.json().catch(() => null)
 
        // se o corpo for JSON válido, o .catch(() => null) evita que essa leitura gere outro erro e usa null
        throw new Error(
            typeof dadosErro?.erro === "string" // verifica se a mensagem recebida é um texto 
            ? dadosErro.erro
            : "Não foi possível consultar seus empréstimos." // escolher a mensagem da API
        )
    }

    // ler e devolver a lista 
    const emprestimos : EmprestimoResumo[] = await resposta.json()
    return emprestimos
}