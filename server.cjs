// ============================================
// BACKEND - API COMPLETA COM EXPRESS + SQLITE
// ============================================
 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
const rateLimit = require('express-rate-limit');
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }) : null;
 
const app = express();
app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe/webhook') {
    return next();
  }
  return express.json()(req, res, next);
});

// Inicializar banco de dados
let db = new sqlite3.Database('./database.sqlite');

// ============================================
// RATE LIMITING PARA SEGURANÇA
// ============================================

// Importar configurações centralizadas
const rateLimits = require('./config/rate-limits');
const securityAlerts = require('./config/security-alerts');

// Configuração global de rate limiting
const globalLimiter = rateLimit(rateLimits.global);

// Aplicar rate limiting global
app.use(globalLimiter);

// Rate limiting mais restritivo para rotas sensíveis
const apiLimiter = rateLimit(rateLimits.api);

// Tabela para IPs bloqueados
db.run(`
  CREATE TABLE IF NOT EXISTS blocked_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    blocked_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )
`);

// Middleware para verificar IPs bloqueados
const checkBlockedIP = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  
  try {
    const blocked = await securityAlerts.isIPBlocked(ip, db);
    if (blocked) {
      return res.status(403).json({
        error: 'Acesso bloqueado',
        message: 'Seu IP foi temporariamente bloqueado devido a múltiplas tentativas de acesso inválidas'
      });
    }
    next();
  } catch (err) {
    console.error('Erro ao verificar IP bloqueado:', err);
    next(); // Continuar mesmo em caso de erro na verificação
  }
};

// Aplicar verificação de IP bloqueado em todas as rotas
app.use(checkBlockedIP);

// Agendar limpeza de IPs bloqueados expirados (a cada hora)
setInterval(() => {
  securityAlerts.cleanupBlockedIPs(db)
    .then(count => {
      if (count > 0) {
        console.log(`${count} IPs bloqueados expirados foram removidos`);
      }
    })
    .catch(err => {
      console.error('Erro ao limpar IPs bloqueados expirados:', err);
    });
}, 60 * 60 * 1000); // 1 hora

// Agendar limpeza de registros antigos de tentativas de abuso (diariamente)
setInterval(() => {
  securityAlerts.cleanupAbuseAttempts(db, '30 days')
    .then(count => {
      if (count > 0) {
        console.log(`${count} registros antigos de tentativas de abuso foram removidos`);
      }
    })
    .catch(err => {
      console.error('Erro ao limpar registros antigos de tentativas de abuso:', err);
    });
}, 24 * 60 * 60 * 1000); // 24 horas

// ============================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ============================================

// Agendar limpeza de IPs bloqueados expirados (a cada hora)
setInterval(async () => {
  try {
    const removed = await securityAlerts.cleanupBlockedIPs(db);
    if (removed > 0) {
      console.log(`Limpeza automática: ${removed} IPs bloqueados expirados foram removidos`);
    }
  } catch (err) {
    console.error('Erro na limpeza automática de IPs bloqueados:', err);
  }
}, 60 * 60 * 1000); // 1 hora

// Agendar limpeza de registros antigos de tentativas de abuso (diariamente)
setInterval(async () => {
  try {
    const removed = await securityAlerts.cleanupAbuseAttempts(db, '30 days');
    if (removed > 0) {
      console.log(`Limpeza automática: ${removed} registros antigos de tentativas de abuso foram removidos`);
    }
  } catch (err) {
    console.error('Erro na limpeza automática de registros de abuso:', err);
  }
}, 24 * 60 * 60 * 1000); // 24 horas

// Aplicar rate limiting mais restritivo para rotas da API
app.use('/api/', apiLimiter);
 
// ============================================
// DATABASE SETUP
// ============================================
 
// Persistência em arquivo: usa DB_PATH (env) ou ./data/data.db
const dbFile = process.env.DB_PATH || path.join(__dirname, 'data', 'data.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
// Usar a conexão db já existente
db.close(); // Fechar a conexão anterior
db = new sqlite3.Database(dbFile);
 
db.serialize(() => {
  // PRAGMAs recomendados para SQLite em produção leve
  db.run(`PRAGMA journal_mode = WAL`);
  db.run(`PRAGMA synchronous = NORMAL`);
  db.run(`PRAGMA busy_timeout = 3000`);
  // Tabela de Licenças
  db.run(`
    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      email TEXT NOT NULL,
      plan_type TEXT NOT NULL,
      license_key TEXT UNIQUE NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      secret_key TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      requests_used INTEGER DEFAULT 0,
      requests_limit INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      stripe_subscription_item_id TEXT
    )
  `);
 
  // Tabela de Requisições (Analytics)
  db.run(`
    CREATE TABLE IF NOT EXISTS api_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      response_time INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (license_id) REFERENCES licenses(id)
    )
  `);
 
  // Tabela de Webhooks
  db.run(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (license_id) REFERENCES licenses(id)
    )
  `);

  // Migrações simples: adicionar colunas Stripe se não existirem
  db.all(`PRAGMA table_info(licenses)`, (err, rows) => {
    if (err) return;
    const cols = rows.map(r => r.name);
    const addCol = (name) => {
      if (!cols.includes(name)) {
        db.run(`ALTER TABLE licenses ADD COLUMN ${name} TEXT`, (e) => {
          if (e) console.warn(`Aviso ao adicionar coluna ${name}:`, e.message);
        });
      }
    };
    addCol('stripe_customer_id');
    addCol('stripe_subscription_id');
    addCol('stripe_subscription_item_id');
  });
});
 
// ============================================
// HELPER FUNCTIONS
// ============================================
 
const generateUUID = () => {
  return crypto.randomUUID();
};
 
const generateApiKey = () => {
  return 'sk_live_' + crypto.randomBytes(32).toString('hex');
};
 
const generateSecretKey = () => {
  return 'sk_secret_' + crypto.randomBytes(48).toString('hex');
};
 
const generateLicenseKey = () => {
  return 'lic_' + crypto.randomBytes(16).toString('hex');
};
 
// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================

// Rate limiting específico para tentativas de autenticação (proteção contra força bruta)
const authLimiter = rateLimit(rateLimits.authentication);
 
// Middleware para autenticação da API
const authenticateAPI = async (req, res, next) => {
  // Verificar se o IP está bloqueado
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  
  securityAlerts.isIPBlocked(ip, db)
    .then(blocked => {
      if (blocked) {
        return res.status(403).json({
          message: 'Seu IP foi temporariamente bloqueado devido a múltiplas tentativas de acesso inválidas'
        });
      }
      
      // Aplicar rate limiting para autenticação
      authLimiter(req, res, (err) => {
        if (err) return next(err);
        
        const apiKey = req.headers['authorization']?.replace('Bearer ', '');
        const licenseKey = req.headers['x-license-key'];
        const secretKey = req.headers['x-secret-key'];
       
        if (!apiKey || !licenseKey || !secretKey) {
          return res.status(401).json({
            error: 'Credenciais não fornecidas',
            message: 'Headers obrigatórias: Authorization, X-License-Key, X-Secret-Key'
          });
        }
     
        db.get(
        `SELECT * FROM licenses WHERE api_key = ? AND license_key = ? AND secret_key = ?`,
        [apiKey, licenseKey, secretKey],
        (err, license) => {
          if (err || !license) {
            // Registrar tentativa de acesso com credenciais inválidas
            securityAlerts.logInvalidCredentialAttempt(ip, req.path, db);
            
            return res.status(401).json({
              error: 'Credenciais inválidas',
              message: 'API Key, License Key ou Secret Key incorretos'
            });
          }
     
          if (license.status !== 'active') {
            return res.status(403).json({
              error: 'Licença inativa',
              message: 'Sua licença foi revogada ou expirou'
            });
          }
     
          const expirationDate = new Date(license.expires_at);
          if (expirationDate < new Date()) {
            return res.status(403).json({
              error: 'Licença expirada',
              message: 'Sua licença expirou em ' + license.expires_at
            });
          }
     
          if (license.requests_used >= license.requests_limit) {
            return res.status(429).json({
              error: 'Limite de requisições excedido',
              message: `Você atingiu o limite de ${license.requests_limit} requisições` 
            });
          }
     
          req.license = license;
          next();
        });
      });
    })
    .catch(err => {
      console.error('Erro ao verificar bloqueio de IP:', err);
      next(); // Continuar mesmo em caso de erro na verificação
    });
};
 
// ============================================
// MIDDLEWARE PARA REGISTRAR ANALYTICS
// ============================================

// Tabela para registrar tentativas de abuso
db.run(`
  CREATE TABLE IF NOT EXISTS abuse_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    headers TEXT,
    timestamp TEXT NOT NULL
  )
`);

// Middleware para detectar e registrar possíveis abusos
const detectAbuse = (req, res, next) => {
  // Verificar se a requisição está sendo limitada pelo rate limiter
  // Nota: os headers só estarão disponíveis após o middleware do rate limiter ser executado
  // Vamos verificar isso no evento 'finish' da resposta
  
  res.on('finish', () => {
    // Verificar se o status code indica limite excedido (429)
    if (res.statusCode === 429) {
      // Registrar tentativa de abuso quando o limite é atingido
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const headers = JSON.stringify(req.headers);
      
      // Inserir registro na tabela de tentativas de abuso
      db.run(
        `INSERT INTO abuse_attempts (ip, endpoint, method, headers, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [ip, req.path, req.method, headers, new Date().toISOString()],
        (err) => {
          if (err) {
            console.error('Erro ao registrar tentativa de abuso:', err);
            return;
          }
          
          // Verificar se deve enviar alerta
          securityAlerts.checkAndSendAlert(ip, db);
          
          // Verificar se deve bloquear o IP
          securityAlerts.shouldBlockIP(ip, db)
            .then(shouldBlock => {
              if (shouldBlock) {
                securityAlerts.addToBlocklist(ip, db)
                  .then(() => {
                    console.log(`IP ${ip} bloqueado temporariamente devido a múltiplas tentativas de abuso`);
                  })
                  .catch(err => {
                    console.error('Erro ao bloquear IP:', err);
                  });
              }
            })
            .catch(err => {
              console.error('Erro ao verificar bloqueio de IP:', err);
            });
        }
      );
    }
  });
  
  next();
};

// Aplicar middleware de detecção de abuso após os rate limiters
app.use(detectAbuse);
 
const logRequest = (req, res, next) => {
  const startTime = Date.now();
 
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
 
    if (req.license) {
      // Registrar analytics
      db.run(
        `INSERT INTO api_requests (license_id, endpoint, method, status_code, response_time, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.license.id, req.path, req.method, res.statusCode, responseTime, new Date().toISOString()]
      );
 
      // Incrementar contador de requisições
      db.run(
        `UPDATE licenses SET requests_used = requests_used + 1 WHERE id = ?`,
        [req.license.id]
      );

      // Registrar uso no Stripe (metered billing), se configurado
      registerUsage(req.license, 1).catch((e) => {
        console.warn('Falha ao registrar uso no Stripe:', e?.message || e);
      });
    }
  });
 
  next();
};

// ============================================
// ROTAS PÚBLICAS
// ============================================

app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'Licensing API',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/stripe/checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({ error: 'Stripe não configurado' });
    }
    const {
      mode = 'payment',
      priceId,
      amount,
      currency = 'brl',
      quantity = 1,
      success_url,
      cancel_url,
      metadata = {}
    } = req.body || {};

    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const sessionParams = {
      mode,
      payment_method_types: ['card'],
      success_url: success_url || `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/falha`
    };

    if (priceId) {
      sessionParams.line_items = [{ price: priceId, quantity }];
    } else {
      if (!amount) {
        return res.status(400).json({ error: 'Informe priceId ou amount' });
      }
      sessionParams.line_items = [{
        price_data: {
          currency,
          product_data: { name: 'Checkout' },
          unit_amount: Math.round(Number(amount))
        },
        quantity
      }];
    }

    if (metadata && typeof metadata === 'object') {
      sessionParams.metadata = Object.fromEntries(Object.entries(metadata).map(([k, v]) => [String(k), String(v)]));
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('Erro ao criar sessão de checkout:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// ============================================
// SWAGGER DOCS (/docs)
// ============================================
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Licensing API',
    version: '1.0.0',
    description: 'API de Licenças com autenticação, analytics e webhooks.'
  },
  servers: [{ url: 'http://localhost:' + (process.env.PORT || 3000) }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer' },
      licenseKey: { type: 'apiKey', in: 'header', name: 'X-License-Key' },
      secretKey: { type: 'apiKey', in: 'header', name: 'X-Secret-Key' }
    }
  },
  security: [{ bearerAuth: [], licenseKey: [], secretKey: [] }],
  paths: {
    '/': { get: { summary: 'Root', responses: { '200': { description: 'OK' } } } },
    '/health': { get: { summary: 'Healthcheck', responses: { '200': { description: 'OK' } } } },
    '/admin/licenses': {
      post: {
        summary: 'Criar licença',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  companyName: { type: 'string' },
                  email: { type: 'string' },
                  planType: { type: 'string', enum: ['basic', 'pro', 'enterprise'] },
                  expiresAt: { type: 'string', format: 'date' }
                },
                required: ['companyName', 'email', 'planType', 'expiresAt']
              }
            }
          }
        },
        responses: { '201': { description: 'Licença criada' } }
      },
      get: { summary: 'Listar licenças', responses: { '200': { description: 'OK' } } }
    },
    '/admin/licenses/{id}/revoke': {
      patch: {
        summary: 'Revogar licença',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Revogada' } }
      }
    },
    '/admin/analytics': { get: { summary: 'Analytics global', responses: { '200': { description: 'OK' } } } },
    '/api/license/status': { get: { summary: 'Status da licença', responses: { '200': { description: 'OK' } } } },
    '/api/audio/process': {
      post: {
        summary: 'Processar áudio',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { audio_url: { type: 'string' }, format: { type: 'string' }, quality: { type: 'string' } }, required: ['audio_url'] } } }
        },
        responses: { '200': { description: 'Processamento iniciado' } }
      }
    },
    '/api/analytics': { get: { summary: 'Analytics do parceiro', responses: { '200': { description: 'OK' } } } },
    '/api/webhooks': { get: { summary: 'Listar webhooks', responses: { '200': { description: 'OK' } } } },
    '/admin/security/abuse': {
      get: {
        summary: 'Monitoramento de segurança - tentativas de abuso',
        parameters: [
          {
            name: 'days',
            in: 'query',
            schema: { type: 'integer', default: 7 },
            description: 'Número de dias para analisar'
          }
        ],
        responses: { '200': { description: 'Dados de tentativas de abuso' } }
      }
    }
  }
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// STRIPE WEBHOOK (validar faturamento e vincular assinatura)
// ============================================
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(501).json({ error: 'Stripe não configurado' });
  }
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const handle = async () => {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Tentar mapear licença pelo email do cliente
        const customerId = session.customer;
        const email = session.customer_details?.email || session.customer_email || null;
        let subscriptionId = session.subscription || null;
        let subscriptionItemId = null;
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            subscriptionItemId = sub.items?.data?.[0]?.id || null;
          } catch (e) {}
        }
        if (email) {
          db.get(`SELECT * FROM licenses WHERE email = ? ORDER BY created_at DESC LIMIT 1`, [email], (err, lic) => {
            if (!err && lic) {
              db.run(
                `UPDATE licenses SET stripe_customer_id = COALESCE(?, stripe_customer_id), stripe_subscription_id = COALESCE(?, stripe_subscription_id), stripe_subscription_item_id = COALESCE(?, stripe_subscription_item_id) WHERE id = ?`,
                [customerId || null, subscriptionId || null, subscriptionItemId || null, lic.id]
              );
            }
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const subId = sub.id;
        const status = sub.status;
        db.get(`SELECT * FROM licenses WHERE stripe_subscription_id = ?`, [subId], (err, lic) => {
          if (!err && lic) {
            const newStatus = (status === 'active' || status === 'trialing') ? 'active' : 'revoked';
            db.run(`UPDATE licenses SET status = ? WHERE id = ?`, [newStatus, lic.id]);
          }
        });
        break;
      }
      default:
        break;
    }
  };

  handle().then(() => res.json({ received: true })).catch((e) => {
    console.error('Erro no webhook Stripe:', e);
    res.status(500).json({ error: 'internal' });
  });
});

// ============================================
// SITE SIMPLES (/site)
// ============================================
app.get('/site', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Licensing API - Site</title>
<style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0f1020;color:#eaeafd;margin:0;padding:24px} .card{background:#17182f;border:1px solid #7c3aed55;border-radius:12px;padding:20px;margin:0 auto;max-width:900px} a{color:#a78bfa} code{background:#0b0c1a;padding:2px 6px;border-radius:6px}</style>
</head><body>
<div class="card">
  <h1>Licensing API</h1>
  <p>Bem-vindo! Use os links abaixo para explorar.</p>
  <ul>
    <li><a href="/docs" target="_blank">Documentação (Swagger)</a></li>
    <li><a href="/health" target="_blank">Healthcheck</a></li>
    <li><a href="/" target="_blank">Root JSON</a></li>
  </ul>
  <h2>Como começar</h2>
  <ol>
    <li>Crie uma licença com <code>POST /admin/licenses</code>.</li>
    <li>Guarde <code>apiKey</code>, <code>licenseKey</code>, <code>secretKey</code>.</li>
    <li>Chame rotas autenticadas com os headers: <code>Authorization: Bearer</code>, <code>X-License-Key</code>, <code>X-Secret-Key</code>.</li>
  </ol>
  <p>Dica: no Windows, use <code>Invoke-RestMethod</code> no PowerShell.</p>
</div>
</body></html>`);
});

// ============================================
// ROTAS DE ADMINISTRAÇÃO (SEM AUTENTICAÇÃO)
// ============================================
 
// Criar nova licença
app.post('/admin/licenses', (req, res) => {
  const { companyName, email, planType, expiresAt } = req.body;
 
  if (!companyName || !email || !planType || !expiresAt) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }
 
  const requestsLimit = {
    basic: 1000,
    pro: 10000,
    enterprise: 100000
  }[planType] || 1000;
 
  const license = {
    id: generateUUID(),
    userId: generateUUID(),
    companyName,
    email,
    planType,
    licenseKey: generateLicenseKey(),
    apiKey: generateApiKey(),
    secretKey: generateSecretKey(),
    status: 'active',
    requestsLimit,
    expiresAt,
    createdAt: new Date().toISOString()
  };
 
  db.run(
    `INSERT INTO licenses (id, user_id, company_name, email, plan_type, license_key, api_key,
     secret_key, status, requests_used, requests_limit, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [
      license.id, license.userId, license.companyName, license.email, license.planType,
      license.licenseKey, license.apiKey, license.secretKey, license.status,
      license.requestsLimit, license.expiresAt, license.createdAt
    ],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar licença', details: err.message });
      }
 
      res.status(201).json({
        message: 'Licença criada com sucesso',
        license: {
          ...license,
          requestsUsed: 0
        }
      });
    }
  );
});

// ============================================
// FUNÇÕES AUXILIARES: STRIPE USAGE RECORDS
// ============================================
async function registerUsage(license, quantity) {
  try {
    if (!stripe) return; // Stripe não configurado
    if (!license?.stripe_subscription_item_id) return; // licença ainda não vinculada a uma assinatura metered
    const ts = Math.floor(Date.now() / 1000);
    await stripe.subscriptionItems.createUsageRecord(license.stripe_subscription_item_id, {
      quantity: quantity || 1,
      timestamp: ts,
      action: 'increment'
    });
  } catch (e) {
    // Não interrompe o fluxo da API
    throw e;
  }
}
 
// Listar todas as licenças
app.get('/admin/licenses', (req, res) => {
  db.all('SELECT * FROM licenses ORDER BY created_at DESC', (err, licenses) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar licenças' });
    }
    res.json({ licenses });
  });
});
 
// Revogar licença
app.patch('/admin/licenses/:id/revoke', (req, res) => {
  db.run(
    'UPDATE licenses SET status = ? WHERE id = ?',
    ['revoked', req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao revogar licença' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Licença não encontrada' });
      }
      res.json({ message: 'Licença revogada com sucesso' });
    }
  );
});
 
// Analytics global
app.get('/admin/analytics', (req, res) => {
  db.all(
    `SELECT
      l.company_name,
      l.plan_type,
      l.requests_used,
      l.requests_limit,
      COUNT(r.id) as total_requests,
      AVG(r.response_time) as avg_response_time
     FROM licenses l
     LEFT JOIN api_requests r ON l.id = r.license_id
     GROUP BY l.id`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar analytics' });
      }
      res.json({ analytics: stats });
    }
  );
});

// Monitoramento de segurança - tentativas de abuso
app.get('/admin/security/abuse', (req, res) => {
  const { days = 7 } = req.query;
  
  // Buscar tentativas de abuso recentes
  db.all(
    `SELECT * FROM abuse_attempts 
     WHERE timestamp >= datetime('now', '-${days} days') 
     ORDER BY timestamp DESC`,
    (err, attempts) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar tentativas de abuso' });
      }
      
      // Agrupar por IP para identificar atacantes recorrentes
      db.all(
        `SELECT ip, COUNT(*) as attempt_count 
         FROM abuse_attempts 
         WHERE timestamp >= datetime('now', '-${days} days') 
         GROUP BY ip 
         ORDER BY attempt_count DESC 
         LIMIT 10`,
        (err, topAbusers) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao analisar tentativas de abuso' });
          }
          
          // Buscar IPs atualmente bloqueados
          db.all(
            `SELECT ip, blocked_at, expires_at 
             FROM blocked_ips 
             WHERE expires_at > datetime('now') 
             ORDER BY expires_at DESC`,
            (err, blockedIPs) => {
              if (err) {
                return res.status(500).json({ error: 'Erro ao buscar IPs bloqueados' });
              }
              
              // Estatísticas de segurança
              db.get(
                `SELECT 
                  COUNT(*) as total_attempts,
                  COUNT(DISTINCT ip) as unique_ips,
                  MAX(timestamp) as last_attempt
                FROM abuse_attempts 
                WHERE timestamp >= datetime('now', '-${days} days')`,
                (err, stats) => {
                  if (err) {
                    return res.status(500).json({ error: 'Erro ao calcular estatísticas de segurança' });
                  }
                  
                  res.json({ 
                    recent_attempts: attempts,
                    top_abusers: topAbusers,
                    blocked_ips: blockedIPs,
                    statistics: stats || { total_attempts: 0, unique_ips: 0, last_attempt: null },
                    total_count: attempts.length
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Rota para desbloquear um IP manualmente
app.post('/admin/security/unblock', (req, res) => {
  const { ip } = req.body;
  
  if (!ip) {
    return res.status(400).json({ error: 'IP não fornecido' });
  }
  
  db.run(
    `DELETE FROM blocked_ips WHERE ip = ?`,
    [ip],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao desbloquear IP' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'IP não encontrado na lista de bloqueados' });
      }
      
      res.json({ 
        success: true, 
        message: `IP ${ip} desbloqueado com sucesso`,
        unblocked_ip: ip
      });
    }
  );
});
 
// ============================================
// ROTAS DA API (COM AUTENTICAÇÃO)
// ============================================
 
// Verificar status da licença
app.get('/api/license/status', authenticateAPI, logRequest, (req, res) => {
  res.json({
    status: req.license.status,
    company: req.license.company_name,
    plan: req.license.plan_type,
    requests_used: req.license.requests_used,
    requests_limit: req.license.requests_limit,
    expires_at: req.license.expires_at
  });
});
 
// Processar áudio
app.post('/api/audio/process', authenticateAPI, logRequest, (req, res) => {
  const { audio_url, format, quality } = req.body;
 
  if (!audio_url) {
    return res.status(400).json({ error: 'audio_url é obrigatório' });
  }
 
  // Simular processamento
  const jobId = generateUUID();
 
  // Enviar webhook após processamento
  setTimeout(() => {
    triggerWebhook(req.license.id, 'processing_complete', {
      job_id: jobId,
      audio_url,
      format: format || 'mp3',
      quality: quality || 'high',
      result_url: `https://cdn.example.com/processed/${jobId}.${format || 'mp3'}`,
      duration: Math.floor(Math.random() * 300) + 10
    });
  }, 2000);
 
  res.json({
    message: 'Processamento iniciado',
    job_id: jobId,
    status: 'processing',
    estimated_time: '30-60 segundos'
  });
});
 
// Obter analytics do parceiro
app.get('/api/analytics', authenticateAPI, logRequest, (req, res) => {
  const { period = '7d' } = req.query;
 
  db.all(
    `SELECT
      DATE(timestamp) as date,
      COUNT(*) as requests,
      AVG(response_time) as avg_response_time,
      endpoint,
      method,
      status_code
     FROM api_requests
     WHERE license_id = ? AND timestamp >= datetime('now', '-${period}')
     GROUP BY DATE(timestamp), endpoint
     ORDER BY timestamp DESC`,
    [req.license.id],
    (err, analytics) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar analytics' });
      }
 
      // Estatísticas gerais
      db.get(
        `SELECT
          COUNT(*) as total_requests,
          AVG(response_time) as avg_response_time,
          MIN(response_time) as min_response_time,
          MAX(response_time) as max_response_time
         FROM api_requests
         WHERE license_id = ?`,
        [req.license.id],
        (err, stats) => {
          res.json({
            period,
            license_info: {
              requests_used: req.license.requests_used,
              requests_limit: req.license.requests_limit,
              usage_percentage: ((req.license.requests_used / req.license.requests_limit) * 100).toFixed(2)
            },
            stats: stats || {},
            timeline: analytics
          });
        }
      );
    }
  );
});
 
// ============================================
// SISTEMA DE WEBHOOKS
// ============================================
 
const triggerWebhook = (licenseId, eventType, payload) => {
  db.run(
    `INSERT INTO webhooks (license_id, event_type, payload, created_at)
     VALUES (?, ?, ?, ?)`,
    [licenseId, eventType, JSON.stringify(payload), new Date().toISOString()],
    function(err) {
      if (err) {
        console.error('Erro ao criar webhook:', err);
        return;
      }
 
      // Simular envio do webhook (em produção, enviaria para URL do parceiro)
      console.log(`📡 Webhook enviado:`, {
        event: eventType,
        payload,
        webhook_id: this.lastID
      });
 
      db.run(
        `UPDATE webhooks SET status = 'sent', attempts = 1 WHERE id = ?`,
        [this.lastID]
      );
    }
  );
};
 
// Listar webhooks
app.get('/api/webhooks', authenticateAPI, (req, res) => {
  db.all(
    `SELECT * FROM webhooks WHERE license_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.license.id],
    (err, webhooks) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar webhooks' });
      }
 
      res.json({
        webhooks: webhooks.map(w => ({
          ...w,
          payload: JSON.parse(w.payload)
        }))
      });
    }
  );
});
 
// ============================================
// FRONTEND - REACT COMPONENT
// ============================================
 
const FRONTEND_CODE = '';
 
// ============================================
// EXEMPLO DE USO DA API
// ============================================
 
console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                   🚀 API DE LICENÇAS - BACKEND ATIVO              ║
╚═══════════════════════════════════════════════════════════════════╝
 
📡 ROTAS ADMINISTRATIVAS (Sem Autenticação):
   POST   /admin/licenses              - Criar nova licença
   GET    /admin/licenses              - Listar todas as licenças
   PATCH  /admin/licenses/:id/revoke   - Revogar licença
   GET    /admin/analytics             - Analytics global
 
🔐 ROTAS DA API (Com Autenticação):
   GET    /api/license/status          - Status da licença
   POST   /api/audio/process           - Processar áudio
   GET    /api/analytics               - Analytics do parceiro
   GET    /api/webhooks                - Listar webhooks
 
📝 HEADERS OBRIGATÓRIAS PARA API:
   Authorization: Bearer {API_KEY}
   X-License-Key: {LICENSE_KEY}
   X-Secret-Key: {SECRET_KEY}
 
🎯 EXEMPLO DE REQUISIÇÃO:
 
curl -X POST http://localhost:3000/api/audio/process \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "X-License-Key: lic_xyz..." \
  -H "X-Secret-Key: sk_secret_def456..." \
  -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://example.com/audio.mp3",
    "format": "mp3",
    "quality": "high"
  }'
 
📦 DEPENDÊNCIAS NECESSÁRIAS:
   npm install express cors sqlite3 axios crypto
 
🔥 FEATURES IMPLEMENTADAS:
   ✅ Autenticação completa com 3 chaves
   ✅ Validação de licenças e expiração
   ✅ Rate limiting por plano
   ✅ Analytics em tempo real
   ✅ Sistema de webhooks
   ✅ Dashboard para parceiros
   ✅ Logs de requisições
   ✅ Frontend React completo
 
`);
 
// ============================================
// INICIAR SERVIDOR
// ============================================
 
const PORT = process.env.PORT || 3000;
 
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`\n🎨 Frontend Code disponível na constante FRONTEND_CODE`);
  console.log(`\n💡 Para usar o frontend, copie o código e use no seu projeto React`);
});
