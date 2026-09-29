---
description: "Implementa uma funcionalidade ou correção no DMS, integrando backend e frontend quando necessário e validando com os testes existentes."
name: "Implementar funcionalidade no DMS"
argument-hint: "descreva a funcionalidade, correção ou comportamento esperado"
agent: "agent"
---

# Implementar funcionalidade no DMS

Implemente esta solicitação no Document Management System: `${input:solicitacao:descreva a funcionalidade ou correção}`

Antes de editar:

- Consulte as instruções do workspace e a especificação relevante em `docs/specs/`.
- Examine o código e os testes próximos para localizar o fluxo que controla o comportamento.
- Defina o menor escopo que atende à solicitação e uma verificação capaz de detectar se a hipótese está errada.
- Se faltar uma decisão indispensável ou houver conflito entre a solicitação e a especificação, pergunte antes de ampliar o escopo.

Implemente seguindo as convenções existentes:

- Backend em Node.js, Express e CommonJS, com dependências fluindo `routes → controllers → services → repositories`.
- Frontend em React/Vite, organizado nos diretórios existentes e comunicando-se com a API via `/api`.
- Arquivos enviados devem permanecer no filesystem local; não introduza armazenamento externo.
- Preserve os contratos da API e as limitações documentadas. Não apresente `X-User-Id` como autenticação.
- Reutilize dependências, utilitários e padrões existentes. Evite mudanças não relacionadas.
- Adicione ou atualize testes focados no comportamento alterado, usando `node:test` no backend e o padrão já existente no frontend.

Após a primeira edição, execute primeiro a verificação focada mais próxima do comportamento alterado. Corrija falhas relacionadas e repita essa verificação; depois, rode os demais testes ou verificações relevantes disponíveis.

Ao concluir, informe resumidamente o que mudou, quais verificações foram executadas e qualquer limitação ou teste que não pôde ser executado.