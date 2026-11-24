import { Router } from "express";
import type { SessoesController } from "../controllers/sessoes-controller";
import { metodoNaoPermitido } from "../middlewares/metodo-nao-permitido";

// POST /api/sessoes -> SessoesController.criar -> ServicoSessoes.criarSessao -> Validar credenciais e gerar JWT

export function criarRotasSessoes(controller : SessoesController) : Router {
    // cria o agrupamento de rotas
    const rotas = Router()

    rotas
        .route("/") // define o caminho dentro desse agrupamento 
        .post(controller.criar) // encaminha o POST ao controller de sessões
        .all(metodoNaoPermitido(["POST"])) // usa o middleware existente para responder aos outros métodos

    return rotas
}