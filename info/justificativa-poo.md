# Por que POO neste projeto

A justificativa não é "porque a disciplina pede POO" — é que o domínio do problema já é
naturalmente orientado a objetos: livros, exemplares, empréstimos e estratégias de busca
são entidades com estado e comportamento próprios, que variam de forma diferente
dependendo do contexto. Abaixo, cada pilar é justificado com um exemplo direto do projeto.

## 1. Encapsulamento — a regra de negócio não pode vazar

O `Loan` (empréstimo) concentra o cálculo de multa, a checagem de limite de renovação e a
validação de prazo. Se essas regras estivessem espalhadas pela UI ou por scripts soltos,
bastaria esquecer de validar em um lugar para o sistema permitir uma renovação indevida.

Encapsulando dados e regras dentro da própria classe (`Loan.calcularMulta()`,
`Loan.podeRenovar()`), a única forma de alterar o estado de um empréstimo é através de um
método que já aplica a regra. É a diferença entre "código que funciona hoje" e "código que
continua correto quando o sistema cresce".

## 2. Abstração — quem usa o sistema não precisa saber como ele calcula

O `LoanService` expõe `emprestar()`, `renovar()`, `devolver()`. Quem chama esses métodos (a
API, a UI) não precisa saber que por trás existe checagem de fila de reserva, cálculo de
dias corridos etc. Isso separa **o que** o sistema faz de **como** ele faz — facilita testar
cada parte isoladamente e trocar a implementação sem quebrar quem consome.

## 3. Interfaces e polimorfismo — o ponto mais forte do projeto

Este é o núcleo do "tour de código": é onde POO deixa de ser sintaxe e vira decisão de
design.

- `SearchStrategy` como interface, implementada por `ExactMatchStrategy` e
  `RankedTextStrategy`. O `SearchService` não sabe qual estratégia está rodando — apenas
  chama `strategy.buscar(query, livros)`. Trocar de busca exata para busca por relevância é
  trocar qual objeto é injetado, sem alterar o serviço.
- `Specification<Book>` como interface, com `AndSpecification` / `OrSpecification`
  compondo outras specifications. É polimorfismo aplicado a composição: um filtro complexo
  (gênero E disponível E ano entre X-Y) é apenas uma árvore de objetos que implementam o
  mesmo contrato.

Isso é praticamente a definição de "quando usar interface + polimorfismo": o problema tem
múltiplas variações de um mesmo comportamento (buscar, filtrar) que precisam ser
intercambiáveis em tempo de execução.

## 4. Herança e composição — usadas com moderação

Não forçar herança onde composição resolve melhor. Exemplo de anti-padrão a evitar:
`Member extends User extends Person` só para "usar herança". Herança deve ser usada onde
existe relação real de "é um" — por exemplo, `AdminUser` e `RegularUser` herdando de
`User`, se compartilham identidade e diferem em permissão.

Já a relação entre `Book` e `Copy` (exemplar físico) é melhor modelada como **composição**
("um livro tem vários exemplares"). Vale destacar isso na apresentação: mostra domínio da
diferença entre "é um" (herança) e "tem um" (composição), não apenas sintaxe decorada.

## 5. Conectando POO a testes automatizados

Como cada regra fica isolada atrás de uma interface/classe pequena, é possível testar
unidade por unidade sem banco de dados e sem UI:

- Testar `RankedTextStrategy` com uma lista de livros fake e verificar se o ranking bate.
- Testar `Loan.calcularMulta()` com datas controladas (empréstimo 5 dias além do prazo →
  R$ 12,50 esperados).
- Testar `AndSpecification` combinando duas specifications simples e checando se o
  resultado é a interseção correta.

Se o projeto fosse apenas CRUD com filtro de banco, o teste "automatizado" testaria se o
SQL retorna uma linha — o que não prova nada sobre lógica de negócio, só sobre a query.
POO aqui não é estilo de código: é o que torna a lógica de negócio isolável e testável.

## Resumo

| Conceito de POO | Onde aparece no projeto | Por que era necessário |
|---|---|---|
| Encapsulamento | `Loan` protege cálculo de multa/renovação | Evita regra de negócio duplicada/inconsistente |
| Abstração | `LoanService`, `SearchService` | Esconde complexidade de quem consome |
| Interface + Polimorfismo | `SearchStrategy`, `Specification<Book>` | Permite trocar/comparar algoritmos sem alterar quem os usa |
| Composição | `Book` → `Copy[]` | Modela corretamente "tem vários exemplares" |
| Herança (moderada) | `User` → `AdminUser` / `RegularUser` (se aplicável) | Só onde existe relação real de "é um" |
