# Ambiente local de desenvolvimento

Este guia prepara um MySQL separado para testes funcionais locais. Não use as instruções para produção. O projeto não copia registros de `localStorage` nem inclui dados de demonstração.

## Estrutura MySQL requerida

O backend compartilhado usa duas tabelas MySQL:

- `users`: `id`, `name`, `email`, `password`, `phone`, `department`, `role`, `store_id`, `status`, `created_at`, `must_change_password`. `email` é único; há índices para loja, status e perfil.
- `supportdesk_records`: `id`, `entity_type`, `owner_user_id`, `payload` (JSON), `created_at`, `updated_at`. Os índices atendem consultas por tipo/ID e tipo/proprietário. Lojas, chamados, comentários, histórico, inventário, movimentações, notas, anexos, configurações, auditoria e notificações são registros tipados nessa tabela genérica.

O esquema correspondente está em `backend/src/database/development.sql` e deriva do esquema atual em `backend/src/database/schema.sql`. Ele cria somente o banco local `supportdesk_pro_dev` e as duas tabelas, sem inserir linhas. Usa `IF NOT EXISTS`: não atualiza uma tabela que já exista com definição diferente. Confira qualquer banco local existente antes de aplicar o arquivo. Não o execute apontando para produção.

## Pré-requisitos e configuração

Use Node.js 20.19 ou mais recente na linha 20, ou Node.js 22.12 ou mais recente na linha 22, npm e MySQL 8 local. Essa versão mínima atende ao Vite usado pelo frontend. As dependências do projeto devem estar instaladas (`npm install` em `backend` e `frontend`, se necessário).

1. Inicie uma instância MySQL local e, com uma conta administrativa local, aplique manualmente o script de desenvolvimento:

   ```powershell
   cd C:\Projetos\SupportDesk-Pro
   mysql --default-character-set=utf8mb4 --host=127.0.0.1 --port=3306 --user=root --password --execute="SOURCE backend/src/database/development.sql"
   ```

   O cliente pedirá a senha interativamente. O SQL configura a conta local `supportdesk_dev` com uma senha placeholder; antes de executar, substitua `CHANGE_ME_LOCAL_ONLY` no SQL por uma senha local escolhida por você. Use a mesma senha em `backend/.env`. O arquivo SQL não é executado automaticamente pelo app.

2. Crie `backend/.env` a partir de `backend/.env.example`, sem sobrescrever um `.env` existente:

   ```powershell
   if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
   ```

   Edite localmente `DB_PASSWORD` para corresponder à senha escolhida; mantenha `DB_HOST=127.0.0.1`, `DB_NAME=supportdesk_pro_dev`, `SUPPORTDESK_LOCAL_TESTS=1` e `DEV_DB_CONFIRM=I_UNDERSTAND_LOCAL_DATABASE_ONLY`. Defina também um nome/e-mail local e uma senha exclusiva e forte em `DEV_ADMIN_*`. Não compartilhe o `.env`.

3. Opcionalmente crie `frontend/.env.local` com base em `frontend/.env.example`, sem sobrescrever arquivo existente:

   ```powershell
   if (-not (Test-Path frontend\.env.local)) { Copy-Item frontend\.env.example frontend\.env.local }
   ```

   `VITE_API_URL` deve permanecer apontando para `http://127.0.0.1:3000`.

Fora do modo de integração, o backend local preserva a configuração de `supportdesk_pro_dev`. Os testes de integração de Categorias têm guardas mais restritas e só aceitam o banco descartável `supportdesk_pro_categories_test`; siga exclusivamente `backend/tests/CATEGORIES_INTEGRATION.md` para prepará-lo e executá-los. Não aponte a suíte de integração para `supportdesk_pro_dev`.

## Criar o administrador local

Com o banco local configurado, execute uma vez no PowerShell:

```powershell
Set-Location C:\Projetos\SupportDesk-Pro\backend
npm run dev:create-admin
```

O script cria apenas o administrador definido em `DEV_ADMIN_*`; se o e-mail já existir, não altera essa conta. A senha é validada e armazenada com hash. O seed antigo de contas fictícias foi desativado.

## Iniciar a aplicação

Abra dois terminais PowerShell:

```powershell
Set-Location C:\Projetos\SupportDesk-Pro\backend
npm run dev
```

```powershell
Set-Location C:\Projetos\SupportDesk-Pro\frontend
npm run dev -- --host 127.0.0.1
```

Abra o endereço local que o Vite informar (normalmente `http://127.0.0.1:5173`) e entre com o administrador local. Este passo inicia a aplicação; os testes de integração de Categorias são uma atividade separada e usam somente o banco descartável descrito no guia dedicado.

## Build e testes

> **Atualização para Categorias:** a suíte de integração não deve usar `supportdesk_pro_dev`. Use somente [o guia dedicado de testes de Categorias](backend/tests/CATEGORIES_INTEGRATION.md), que exige o banco descartável `supportdesk_pro_categories_test`, valida a configuração do backend e inclui as confirmações locais.

Builds, sem acesso ao banco:

```powershell
Set-Location C:\Projetos\SupportDesk-Pro\backend
npm run build
```

```powershell
Set-Location C:\Projetos\SupportDesk-Pro\frontend
npm run build
```

Os testes de integração de Categorias só podem ser iniciados após preparar manualmente o banco descartável e provisionar as credenciais exclusivas descritas em `backend/tests/CATEGORIES_INTEGRATION.md`:

```powershell
Set-Location C:\Projetos\SupportDesk-Pro\backend
npm run test:integration
```

Não execute essa suíte contra `supportdesk_pro_dev`. Ela aceita somente `supportdesk_pro_categories_test`, compara a configuração de API e banco antes da primeira consulta e exige as confirmações explícitas documentadas no guia dedicado. O cleanup é best effort, portanto mantenha esse banco descartável.

## Estado de validação

Os builds podem ser verificados sem banco. CRUD/permissões só podem ser declarados aprovados após a configuração manual do MySQL de desenvolvimento e a execução de `npm run test:integration`; nenhum SQL é executado por este guia ou durante o build.
