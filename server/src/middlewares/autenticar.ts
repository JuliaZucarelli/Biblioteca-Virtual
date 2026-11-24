import type { RequestHandler } from "express";
import { ErroAutenticacao } from "../domain/erros"; 
import type { ServicoTokens } from "../services/servico-tokens";    

// RequestHandler: descreve uma função de middleware do express
export function autenticar(tokens : ServicoTokens) : RequestHandler {
    return (req, res, next) => {
        try {
            // lê o cabeçalho enviado pelo cliente
            const cabecalho = req.get("Authorization") ?? ""

            const resultado = /^Bearer\s+(\S+)$/i.exec(cabecalho)

            // rejeita cabecalho ausente ou com formato inválido
            if(!resultado) {
                throw new ErroAutenticacao("Informe um token de autenticação válido.")
            }

            // contém o token capturado quando o formato está correto
            const token = resultado[1]

            // permite compartilhar dados entre os middlewares e o controller daquela requisição
            res.locals.usuario = tokens.verificarToken(token)

            // permite continuar next(erro) encaminha uma falha ao tratamento de erros, que responderá 401 quando receber
            next()
        } catch (erro : unknown) {
            next(erro)
        }
    }
}