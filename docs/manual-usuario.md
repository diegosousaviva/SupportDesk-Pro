# Manual do usuário

## Acessar o sistema

1. Abra [https://suportedrogaviva.com.br](https://suportedrogaviva.com.br) em um navegador atualizado.
2. Informe o e-mail e a senha da sua conta. O acesso é individual.
3. Se o administrador tiver marcado sua conta para troca obrigatória, defina uma nova senha antes de continuar.
4. Use **Lembrar de mim** somente em um dispositivo pessoal protegido. Em computador compartilhado, encerre a sessão ao terminar.

O link **Esqueci minha senha** está visível, mas a recuperação automática ainda não foi implementada. Para redefinir o acesso, solicite ajuda a um administrador.

## Navegação

O menu lateral reúne os módulos disponíveis para o seu perfil:

- **Dashboard**: indicadores e gráficos de chamados; filtros por período e loja.
- **Chamados**: abrir, consultar e acompanhar solicitações, comentários, responsáveis, prioridade, status e histórico.
- **Inventário**: consultar equipamentos e seus dados; algumas ações dependem do perfil.
- **Notas**: criar e organizar notas pessoais ou compartilhadas conforme as permissões.
- **Usuários**: administrar contas e perfis (administradores).
- **Categorias**: manter categorias usadas nos chamados (administradores).
- **Lojas**: manter lojas e consultar informações associadas (administradores; técnicos têm acesso de consulta).
- **Relatórios**: consultar indicadores e, onde disponível, exportar dados para PDF ou Excel.
- **Configurações**: preferências do sistema, aparência, notificações e segurança, conforme o perfil.

Os itens do menu variam conforme as permissões da conta. Se um módulo não aparecer ou uma operação for recusada, peça ao administrador para conferir seu perfil.

## Perfis

- **Administrador**: administra usuários, chamados, categorias, lojas, inventário, relatórios e configurações.
- **Técnico**: trabalha nos chamados atribuídos, atualiza status e comentários, consulta lojas, edita informações de inventário e gerencia as próprias notas.
- **Solicitante**: abre e acompanha os próprios chamados, comenta e gerencia as próprias notas.

O acesso também é validado pela API; esconder uma opção na tela não substitui as permissões do servidor.

## Operações comuns

### Abrir e acompanhar um chamado

1. Entre em **Chamados** e escolha a opção de criar chamado.
2. Preencha as informações solicitadas, selecione categoria e loja quando aplicável e salve.
3. Abra o chamado na lista para ver detalhes, histórico e comentários.
4. Adicione informações complementares pelos comentários. Técnicos e administradores podem atualizar o andamento conforme suas permissões.

### Administrar usuários

1. Um administrador abre **Usuários** e escolhe criar ou editar.
2. Informe nome, e-mail, perfil, status e demais dados solicitados. Associe uma loja quando necessário.
3. Ao criar uma conta, forneça a senha inicial ao usuário por um canal privado e oriente-o a trocá-la quando solicitado.
4. Inative contas que não devem mais acessar o sistema. Excluir é uma ação permanente e deve ser usada com cuidado.

### Alterar a própria senha

Abra a seção de segurança/configurações da conta e use a opção de alterar senha. O formulário pede a senha atual e a nova senha. Após a troca, entre novamente usando a senha nova.

### Filtrar o dashboard e relatórios

Use os filtros de período e loja disponíveis na tela. Os indicadores refletem os dados e o intervalo selecionados. Exportações podem conter dados operacionais; armazene os arquivos com o mesmo cuidado aplicado aos dados do sistema.

## Boas práticas

- Use uma conta individual e não compartilhe credenciais.
- Use senha forte e diferente de outras contas.
- Confira loja, responsável, categoria e status antes de salvar registros.
- Evite registrar senhas, dados pessoais desnecessários ou segredos nos comentários e notas.
- Relate falhas ao administrador com o endereço da tela e horário aproximado; não envie sua senha.

## Ajuda e recuperação de acesso

O link de recuperação de senha é somente visual por enquanto. Um administrador deve localizar a conta e redefinir a senha pelo procedimento operacional aprovado. A documentação não publica senhas nem comandos contendo segredos.
