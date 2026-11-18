import { Emprestimo, REGRAS_PADRAO, adicionarDias, type RegrasEmprestimo } from "../domain/emprestimo"
import { ErroConflito, ErroNaoAutenticado, ErroNaoEncontrado, ErroProibido, ErroValidacao } from "../domain/erros"
import { StatusExemplar, type Exemplar } from "../domain/exemplares"
import { Reserva, StatusReserva } from "../domain/reserva"
import type { RepositorioEmprestimos } from "../repositories/repositorio-emprestimos"

// função que devolve "agora"; nos testes é trocada por um relógio controlável
export type Relogio = () => Date

// o que a API devolve para cada empréstimo (datas em texto ISO; multa em centavos)
export interface EmprestimoResumo {
    id: string
    usuarioId: string
    exemplarId: string
    livroId: string
    livroTitulo: string
    dataEmprestimo: string
    dataVencimento: string
    dataDevolucao: string | null
    renovacoes: number
    ativo: boolean
    atrasado: boolean
    diasDeAtraso: number
    multaCentavos: number
}

export interface DevolucaoResumo {
    emprestimo: EmprestimoResumo
    diasDeAtraso: number
    multaCentavos: number
}

export interface ReservaResumo {
    id: string
    usuarioId: string
    livroId: string
    livroTitulo: string
    criadaEm: string
    status: StatusReserva
    posicao: number | null // posição na fila (1 = primeiro); null se a reserva não está mais ativa
    pronta: boolean        // true: já existe uma unidade guardada esperando por este usuário
}

export type SituacaoEmprestimos = "ativos" | "encerrados"

// retrato do livro naquele instante: exemplares e fila de reservas
interface SituacaoDoLivro {
    exemplares: Exemplar[]
    fila: Reserva[]
    reservadas: number  // unidades no status RESERVADO (guardadas para o começo da fila)
    disponiveis: number // unidades no status DISPONIVEL
}

function exigirTexto(valor: unknown, mensagem: string): string {
    if (typeof valor !== "string" || !valor.trim()) {
        throw new ErroValidacao(mensagem)
    }
    return valor.trim()
}

/* Regras de empréstimo, devolução, renovação, multa e reservas. Depende só da interface
RepositorioEmprestimos e não conhece HTTP: sinaliza problemas com os erros de domain/erros.ts.

Como a fila funciona (RN28 a RN34):
 - A fila de um livro são as reservas ATIVAS, da mais antiga para a mais nova.
 - Ao devolver, se há mais gente na fila do que unidades RESERVADO, a unidade devolvida vira RESERVADO
   (guardada para o primeiro da fila sem unidade). Só quem está nas primeiras posições pode pegá-la.
 - As primeiras "reservadas" posições da fila têm unidade guardada; as demais ainda esperam. */
export class ServicoCirculacao {
    constructor (
        private readonly repositorio : RepositorioEmprestimos,
        private readonly regras : RegrasEmprestimo = REGRAS_PADRAO,
        private readonly relogio : Relogio = () => new Date()
    ) {}

    // ---------- empréstimos ----------

    async emprestar(usuarioId: string, exemplarId: string): Promise<EmprestimoResumo> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        const idExemplar = exigirTexto(exemplarId, "O exemplar é obrigatório.")

        return this.repositorio.executarEmTransacao(async () => {
            await this.exigirUsuario(usuario)
            const exemplar = await this.exigirExemplar(idExemplar)

            const ativos = (await this.repositorio.listarEmprestimosDoUsuario(usuario)).filter(e => e.ativo)
            if (ativos.length >= this.regras.limitePorUsuario) {
                throw new ErroConflito(`O usuário atingiu o limite de ${this.regras.limitePorUsuario} empréstimos ativos.`)
            }

            const situacao = await this.situacaoDoLivro(exemplar.livroId)
            const posicao = situacao.fila.findIndex(r => r.usuarioId === usuario) // -1: não está na fila
            const reserva = posicao >= 0 ? situacao.fila[posicao] : undefined

            // 1) decide se pode: nada é alterado até o fim das validações
            if (exemplar.status === StatusExemplar.RESERVADO) {
                if (posicao < 0 || posicao >= situacao.reservadas) {
                    throw new ErroConflito("Esta unidade está guardada para outro usuário da fila de reservas.")
                }
            } else if (exemplar.status === StatusExemplar.DISPONIVEL) {
                this.validarUnidadeDisponivel(situacao, posicao)
            } else {
                throw new ErroConflito(`O exemplar ${exemplar.codigo} não está disponível para empréstimo.`)
            }

            // 2) grava: unidade, empréstimo e (se houver) reserva atendida, tudo na mesma transação
            const agora = this.relogio()
            const emprestimo = new Emprestimo(
                await this.repositorio.proximoIdEmprestimo(),
                usuario,
                idExemplar,
                agora,
                adicionarDias(agora, this.regras.prazoDias)
            )

            if (exemplar.status === StatusExemplar.RESERVADO) {
                exemplar.emprestarReservado()
            } else {
                exemplar.emprestar()
            }
            await this.repositorio.atualizarExemplar(exemplar)
            await this.repositorio.salvarEmprestimo(emprestimo)

            if (reserva) {
                reserva.atender() // o empréstimo ao titular encerra a reserva (RN31)
                await this.repositorio.atualizarReserva(reserva)
            }

            return this.resumirEmprestimo(emprestimo, agora)
        })
    }

    async devolver(usuarioId: string, emprestimoId: string): Promise<DevolucaoResumo> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        const idEmprestimo = exigirTexto(emprestimoId, "O empréstimo é obrigatório.")

        return this.repositorio.executarEmTransacao(async () => {
            await this.exigirUsuario(usuario)
            const emprestimo = await this.exigirEmprestimoDoUsuario(usuario, idEmprestimo)
            if (!emprestimo.ativo) {
                throw new ErroConflito("Este empréstimo já foi encerrado.")
            }

            const exemplar = await this.exigirExemplar(emprestimo.exemplarId)
            const situacao = await this.situacaoDoLivro(exemplar.livroId)

            // há gente na fila sem unidade guardada: a unidade devolvida vai direto para ela (RN30)
            if (situacao.fila.length > situacao.reservadas) {
                exemplar.reservar()
            } else {
                exemplar.devolver()
            }

            const agora = this.relogio()
            emprestimo.encerrar(agora)
            await this.repositorio.atualizarExemplar(exemplar)
            await this.repositorio.atualizarEmprestimo(emprestimo)

            const resumo = await this.resumirEmprestimo(emprestimo, agora)
            return { emprestimo: resumo, diasDeAtraso: resumo.diasDeAtraso, multaCentavos: resumo.multaCentavos }
        })
    }

    async renovar(usuarioId: string, emprestimoId: string): Promise<EmprestimoResumo> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        const idEmprestimo = exigirTexto(emprestimoId, "O empréstimo é obrigatório.")

        return this.repositorio.executarEmTransacao(async () => {
            await this.exigirUsuario(usuario)
            const emprestimo = await this.exigirEmprestimoDoUsuario(usuario, idEmprestimo)
            if (!emprestimo.ativo) {
                throw new ErroConflito("Não é possível renovar um empréstimo já encerrado.")
            }

            const agora = this.relogio()
            if (emprestimo.diasDeAtraso(agora) > 0) {
                throw new ErroConflito("Não é possível renovar um empréstimo em atraso.")
            }
            if (emprestimo.renovacoes >= this.regras.maxRenovacoes) {
                throw new ErroConflito(`O limite de renovações (${this.regras.maxRenovacoes}) foi atingido.`)
            }

            const exemplar = await this.exigirExemplar(emprestimo.exemplarId)
            const fila = await this.repositorio.listarReservasAtivasDoLivro(exemplar.livroId)
            if (fila.length > 0) {
                throw new ErroConflito("Não é possível renovar: há reserva ativa para este livro.")
            }

            // o novo prazo conta a partir da data da renovação (RN24)
            emprestimo.registrarRenovacao(adicionarDias(agora, this.regras.prazoDias))
            await this.repositorio.atualizarEmprestimo(emprestimo)
            return this.resumirEmprestimo(emprestimo, agora)
        })
    }

    async obterEmprestimo(usuarioId: string, emprestimoId: string): Promise<EmprestimoResumo> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        await this.exigirUsuario(usuario)
        const emprestimo = await this.exigirEmprestimoDoUsuario(usuario, exigirTexto(emprestimoId, "O empréstimo é obrigatório."))
        return this.resumirEmprestimo(emprestimo, this.relogio())
    }

    // empréstimos do usuário (ativos e encerrados), com atraso e multa calculados até agora
    async listarEmprestimos(usuarioId: string, situacao?: SituacaoEmprestimos): Promise<EmprestimoResumo[]> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        if (situacao !== undefined && situacao !== "ativos" && situacao !== "encerrados") {
            throw new ErroValidacao("A situação deve ser 'ativos' ou 'encerrados'.")
        }
        await this.exigirUsuario(usuario)

        const agora = this.relogio()
        const emprestimos = (await this.repositorio.listarEmprestimosDoUsuario(usuario)).filter(e =>
            situacao === undefined || (situacao === "ativos" ? e.ativo : !e.ativo)
        )
        const resumos: EmprestimoResumo[] = []
        for (const emprestimo of emprestimos) {
            resumos.push(await this.resumirEmprestimo(emprestimo, agora))
        }
        return resumos
    }

    // ---------- reservas ----------

    async reservar(usuarioId: string, livroId: string): Promise<ReservaResumo> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        const idLivro = exigirTexto(livroId, "O livro é obrigatório.")

        return this.repositorio.executarEmTransacao(async () => {
            await this.exigirUsuario(usuario)
            const livro = await this.repositorio.obterLivro(idLivro)
            if (!livro) {
                throw new ErroNaoEncontrado("Livro não encontrado.")
            }

            const situacao = await this.situacaoDoLivro(idLivro)
            if (situacao.exemplares.length === 0) {
                throw new ErroConflito("Este livro ainda não tem exemplares cadastrados.")
            }
            if (situacao.fila.some(r => r.usuarioId === usuario)) {
                throw new ErroConflito("Você já tem uma reserva ativa para este livro.")
            }
            if (this.unidadesLivres(situacao) > 0) {
                throw new ErroConflito("Há exemplar disponível: faça o empréstimo em vez de reservar.")
            }

            const reserva = new Reserva(await this.repositorio.proximoIdReserva(), usuario, idLivro, this.relogio())
            await this.repositorio.salvarReserva(reserva)

            const posicao = situacao.fila.length + 1
            return this.resumirReserva(reserva, livro.titulo, posicao, situacao.reservadas)
        })
    }

    async listarReservas(usuarioId: string): Promise<ReservaResumo[]> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        await this.exigirUsuario(usuario)

        const reservas = await this.repositorio.listarReservasDoUsuario(usuario)
        const resumos: ReservaResumo[] = []
        for (const reserva of reservas) {
            resumos.push(await this.resumirReservaAtual(reserva))
        }
        return resumos
    }

    async obterReserva(usuarioId: string, reservaId: string): Promise<ReservaResumo> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        await this.exigirUsuario(usuario)
        return this.resumirReservaAtual(await this.exigirReservaDoUsuario(usuario, exigirTexto(reservaId, "A reserva é obrigatória.")))
    }

    // o titular cancela a reserva: a prioridade passa para o próximo da fila (RN31)
    async cancelarReserva(usuarioId: string, reservaId: string): Promise<void> {
        const usuario = exigirTexto(usuarioId, "O usuário é obrigatório.")
        const idReserva = exigirTexto(reservaId, "A reserva é obrigatória.")

        await this.repositorio.executarEmTransacao(async () => {
            await this.exigirUsuario(usuario)
            const reserva = await this.exigirReservaDoUsuario(usuario, idReserva)
            if (!reserva.ativa) {
                throw new ErroConflito("Esta reserva não está ativa.")
            }

            reserva.cancelar()
            await this.repositorio.atualizarReserva(reserva)

            // se sobrou unidade guardada sem ninguém na fila para ela, volta a ficar disponível
            const situacao = await this.situacaoDoLivro(reserva.livroId)
            let excedente = situacao.reservadas - situacao.fila.length
            for (const exemplar of situacao.exemplares) {
                if (excedente <= 0) {
                    break
                }
                if (exemplar.status === StatusExemplar.RESERVADO) {
                    exemplar.liberarReserva()
                    await this.repositorio.atualizarExemplar(exemplar)
                    excedente--
                }
            }
        })
    }

    // ---------- regras da fila ----------

    // unidades DISPONIVEL que não são necessárias para quem já espera na fila
    private unidadesLivres(situacao: SituacaoDoLivro): number {
        const esperandoSemUnidade = Math.max(0, situacao.fila.length - situacao.reservadas)
        return situacao.disponiveis - esperandoSemUnidade
    }

    // pode pegar uma unidade DISPONIVEL respeitando a fila? (posicao -1 = não está na fila)
    private validarUnidadeDisponivel(situacao: SituacaoDoLivro, posicao: number): void {
        if (posicao >= 0 && posicao < situacao.reservadas) {
            const guardada = situacao.exemplares.find(e => e.status === StatusExemplar.RESERVADO)
            throw new ErroConflito(
                `Há uma unidade reservada para você${guardada ? ` (${guardada.codigo})` : ""}: empreste essa unidade.`
            )
        }
        if (posicao >= 0) {
            // está na fila, mas sem unidade guardada: precisa haver DISPONIVEL suficiente para quem está à frente dele
            if (posicao - situacao.reservadas >= situacao.disponiveis) {
                throw new ErroConflito("Há outros usuários à frente na fila de reservas.")
            }
            return
        }
        if (this.unidadesLivres(situacao) <= 0) {
            throw new ErroConflito("Esta unidade está destinada à fila de reservas.")
        }
    }

    private async situacaoDoLivro(livroId: string): Promise<SituacaoDoLivro> {
        const exemplares = await this.repositorio.listarExemplaresDoLivro(livroId)
        const fila = await this.repositorio.listarReservasAtivasDoLivro(livroId)
        return {
            exemplares,
            fila,
            reservadas: exemplares.filter(e => e.status === StatusExemplar.RESERVADO).length,
            disponiveis: exemplares.filter(e => e.status === StatusExemplar.DISPONIVEL).length,
        }
    }

    // ---------- auxiliares ----------

    private async exigirUsuario(usuarioId: string): Promise<void> {
        if (!(await this.repositorio.usuarioExiste(usuarioId))) {
            throw new ErroNaoAutenticado("Usuário não identificado.")
        }
    }

    private async exigirExemplar(exemplarId: string): Promise<Exemplar> {
        const exemplar = await this.repositorio.obterExemplar(exemplarId)
        if (!exemplar) {
            throw new ErroNaoEncontrado("Exemplar não encontrado.")
        }
        return exemplar
    }

    // um membro só mexe nos próprios empréstimos (RN16)
    private async exigirEmprestimoDoUsuario(usuarioId: string, emprestimoId: string): Promise<Emprestimo> {
        const emprestimo = await this.repositorio.obterEmprestimo(emprestimoId)
        if (!emprestimo) {
            throw new ErroNaoEncontrado("Empréstimo não encontrado.")
        }
        if (emprestimo.usuarioId !== usuarioId) {
            throw new ErroProibido("Este empréstimo pertence a outro usuário.")
        }
        return emprestimo
    }

    private async exigirReservaDoUsuario(usuarioId: string, reservaId: string): Promise<Reserva> {
        const reserva = await this.repositorio.obterReserva(reservaId)
        if (!reserva) {
            throw new ErroNaoEncontrado("Reserva não encontrada.")
        }
        if (reserva.usuarioId !== usuarioId) {
            throw new ErroProibido("Esta reserva pertence a outro usuário.")
        }
        return reserva
    }

    private async resumirEmprestimo(emprestimo: Emprestimo, referencia: Date): Promise<EmprestimoResumo> {
        const exemplar = await this.exigirExemplar(emprestimo.exemplarId)
        const livro = await this.repositorio.obterLivro(exemplar.livroId)
        const diasDeAtraso = emprestimo.diasDeAtraso(referencia)
        return {
            id: emprestimo.id,
            usuarioId: emprestimo.usuarioId,
            exemplarId: emprestimo.exemplarId,
            livroId: exemplar.livroId,
            livroTitulo: livro?.titulo ?? "",
            dataEmprestimo: emprestimo.dataEmprestimo.toISOString(),
            dataVencimento: emprestimo.dataVencimento.toISOString(),
            dataDevolucao: emprestimo.dataDevolucao?.toISOString() ?? null,
            renovacoes: emprestimo.renovacoes,
            ativo: emprestimo.ativo,
            atrasado: emprestimo.atrasado(referencia),
            diasDeAtraso,
            multaCentavos: diasDeAtraso * this.regras.multaPorDiaCentavos,
        }
    }

    private resumirReserva(reserva: Reserva, livroTitulo: string, posicao: number | null, reservadas: number): ReservaResumo {
        return {
            id: reserva.id,
            usuarioId: reserva.usuarioId,
            livroId: reserva.livroId,
            livroTitulo,
            criadaEm: reserva.criadaEm.toISOString(),
            status: reserva.status,
            posicao,
            pronta: posicao !== null && posicao <= reservadas,
        }
    }

    // monta o resumo com a posição que a reserva tem na fila neste momento
    private async resumirReservaAtual(reserva: Reserva): Promise<ReservaResumo> {
        const livro = await this.repositorio.obterLivro(reserva.livroId)
        let posicao: number | null = null
        let reservadas = 0
        if (reserva.ativa) {
            const situacao = await this.situacaoDoLivro(reserva.livroId)
            posicao = situacao.fila.findIndex(r => r.id === reserva.id) + 1
            reservadas = situacao.reservadas
        }
        return this.resumirReserva(reserva, livro?.titulo ?? "", posicao, reservadas)
    }
}
