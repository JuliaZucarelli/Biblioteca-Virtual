import type { Request, Response } from "express";
import type { ServicoUsuarios } from "../services/servico-usuarios";

export class UsuariosController {
    constructor(
        private readonly servico : ServicoUsuarios
    ) {}

    cadastrar = async(req : Request, res : Response) : Promise<void> => {
        // req.body: contém o JSON enviado pelo cliente, o serviço valida esses dados
        const usuario = await this.servico.cadastrar(req.body)

        res
            .status(201) // informa que um recurso foi criado
            .location(`${req.baseUrl}/${usuario.id}`) // informa o endereço do recurso criado -> /api/usuarios/identificador
            .json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            papel: usuario.papel,
      });
    }
}