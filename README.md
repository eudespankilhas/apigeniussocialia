# NexusPay IA Dashboard

Bem-vindo ao NexusPay IA, uma plataforma global de pagamentos completa e totalmente funcional, construída com as mais modernas tecnologias de frontend e inteligência artificial.

**Repositório Oficial:** [https://github.com/audiopank/nexuspay-ia](https://github.com/audiopank/nexuspay-ia)

---

## ✨ Funcionalidades Principais

*   **Dashboard Interativo:** Visualização em tempo real de métricas de vendas, transações e receita recorrente, com personalização de widgets.
*   **Análise de Risco com IA:** Transações são analisadas automaticamente pelo Gemini para identificar e justificar níveis de risco.
*   **Agentes de IA Proativos:**
    *   **Agente de Onboarding:** Guia novos usuários na configuração inicial da conta.
    *   **Agente NexusPay:** Um assistente para executar ações como criar produtos, gerar links de pagamento e consultar dados.
    *   **Agente de Integrações:** Ajuda a conectar e gerenciar integrações com outras plataformas.
*   **Geração de Conteúdo com IA:** Crie descrições e imagens de produtos de alta qualidade usando o Gemini e o Imagen.
*   **Gerenciamento Completo:** Módulos dedicados para Transações, Produtos, Assinaturas, Afiliados, Links de Pagamento, Webhooks e mais.
*   **Portal do Afiliado:** Uma área exclusiva para afiliados acompanharem seu desempenho, gerarem links e acessarem materiais de marketing.
*   **Busca Global Inteligente:** Pesquise em todo o painel com histórico e sugestões.
*   **Design Moderno e Responsivo:** Interface dark-mode construída com Tailwind CSS, otimizada para todos os dispositivos.
*   **Alta Performance:** Virtualização de listas longas (transações e afiliados) para uma experiência de usuário fluida.
*   **Segurança Reforçada:**
    *   **Autenticação de Dois Fatores (2FA) Obrigatória:** Camada extra de segurança para todas as contas.
    *   **Log de Auditoria Completo:** Rastreamento detalhado de todas as ações importantes realizadas na conta.
    *   **Gerenciamento de Dados (LGPD):** Ferramentas para exportar dados e garantir conformidade.
*   **Mobile-First com PWA:**
    *   **Progressive Web App:** Instale o NexusPay em seu desktop ou celular para uma experiência nativa.
    *   **Funcionalidade Offline:** Acesso à plataforma mesmo sem conexão à internet.
    *   **Notificações Push:** Receba alertas importantes diretamente no seu dispositivo.
*   **Escalabilidade e API:**
    *   **API Pública e Webhooks:** Integração robusta com sistemas externos.
    *   **SDKs para Desenvolvedores:** Bibliotecas para facilitar a integração.

## 🚀 Como Executar

Para rodar este projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/audiopank/nexuspay-ia.git
    cd nexuspay-ia
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure sua API Key:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione sua chave da API do Google Gemini. No contexto do AI Studio, esta variável já é injetada, mas para rodar localmente, você precisará configurá-la.

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

    Abra [http://localhost:5173](http://localhost:5173) no seu navegador para ver o projeto.

## 🛠️ Tecnologias Utilizadas

*   **Framework:** React 18
*   **Build Tool:** Vite
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS
*   **Inteligência Artificial:** Google Gemini API (gemini-2.5-flash, gemini-2.5-pro, imagen-4.0)
*   **Tabelas e Virtualização:** TanStack Table & TanStack Virtual
*   **Ícones:** Lucide React
