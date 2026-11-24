import type { Request, Response } from "express";
import type { ServicoSessoes } from "../services/servico-sessoes";

export class SessoesController {
    // recebe ServicoSessoes que verifica as credenciais e gera o token
    constructor(
        private readonly servico : ServicoSessoes
    ) {}

    criar = async(req : Request, res : Response) : Promise<void> => {
        // req.body: contém o e-mail e a senha enviados pelo cliente
        const sessao = await this.servico.criarSessao(req.body)

        // informa que a sessão foi criada
        res.status(201).json({
            token : sessao.token,
            usuario : {
                id : sessao.usuario.id,
                nome : sessao.usuario.nome,
                email : sessao.usuario.email,
                papel : sessao.usuario.papel,
            }
        })
    }
}