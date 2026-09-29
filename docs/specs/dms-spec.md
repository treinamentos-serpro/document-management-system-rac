# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários enviem, consultem e baixem seus documentos, com arquivos armazenados no filesystem local e metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos associados ao usuário informado na requisição.
- Download de um documento pelo identificador, limitado ao usuário associado.
- Armazenamento dos arquivos no diretório local `backend/storage` usando `multer` com `diskStorage`.
- Armazenamento em memória dos metadados durante a execução do backend.
- Interface web para upload, listagem e download, integrada ao backend pelo prefixo `/api` do proxy do Vite.

### Fora do escopo

- Armazenamento em nuvem, provedores externos ou serviços de upload de terceiros.
- Banco de dados para metadados ou persistência dos metadados após reinicialização.
- Autenticação, autorização baseada em credenciais, cadastro de usuários ou recuperação de senha.
- Versionamento, edição, exclusão, compartilhamento ou busca avançada de documentos.
- Upload de múltiplos arquivos em uma única requisição.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário deve informar seu identificador por meio do cabeçalho `X-User-Id` para operar sobre documentos. |
| RF-02 | O usuário pode enviar um arquivo no campo multipart `file` e receber os metadados do documento criado. |
| RF-03 | O sistema deve gerar identificadores únicos para os documentos e nomes internos de arquivo que não dependam do nome fornecido pelo usuário. |
| RF-04 | O usuário pode listar somente os documentos associados ao identificador informado na requisição. |
| RF-05 | O usuário pode baixar um documento pelo identificador somente se ele estiver associado ao mesmo identificador de usuário. |
| RF-06 | O download deve apresentar o nome original do arquivo como nome sugerido ao cliente. |
| RF-07 | O sistema deve rejeitar requisições sem `X-User-Id`, uploads sem arquivo e downloads de documentos inexistentes ou pertencentes a outro usuário. |
| RF-08 | O backend deve manter disponível o endpoint de saúde `GET /health`, retornando o estado do serviço. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados exclusivamente no filesystem local, em `backend/storage` por padrão, usando `multer` com `diskStorage`. |
| RNF-02 | O diretório de armazenamento deve poder ser configurado por `STORAGE_DIR`; se necessário, deve ser criado automaticamente. |
| RNF-03 | Os metadados devem permanecer em memória nesta versão. Eles serão perdidos ao reiniciar o processo, mesmo que os arquivos permaneçam no disco. |
| RNF-04 | O tamanho máximo do arquivo deve ser configurável pela variável `MAX_FILE_SIZE_BYTES`, com limite padrão de 10 MiB. |
| RNF-05 | A porta HTTP deve ser configurável pela variável `PORT`, com valor padrão `3000`. |
| RNF-06 | Os erros de entrada devem ser respondidos com códigos HTTP apropriados e mensagens JSON, sem expor detalhes internos do filesystem. |
| RNF-07 | O backend deve seguir a arquitetura simples `routes → controllers → services → repositories`; as camadas internas não devem depender do Express. |
| RNF-08 | O backend deve usar Node.js, Express e CommonJS; os testes devem usar o runner nativo `node:test`. |
| RNF-09 | A identificação por `X-User-Id` é apenas um mecanismo de associação de dados nesta versão e não representa autenticação ou uma fronteira de segurança. |

## 5. Modelo de dados (metadados do documento)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único do documento, gerado pelo sistema. |
| `originalName` | string | Nome original fornecido no upload, usado na resposta e no download. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload no formato ISO 8601. |
| `owner` | string | Identificador recebido no cabeçalho `X-User-Id`. |

O repositório pode manter internamente o caminho ou nome do arquivo armazenado para viabilizar o download. Esse dado interno não deve ser incluído nas respostas da API. O arquivo deve ser salvo com nome interno gerado pelo sistema, evitando uso direto de caminhos fornecidos pelo cliente.

## 6. Contratos de API

As rotas abaixo são expostas sem o prefixo `/api` pelo backend. Durante o desenvolvimento, o Vite encaminha requisições feitas pelo frontend em `/api` para essas rotas e remove o prefixo.

### `POST /upload`

- Cabeçalho obrigatório: `X-User-Id: <identificador-do-usuário>`.
- Entrada: `multipart/form-data`, com um arquivo no campo `file`.
- Sucesso: `201 Created`, corpo JSON com os campos públicos do documento (`id`, `originalName`, `size`, `uploadedAt`, `owner`).
- `400 Bad Request`: cabeçalho ausente ou arquivo não enviado.
- `413 Payload Too Large`: arquivo maior que o limite configurado.
- `500 Internal Server Error`: falha inesperada no armazenamento ou processamento.

### `GET /documents`

- Cabeçalho obrigatório: `X-User-Id: <identificador-do-usuário>`.
- Sucesso: `200 OK`, corpo JSON como array de metadados dos documentos daquele usuário; array vazio quando não houver documentos.
- `400 Bad Request`: cabeçalho ausente.

### `GET /documents/:id/download`

- Cabeçalho obrigatório: `X-User-Id: <identificador-do-usuário>`.
- Sucesso: `200 OK`, conteúdo binário do arquivo com disposição de download e nome original.
- `400 Bad Request`: cabeçalho ausente.
- `404 Not Found`: documento inexistente, pertencente a outro usuário ou arquivo não disponível no filesystem.
- `500 Internal Server Error`: falha inesperada durante a leitura do arquivo.

### `GET /health`

- Sucesso: `200 OK`, corpo JSON indicando que o backend está ativo.

## 7. Decisões arquiteturais

- `routes/` registra os endpoints e os middlewares de upload com `multer`.
- `controllers/` valida os dados de entrada e traduz resultados e erros para respostas HTTP.
- `services/` aplica as regras de negócio de criação, listagem e acesso por usuário.
- `repositories/` mantém os metadados em memória e fornece as operações de consulta necessárias.
- O armazenamento de arquivos é local, com nome interno gerado e diretório configurável; não são permitidos serviços externos.
- O identificador do usuário é recebido em `X-User-Id` para permitir a separação lógica dos documentos. Como não há autenticação neste escopo, clientes podem informar qualquer valor; a implementação não deve apresentar esse mecanismo como controle de acesso seguro.
- Se o processo reiniciar, os metadados em memória serão perdidos. A reconciliação ou remoção de arquivos órfãos não faz parte desta versão.
- O frontend acessa `/api/upload`, `/api/documents` e `/api/documents/:id/download`; o proxy existente do Vite remove `/api` ao encaminhar ao backend.

## 8. Plano de execução

1. Confirmar os contratos HTTP, os campos de metadados, os limites e as variáveis de ambiente definidos nesta especificação.
2. Implementar a persistência em memória dos metadados e as operações de consulta por identificador de usuário.
3. Implementar as regras de negócio de criação, listagem e localização de documentos.
4. Implementar os controllers, com validação de entrada e respostas de erro padronizadas.
5. Registrar as rotas e configurar `multer` com `diskStorage`, limite de tamanho e nomes internos gerados.
6. Adicionar testes automatizados para os contratos, erros, isolamento lógico por usuário e leitura dos arquivos armazenados.
7. Integrar a interface existente ao backend através do proxy `/api` e validar upload, listagem e download no fluxo do usuário.
8. Executar a suíte de testes e revisar a documentação de configuração e as limitações de persistência e identidade.

Este plano descreve etapas futuras. A especificação não executa nem altera arquivos de backend ou frontend.