# Convenções do Projeto e Fluxo de Trabalho da IA

## 1. Fluxo de Desenvolvimento e Aprovação (Regra Estrita)
A IA deve operar com autonomia durante a escrita do código, mas deve ser estritamente bloqueada na etapa de commit. Siga o fluxo abaixo:

* **Desenvolvimento Contínuo:** Ao receber a tarefa de criar uma funcionalidade (Feature), implemente o código de ponta a ponta em todas as camadas da Clean Architecture (Domain, Application, Infra, API/UI) sem pedir permissões intermediárias. Não pare a cada arquivo criado.
* **Ponto de Parada (Review):** Assim que a feature estiver totalmente codificada e testada, **PARE**. Apresente um resumo do que foi feito e pergunte se o usuário aprova o código.
* **Bloqueio de Commit:** **NUNCA** execute o comando `git commit` por conta própria. O commit só deve ser realizado após o usuário responder explicitamente com uma aprovação (ex: "Pode comitar", "Aprovado", "OK").

## 2. Regras de Commit (Git)
Quando o usuário autorizar o commit, ele deve **obrigatoriamente seguir o padrão Conventional Commits**.

### Estrutura Exigida
`<tipo>[escopo opcional]: <descrição em português e no imperativo>`

### Tipos Permitidos
* **feat:** Adição de uma nova funcionalidade ao projeto.
* **fix:** Correção de um bug ou erro.
* **refactor:** Alteração de código que não adiciona nova funcionalidade nem corrige bug (ex: aplicação de Clean Code).
* **chore:** Atualizações de ferramentas, dependências, configurações.
* **docs:** Inclusão ou alteração de arquivos de documentação (ex: pasta specs).
* **style:** Alterações de formatação (espaços, vírgulas) que não afetam a execução.
* **test:** Adição ou correção de testes.

### Diretrizes de Versionamento
1. **Commits Atômicos:** Se uma feature exigir refatorações prévias, comite a refatoração separadamente da feature (após aprovação do usuário para cada etapa).
2. **Contexto:** Use o escopo para indicar a camada afetada (ex: `feat[domain]: adiciona entidade Server`).