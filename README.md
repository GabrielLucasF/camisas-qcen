# 👕 QCEN — Gerenciador de Pedidos de Camisas

<div align="center">

![QCEN Logo](public/qcen-logo.png)

### **🔥 QUE COMECE EM NÓS — GOVERNADOR VALADARES 🔥**

*Aplicação moderna e ultra-rápida desenvolvida para gerenciamento de pedidos de camisas, contagem de tamanhos e controle financeiro do movimento **QCEN**.*

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://camisas-qcen.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

🌐 **Acesse a aplicação no ar:**  
👉 **[https://camisas-qcen.vercel.app](https://camisas-qcen.vercel.app)** 👈

</div>

---

## ⚡ Sobre o Projeto

O **QCEN (Que Comece Em Nós)** é um movimento missionário de jovens cristãos de Governador Valadares/MG, levando o Evangelho de Jesus às ruas, praças e comunidades.

Para a confecção das camisas oficiais do movimento, esta aplicação foi criada com foco em **agilidade móvel**, permitindo registrar pedidos rapidamente, controlar quem já pagou e gerar relatórios instantâneos para compartilhamento no grupo do WhatsApp da liderança.

---

## ✨ Funcionalidades Principais

- 📊 **Resumo Visual por Tamanho**:
  - Contagem em tempo real de cada peça (**PP, P, M, G, GG, XG, XXG, Infantil, A definir**) com porcentagens.
  - **Filtro com 1 clique**: toque no card de qualquer tamanho para visualizar instantaneamente quem pediu aquela numeração.

- 💰 **Controle Financeiro & Status de Pagamento**:
  - Status categorizados: **Pago Completo**, **Pago Metade (50%)** e **Pendente**.
  - **Alternância rápida com 1 toque**: clique no botão de status do pedido na lista para avançar o pagamento (*Pendente* → *Metade* → *Completo*).
  - Cálculo automático: **Total Arrecadado**, **Falta Receber** e **Total Previsto** (configurado por padrão: R$ 70,00 a peça e R$ 35,00 a metade).

- ➕ **Adição & Edição Ágil (+)**:
  - Botão flutuante (FAB) desenhado especificamente para uso confortável com uma só mão no celular.
  - Suporte a múltiplos tamanhos para a mesma pessoa em um só pedido (ex: Luís que pediu G e M).
  - Campo opcional de observações.

- 📱 **Compartilhamento no WhatsApp**:
  - Gera automaticamente um relatório limpo e formatado com a contagem de cada tamanho, totais financeiros e a lista de pendências/metade para colar direto no grupo com 1 botão.

- 💾 **Backup & Exportação**:
  - Exportação e importação de backup em arquivo JSON.
  - Download imediato da lista de pedidos em formato de planilha (**Excel / CSV**).
  - Persistência automática no navegador (`localStorage`).

- 🎨 **Design & Identidade Visual Oficial**:
  - Tipografia de alto impacto com fonte display **Anton** e **Inter**.
  - Paleta em azul noturno (`#090a10`), azul royal elétrico e toques de chamas.
  - Logo oficial do QCEN integrada.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Biblioteca de UI**: [React 19](https://react.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Linguagem**: [TypeScript 5](https://www.typescriptlang.org/)
- **Hospedagem & CI/CD**: [Vercel](https://vercel.com/)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js `>= 20.9.0` (recomendado: Node 20.20.2)
- pnpm ou npm

```bash
# 1. Clonar o repositório
git clone https://github.com/GabrielLucasF/camisas-qcen.git
cd camisas-qcen

# 2. Carregar a versão correta do Node (via nvm)
nvm use

# 3. Instalar as dependências
pnpm install
# ou: npm install

# 4. Iniciar o servidor de desenvolvimento
pnpm dev
# ou: npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🌐 Deploy na Vercel

O projeto está configurado para deploy automático na Vercel:

1. Cada push na branch `main` dispara uma nova versão de produção automaticamente.
2. Pode também ser publicado manualmente via Vercel CLI:
```bash
npx vercel --prod
```

---

## 📌 Redes do QCEN

- **Instagram**: [@comeceemnos](https://www.instagram.com/comeceemnos/)
- **Website Oficial**: [qcengv.lovable.app](https://qcengv.lovable.app/)

---

<div align="center">
  <sub>"O avivamento não começa em um palco. Começa em nós."</sub>
</div>
