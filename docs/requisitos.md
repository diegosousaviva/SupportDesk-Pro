# Escopo atual e itens futuros

Este documento substitui a lista inicial de requisitos, que descrevia uma arquitetura planejada (incluindo NestJS/PostgreSQL) diferente da aplicação entregue. Para procedimentos atuais, consulte o [README](../README.md).

## Sistema atual

- Aplicação web React + TypeScript servida por Nginx.
- API Node.js + Express com autenticação e autorização por perfil.
- Persistência centralizada em MySQL na VPS.
- Perfis Administrador, Técnico e Solicitante.
- Módulos disponíveis conforme perfil: Dashboard, Chamados, Inventário, Notas, Usuários, Categorias, Lojas, Relatórios e Configurações.
- Administração de contas e alteração autenticada da própria senha.
- Health check da API em `/api/health`.
- Recuperação automática de senha ainda não implementada; o link permanece na tela de login para evolução posterior.

## Requisitos operacionais

- Produção: Node.js, MySQL, Nginx e serviço systemd conforme a configuração da VPS.
- Desenvolvimento local: versão mínima de Node.js e passos descritos em [DEVELOPMENT.md](../DEVELOPMENT.md).
- Dados de desenvolvimento e testes devem usar bancos locais próprios, sem apontar para produção.
- Backups de produção devem ser mantidos fora da raiz pública e restauração deve ser validada em ambiente separado.
- Alterações precisam passar por revisão, builds e verificações adequadas antes da implantação.

## Evoluções ainda não concluídas

- Recuperação de senha por fluxo seguro de redefinição.
- Melhorias futuras identificadas durante a validação funcional, priorizadas pelo responsável do produto.
- Redução dos chunks grandes do frontend por divisão/carregamento sob demanda (há somente um aviso de tamanho no build; o build conclui).

Itens futuros não devem ser tratados como funções disponíveis em produção até serem implementados e validados.
