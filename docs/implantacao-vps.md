# Implantação e operação da VPS

Este guia registra o fluxo conhecido da instalação Linux publicada. Os comandos devem ser executados por alguém autorizado na VPS. O repositório e os arquivos da VPS são distintos: alterações locais só entram em produção depois de publicadas no GitHub e atualizadas na VPS.

## Arquitetura publicada

- Domínio: `suportedrogaviva.com.br` (HTTPS gerenciado pelo Nginx/Certbot).
- Frontend compilado servido pelo Nginx a partir de `/var/www/supportdesk-pro/frontend`.
- Código clonado em `/var/www/supportdesk-pro/repository`.
- API Node.js/Express do backend na porta `3000`, gerenciada pelo serviço systemd `supportdesk-backend` e acessível localmente via Nginx em `/api/`.
- MySQL local na VPS, banco `supportdesk_pro_vps`, usuário da aplicação restrito ao host local. O frontend não conecta diretamente ao MySQL.

As senhas, tokens e configurações reais pertencem à VPS e não devem ser adicionados ao GitHub, a este documento, a capturas de tela ou a mensagens.

## Configuração de produção

O backend carrega variáveis de `backend/.env` pelo `dotenv`; o serviço systemd também precisa iniciar o backend no diretório do repositório e receber o ambiente de produção configurado na VPS. Antes de alterar o serviço, examine a configuração existente com `systemctl cat supportdesk-backend` e preserve caminhos e opções que já funcionam.

Variáveis esperadas no ambiente do backend:

| Variável | Uso |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Porta local da API, normalmente `3000` |
| `FRONTEND_URL` | Origem HTTPS do site, sem caminho de API |
| `DB_HOST`, `DB_PORT` | MySQL local da VPS (porta padrão `3306`) |
| `DB_NAME` | Banco de produção (`supportdesk_pro_vps`) |
| `DB_USER`, `DB_PASSWORD` | Credenciais privadas do MySQL |

Não copie valores secretos do `.env` em chamados ou documentação. Proteja o arquivo com permissões restritas ao usuário do serviço. O frontend de produção usa a mesma origem HTTPS para `/api`; não defina `VITE_API_URL` para o endereço local de desenvolvimento.

## Publicar uma versão

Antes da publicação, a alteração deve estar integrada à branch de produção (`main`). Na VPS, como uma conta autorizada:

```bash
cd /var/www/supportdesk-pro/repository
git status --short --branch
git pull --ff-only origin main

cd backend
npm ci
npm run build

cd ../frontend
npm ci
npm run build
```

Se qualquer comando falhar, pare e corrija a causa antes de substituir os arquivos ativos. Após os builds concluírem:

```bash
cp -a /var/www/supportdesk-pro/repository/frontend/dist/. /var/www/supportdesk-pro/frontend/
find /var/www/supportdesk-pro/frontend -type d -exec chmod 755 {} +
find /var/www/supportdesk-pro/frontend -type f -exec chmod 644 {} +
systemctl restart supportdesk-backend
systemctl is-active supportdesk-backend
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS https://suportedrogaviva.com.br/api/health
curl -I https://suportedrogaviva.com.br/
```

O resultado esperado é serviço `active`, health check com `success: true` e HTTP `200` na página principal. Em seguida, abra o site no navegador, atualize sem cache e faça um teste funcional adequado à alteração. Um health check confirma a API, mas não valida login nem todas as operações do sistema.

## Banco de dados e dados

O esquema de produção é `backend/src/database/schema.sql`, com usuários na tabela `users` e entidades do aplicativo na tabela `supportdesk_records` (JSON por tipo de entidade). A aplicação não executa migrações automaticamente; mudanças de esquema precisam de um plano explícito e cuidadoso. Não aplique `development.sql` nem os guias de testes à VPS.

Antes de atualizar código ou esquema, gere e confira um backup usando as políticas da VPS. Exemplo para gerar um dump consistente do banco MySQL:

```bash
umask 077
mysqldump --single-transaction --routines --triggers --host=127.0.0.1 --user=USUARIO_MYSQL --password supportdesk_pro_vps > /caminho/seguro/supportdesk_pro_vps-AAAA-MM-DD.sql
```

O cliente solicitará a senha. Substitua `USUARIO_MYSQL` e o caminho por valores existentes na VPS. Guarde o backup fora da raiz pública do Nginx, limite o acesso e teste periodicamente a restauração em ambiente isolado. Não coloque senha na linha de comando.

## Diagnóstico rápido

```bash
systemctl status supportdesk-backend --no-pager
journalctl -u supportdesk-backend -n 100 --no-pager
nginx -t
ss -lnt | grep ':3000'
curl -fsS http://127.0.0.1:3000/api/health
curl -I https://suportedrogaviva.com.br/
```

- **API indisponível:** confira estado e logs do serviço, ambiente do processo e conexão MySQL.
- **Usuários desconectados após manutenção:** reiniciar a API encerra as sessões em memória; entre novamente com a conta.
- **Página 403:** confira o `root` do Nginx, a existência de `index.html` e permissões de leitura/travessia nos diretórios.
- **Frontend abre, mas a API falha:** confira o bloco Nginx `/api/`, o backend local e a origem `FRONTEND_URL`.
- **Alterações antigas no navegador:** faça recarga sem cache e confirme se `frontend/dist` foi copiado para a raiz servida pelo Nginx.

Não imprima nem cole `.env`, tokens de sessão ou senhas ao compartilhar logs.

## Limites deste registro

O guia descreve os caminhos, domínio, porta, banco e nomes de serviço observados na implantação. Confirme a configuração atual na VPS antes de uma manutenção, especialmente unit file do systemd, configuração Nginx, política de backup e processo de rollback. Nenhum segredo da VPS foi inferido ou documentado.
