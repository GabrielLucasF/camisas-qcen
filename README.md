# 👕 Camisas do QCEN — Gerenciador de Pedidos

Aplicativo desenvolvido sob medida para gerenciar os pedidos de camisas, tamanhos e pagamentos com extrema rapidez, pronto para ser hospedado na **Vercel** e testado **localmente**.

---

## 🚀 Como testar localmente

Na pasta do projeto:

```bash
# 1. Caso use nvm, garanta Node 20+:
nvm use 20

# 2. Inicie o servidor de desenvolvimento:
pnpm dev
# ou
npm run dev
```

Abra no navegador (ou pelo celular no mesmo Wi-Fi via IP local):
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚡ Recursos Principais

1. **Dados Iniciais Pré-Carregados**: Todas as 19 anotações originais do bloco de notas já vêm cadastradas automaticamente.
2. **Resumo Visual por Tamanho**: Cards interativos com total de peças por tamanho (PP, P, M, G, GG, etc.) e porcentagem.
   - Toque em qualquer tamanho para filtrar a lista instantaneamente!
3. **Controle de Pagamentos**:
   - Status: **Pendente**, **Pago Metade** e **Pago Completo**.
   - 1 clique no status do pedido alterna diretamente o pagamento.
   - Cálculo automático do valor arrecadado e valor a receber.
4. **Adicionar Novos Pedidos**:
   - Botão rápido no topo ou botão flutuante no celular (+).
   - Suporte a múltiplos tamanhos para a mesma pessoa (ex: Luís que pediu G e M).
   - Campo para observações.
5. **Compartilhar no WhatsApp**:
   - Gera automaticamente o texto resumido com contagem de tamanhos e lista de pendências para colar direto no grupo com 1 clique.
6. **Configurações & Backup**:
   - Defina o valor unitário da camisa (padrão: R$ 35,00).
   - Exportação e restauração de backup em JSON.
   - Download de planilha (Excel / CSV).

---

## 🌐 Como subir para a Vercel quando quiser

Quando terminar os testes locais e quiser colocar no ar:

### Opção 1: Via Vercel CLI (Super rápido)
```bash
npx vercel
```
Siga as instruções rápidas no terminal e seu app estará no ar com link público.

### Opção 2: Via GitHub / Dashboard da Vercel
1. Crie um repositório no seu GitHub e suba esta pasta (`git push`).
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Importe o repositório e clique em **Deploy** (o Next.js é detectado com zero configuração).
