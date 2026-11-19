import { Router } from "express"; 
import type { UsuariosController } from "../controllers/usuarios.controller";
import { metodoNaoPermitido } from "../middlewares/metodo-nao-permitido";

/* conexão: 
POST /api/usuarios -> UsuariosController.cadastrar -> ServicoUsuario.cadastrar -> RepositorioUsuariosSQLite
*/

export function criarRotasUsuarios(
    controller : UsuariosController
) : Router {
    // Router() : cria um agrupamento de rotas do Express
    const rotas = Router()

    rotas
        .route("/") // define o caminho desse agrupamento 
        .post(controller.cadastrar) // recebe o objeto que executará o cadastro
        .all(metodoNaoPermitido(["POST"])) // usa o middleware existente para responder aos demais métodos

    return rotas
}