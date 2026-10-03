# Roadmap de documentação e evolução

O checklist inicial foi arquivado como referência histórica; suas marcações refletiam uma etapa anterior do projeto. Este documento lista somente próximos passos conhecidos, sem prometer prazo.

## Conhecido

- [ ] Implementar recuperação segura de senha. Até lá, o link na tela de login não executa redefinição automática; administradores tratam o acesso.
- [ ] Avaliar divisão sob demanda dos maiores chunks do frontend. O build atual termina com um aviso de tamanho.
- [ ] Manter atualizados o [manual](manual-usuario.md), o [guia da VPS](implantacao-vps.md) e os testes após mudanças funcionais ou operacionais.

## Processo para novas solicitações

Registrar necessidade e responsável, definir critérios de aceite, implementar e revisar, executar as verificações relevantes e atualizar a documentação antes da publicação. Confirmar backup e plano de retorno quando a mudança tocar produção ou o banco.
