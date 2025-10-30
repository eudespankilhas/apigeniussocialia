# Implementação do Supabase

Este documento descreve a implementação do Supabase no projeto NexusPay Dashboard.

## Configuração

O Supabase foi configurado para gerenciar dados de transações e assinaturas. A implementação inclui:

1. Cliente Supabase configurado em `src/lib/supabaseClient.ts`
2. Tipos TypeScript em `src/types/supabase.ts`
3. Scripts de inicialização e teste em `scripts/`

## Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias:

```
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
```

## Estrutura do Banco de Dados

### Tabela: transactions

| Coluna            | Tipo      | Descrição                           |
|-------------------|-----------|-------------------------------------|
| id                | uuid      | Identificador único da transação    |
| user_id           | text      | ID do usuário                       |
| amount            | integer   | Valor da transação                  |
| currency          | text      | Moeda da transação                  |
| status            | text      | Status da transação                 |
| payment_intent_id | text      | ID da intenção de pagamento (Stripe)|
| created_at        | timestamp | Data de criação                     |
| updated_at        | timestamp | Data de atualização                 |

### Tabela: subscriptions

| Coluna           | Tipo      | Descrição                           |
|------------------|-----------|-------------------------------------|
| id               | uuid      | Identificador único da assinatura   |
| user_id          | text      | ID do usuário                       |
| price_id         | text      | ID do preço (Stripe)                |
| subscription_id  | text      | ID da assinatura (Stripe)           |
| status           | text      | Status da assinatura                |
| created_at       | timestamp | Data de criação                     |
| updated_at       | timestamp | Data de atualização                 |

## Scripts

### Inicialização das Tabelas

Para criar as tabelas necessárias no Supabase:

```bash
npm run supabase:init
```

### Teste de Conexão

Para testar a conexão com o Supabase:

```bash
npm run supabase:test
```

## Serviços Implementados

### Transações

- `createCheckoutSession`: Cria uma sessão de checkout no Stripe
- `recordTransaction`: Registra uma transação no Supabase
- `getUserTransactions`: Obtém o histórico de transações de um usuário

### Assinaturas

- `createSubscription`: Cria uma assinatura no Stripe e Supabase
- `getUserSubscriptions`: Obtém as assinaturas de um usuário
- `cancelSubscription`: Cancela uma assinatura
- `getSubscriptionDetails`: Obtém detalhes de uma assinatura específica

## Uso

Exemplo de como usar os serviços:

```javascript
import { createSubscription, getUserSubscriptions } from './services/subscriptions';
import { recordTransaction, getUserTransactions } from './services/payments';

// Criar uma assinatura
const { subscription, data } = await createSubscription('user123', 'price_123');

// Obter assinaturas de um usuário
const subscriptions = await getUserSubscriptions('user123');

// Registrar uma transação
const transaction = await recordTransaction('user123', 1000, 'BRL', 'succeeded', 'pi_123');

// Obter transações de um usuário
const transactions = await getUserTransactions('user123');
```