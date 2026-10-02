# Testes de integração de Categorias

Este procedimento usa exclusivamente o banco descartável `supportdesk_pro_categories_test` em MySQL local. Não use `supportdesk_pro_dev` nem produção. A suíte não cria banco ou aplica schema automaticamente.

## Pré-requisitos e bloqueios

- MySQL local acessível em `127.0.0.1` e permissão local para criar um banco novo.
- Dependências do backend instaladas.
- O banco `supportdesk_pro_categories_test` ainda não existe. O comando de criação abaixo não usa `IF NOT EXISTS`; se ele falhar porque o nome já existe, pare e não reutilize o banco.
- Uma senha MySQL local exclusiva para esse ambiente, fornecida sem incluí-la em comandos compartilhados.
- Um administrador de teste exclusivo: e-mail terminado em `@supportdesk.test` e senha forte nova. Não reutilize credenciais de desenvolvimento compartilhado ou produção.
- Backend e suíte iniciados com a mesma configuração de host, porta e banco. O endpoint local `/api/test-config` confirma, por uma consulta somente de leitura feita pelo pool do backend, o banco/porta ativos e reporta somente valores não secretos; a suíte compara esses valores antes de sua própria primeira consulta SQL.

## Criar o banco vazio

No PowerShell, a partir da pasta `backend`, substitua `USUARIO_MYSQL_LOCAL` pelo usuário administrativo local. `--password` solicita a senha interativamente.

```powershell
Set-Location C:\Projetos\SupportDesk-Pro\backend
mysql --host=127.0.0.1 --port=3306 --user=USUARIO_MYSQL_LOCAL --password --execute="CREATE DATABASE supportdesk_pro_categories_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Se o comando indicar que o banco já existe ou qualquer outro erro, interrompa. Não use `CREATE DATABASE IF NOT EXISTS` e não aplique o schema a um banco preexistente.

## Confirmar que está vazio e aplicar o schema

Antes de aplicar o schema, confirme que a conexão é local e o banco selecionado tem o nome dedicado:

```powershell
mysql --host=127.0.0.1 --port=3306 --user=USUARIO_MYSQL_LOCAL --password --database=supportdesk_pro_categories_test --execute="SELECT DATABASE() AS active_database, @@hostname AS mysql_host, @@port AS mysql_port; SELECT COUNT(*) AS existing_tables FROM information_schema.tables WHERE table_schema = DATABASE();"
```

Prossiga somente se o banco ativo for exatamente `supportdesk_pro_categories_test`, o host for a instância local esperada e `existing_tables` for `0`. Se houver qualquer tabela, pare; não tente limpá-la.

Aplique o schema declarado apenas ao banco dedicado recém-criado:

```powershell
Get-Content -Raw .\src\database\schema.sql | mysql --host=127.0.0.1 --port=3306 --user=USUARIO_MYSQL_LOCAL --password --database=supportdesk_pro_categories_test
```

`schema.sql` cria as estruturas `users` e `supportdesk_records`, sem inserir linhas. Não use `development.sql`: esse arquivo pertence ao fluxo de `supportdesk_pro_dev`.

Confira o schema e as contagens, ainda sem provisionar o administrador:

```powershell
mysql --host=127.0.0.1 --port=3306 --user=USUARIO_MYSQL_LOCAL --password --database=supportdesk_pro_categories_test --execute="SELECT DATABASE() AS active_database, @@hostname AS mysql_host, @@port AS mysql_port; SELECT COUNT(*) AS user_count FROM users; SELECT COUNT(*) AS record_count FROM supportdesk_records; SELECT ENGINE FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'supportdesk_records'; SHOW COLUMNS FROM users LIKE 'role';"
```

O esperado é: banco e host locais corretos, `user_count = 0`, `record_count = 0`, engine `InnoDB` e `users.role` com o ENUM declarado em `schema.sql`. Se algum resultado divergir, pare e não execute o provisionador nem a suíte.

## Provisionar somente o administrador de teste

Configure, sem imprimir ou compartilhar a senha, estas variáveis no terminal que executará o provisionador:

```powershell
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '3306'
$env:DB_NAME = 'supportdesk_pro_categories_test'
$env:SUPPORTDESK_LOCAL_TESTS = '1'
$env:SUPPORTDESK_CATEGORIES_TESTS = '1'
$env:DEV_DB_CONFIRM = 'I_UNDERSTAND_LOCAL_DATABASE_ONLY'
$env:NODE_ENV = 'development'
$env:TEST_ADMIN_NAME = 'Administrador de testes local'
$env:TEST_ADMIN_EMAIL = 'integration-admin@supportdesk.test'
# Configure TEST_ADMIN_PASSWORD localmente com uma senha forte e exclusiva; não a cole em logs ou mensagens.
```

Com as variáveis confirmadas, execute:

```powershell
npm run test:create-admin
```

No modo dedicado o script exige o banco, host e flags exatos, rejeita `supportdesk_pro_dev` e produção, e lê apenas `TEST_ADMIN_*`. Se o e-mail de teste já existir, o script não altera a conta; em um banco recém-criado, confirme que essa conta foi criada antes de seguir. O provisionador não importa usuários nem dados históricos.

## Iniciar backend e suíte com configurações idênticas

Abra um terminal PowerShell para o backend e configure nele os mesmos valores de DB e confirmação acima. Acrescente:

```powershell
$env:PORT = '3000'
$env:LOCAL_TEST_API_URL = 'http://127.0.0.1:3000'
```

Inicie o backend:

```powershell
npm run dev
```

O modo dedicado valida as confirmações antes de criar o pool, recusa qualquer banco diferente do nome dedicado e vincula a API a `127.0.0.1`. O endpoint `http://127.0.0.1:3000/api/test-config` existe somente nesse modo, faz apenas uma consulta de leitura pelo pool do backend e não expõe credenciais. Confirme que host, porta configurada, banco configurado e banco/porta ativos retornados coincidem com este guia.

Abra um segundo terminal PowerShell na pasta `backend`, defina novamente os mesmos valores de DB e confirmação e configure também:

```powershell
$env:LOCAL_TEST_API_URL = 'http://127.0.0.1:3000'
$env:TEST_ADMIN_EMAIL = 'integration-admin@supportdesk.test'
# Configure TEST_ADMIN_PASSWORD com a mesma senha local exclusiva, sem mostrá-la.
```

Antes de executar, repita a conferência de leitura: banco ativo dedicado, host/porta locais, uma conta em `users` (o administrador de teste), zero linhas em `supportdesk_records` e engine InnoDB. Pare se houver registros inesperados.

Somente depois da confirmação manual e da conferência acima, execute:

```powershell
npm run test:integration
```

A suíte valida as flags e o banco exato antes de qualquer consulta. Primeiro consulta `/api/test-config`, que verifica por `SELECT DATABASE(), @@port` a conexão já estritamente configurada do backend; em seguida compara banco/porta ativos e a configuração com a sua própria. Só depois a suíte abre sua conexão e executa as consultas de pré-validação. Se a URL local não corresponder ou o backend não estiver no modo dedicado, o teste falha antes das consultas próprias de schema/dados e antes de qualquer escrita.

## Cobertura e limpeza

A suíte cria categorias, usuários, loja, inventário, chamados, comentários, notas e anexo com IDs próprios e nomes/e-mails temporários. Atualizações SQL de categoria histórica são restritas ao ID de chamado criado pela própria suíte. A limpeza usa esses IDs e remove chamados antes das categorias vinculadas. O cleanup é best effort; após os testes, confira as contagens e inspecione qualquer resíduo. Não execute `DROP DATABASE` como limpeza automática.

Os casos de Categorias verificam CRUD, nome duplicado sob concorrência, edição de chamados com categorias inativas/ausentes, preservação do texto histórico, vínculos formatados com caixa/espaços/tabulações/quebras de linha, bloqueio de exclusão/renomeação vinculada e concorrência entre criar chamado e excluir categoria.
