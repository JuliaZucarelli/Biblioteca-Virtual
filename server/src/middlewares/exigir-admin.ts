import type { RequestHandler } from "express";
import { ErroAutenticacao, ErroPermissao } from "../domain/erros";

// RequestHandler: define o tipo de middleware do express
export const exigirAdmin : RequestHandler = (_req, res, next) => {
    try {
        // recupera a identidade que o middleware autenticar verificou 
        const usuario = res.locals.usuario

        // impedde continuar sem uma identidade autenticada (401)
        if(!usuario) {
            throw new ErroAutenticacao("É necessário estar autenticado.")
        }

        // impede de continuar quando o papel for "ADMIN" (403)
        if(usuario.papel !== "ADMIN") {
            throw new ErroPermissao("Esta operação exige permissão de administrador.")
        }

        // permite seguir para o próximo  middleware ou controller quando as verificações passam 
        next()
    } catch(erro : unknown) {
        next(erro)
    }
}