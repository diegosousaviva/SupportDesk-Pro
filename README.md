# SupportDesk Pro

Sistema web de suporte e gerenciamento de chamados da Droga Viva. A aplicação publicada usa uma API Node.js/Express e banco MySQL na VPS; o navegador acessa o frontend pelo domínio da empresa.

## Documentação

- [Manual do usuário](docs/manual-usuario.md): acesso, módulos, perfis e operações comuns.
- [Implantação e operação da VPS](docs/implantacao-vps.md): arquitetura publicada, atualização, verificações, backup e diagnóstico.
- [Arquitetura atual](docs/arquitetura.md): componentes, persistência e segurança.
- [Guia de continuidade](docs/guia-continuidade.md): mapa técnico e orientações para assumir o desenvolvimento.
- [Desenvolvimento local](DEVELOPMENT.md): ambiente de desenvolvimento local isolado.
- [Testes de integração de Categorias](backend/tests/CATEGORIES_INTEGRATION.md): procedimento estritamente local com banco descartável.
- [Escopo atual e requisitos](docs/requisitos.md) e [próximos itens](docs/roadmap.md).

## Acesso publicado

O endereço de produção é [https://suportedrogaviva.com.br](https://suportedrogaviva.com.br). Cada pessoa deve usar sua própria conta criada por um administrador. Não compartilhe senha, token de acesso nem arquivo `.env`.

## Estrutura

```text
backend/   API Express, autenticação e acesso ao MySQL
frontend/  aplicação React e interface web
docs/      documentação do produto e operação
```

Consulte os guias acima antes de operar ou publicar alterações. A documentação descreve o código e a implantação conhecidos; os valores secretos de produção ficam somente na VPS.
