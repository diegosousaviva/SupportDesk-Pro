# Arquitetura atual

## Visão geral

O SupportDesk Pro é uma aplicação web dividida em frontend, API e banco de dados. Em produção, o navegador carrega o frontend do Nginx; chamadas `/api/` são encaminhadas para a API Node.js na própria VPS. Somente o backend acessa o MySQL.

```text
Navegador
   │ HTTPS
   ▼
Nginx ─── arquivos do frontend compilado
   │ /api/*
   ▼
API Node.js / Express (porta local 3000)
   │ conexão local MySQL
   ▼
MySQL: users + supportdesk_records
```

## Componentes

- **Frontend:** React, TypeScript, Vite e Material UI. Implementa telas, navegação, controle visual por perfil, relatórios e chamadas à API.
- **Backend:** Node.js, TypeScript e Express. Fornece autenticação, validação de sessão, autorização, rotas de usuários, categorias e dados.
- **Banco:** MySQL com tabelas InnoDB e charset `utf8mb4`.
- **Produção:** Nginx serve os arquivos frontend e encaminha `/api/` para o serviço systemd `supportdesk-backend`.

## Persistência

- `users` contém contas, e-mail único, hash de senha, perfil, status e associação opcional com loja.
- `supportdesk_records` armazena entidades operacionais tipadas em JSON, incluindo lojas, chamados, comentários, histórico, inventário, notas, configurações, auditoria e notificações.
- Anexos de notas e chamados são armazenados como entidades próprias (`note-attachments` e `ticket-attachments`); o conteúdo não é incluído nas respostas de listagem e só é retornado na leitura individual autorizada.
- A exclusão de um equipamento remove seus eventos de histórico na mesma transação, mas continua bloqueada quando o equipamento está vinculado a um chamado. A auditoria geral da exclusão é mantida.
- As operações CRUD do aplicativo são centralizadas na API; o frontend não abre conexão com MySQL.
- `backend/src/database/schema.sql` declara as tabelas. O aplicativo não aplica esse SQL automaticamente.
- `backend/src/database/development.sql` prepara somente o banco local de desenvolvimento; nunca usar em produção.

## Autenticação e autorização

O login valida e-mail/senha na API, que retorna um token de sessão. Senhas são armazenadas com hash; a API não devolve o hash. Rotas privadas exigem `Authorization: Bearer ...`. As sessões atuais ficam na memória do processo backend; reiniciar o serviço invalida as sessões existentes, mas não remove os dados MySQL. O servidor também verifica se a conta permanece ativa.

Perfis definidos: Administrador, Técnico e Solicitante. Permissões são verificadas na interface e, para as operações protegidas, novamente no backend. Administradores gerenciam cadastros e configurações; técnicos trabalham principalmente em chamados atribuídos, inventário e notas próprias; solicitantes trabalham nos próprios chamados e notas.

O endpoint de saúde `/api/health` confirma que a API responde. Não executa teste completo de autenticação ou de todas as consultas ao banco.

## Segurança operacional

- Helmet, CORS limitado à origem configurada, limites de requisição e limites específicos de autenticação.
- Credenciais MySQL e configurações de produção ficam em variáveis privadas na VPS.
- A API não expõe campos de senha nos objetos de usuário.
- Alterar a própria senha exige sessão e senha atual; sessões são invalidadas após a mudança e é necessário entrar novamente.
- O frontend e o backend usam HTTPS público através do Nginx; a API e MySQL permanecem acessíveis localmente na VPS.

## Arquivos relacionados

- Implantação: [implantacao-vps.md](implantacao-vps.md)
- Manual do usuário: [manual-usuario.md](manual-usuario.md)
- Desenvolvimento local: [../DEVELOPMENT.md](../DEVELOPMENT.md)
- Schema: `backend/src/database/schema.sql`
