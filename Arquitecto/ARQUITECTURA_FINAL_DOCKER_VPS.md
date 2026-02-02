# 🏗️ ARQUITECTURA FINAL: VPS ALL-IN-ONE (Todo en un solo servidor)
## Assembly 2.0 - Decisión Aprobada v2.0

**Versión:** 2.0 - DECISIÓN FINAL ACTUALIZADA  
**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Aprobado por:** Henry Batista  
**Audiencia:** Database Agent + Coder

---

## ✅ **DECISIÓN ESTRATÉGICA APROBADA (ACTUALIZADA):**

Después de analizar:
- Railway.app (falló - chatbot se dormía)
- Supabase Cloud vs VPS Self-Hosted
- Cloud (AWS/GCP) vs VPS
- Costos vs escenario de negocio (30 asambleas/mes, $7k ingresos)
- **Limitación Supabase:** Pro ($25/mes) es limitado, Team ($599/mes) es 24x más caro ❌

**DECISIÓN FINAL: VPS ALL-IN-ONE (Frontend + Backend + PostgreSQL + Chatbots)**

**TODO en un solo VPS Hetzner:**
- ✅ PostgreSQL (self-hosted en container o instalado)
- ✅ Next.js App (frontend + backend API)
- ✅ 3 Chatbots (WhatsApp + Telegram + Web)
- ✅ Nginx (reverse proxy + SSL)
- ✅ PM2 (process manager)
- ✅ **Un solo pago, control total, sin límites artificiales**

**Razones:**
1. ✅ Coder tiene control total de BD (desarrollo Y producción)
2. ✅ VPS soporta 300-500 concurrentes (suficiente para 30 asambleas/mes)
3. ✅ **Costo óptimo: $32/mes ($384/año) - 50% más barato que VPS + Supabase**
4. ✅ Escalable: Upgrade a VPS más potente sin saltos de $599/mes
5. ✅ Sin límites: No hay restricciones de requests, storage, o conexiones
6. ✅ Multi-canal: WhatsApp + Telegram + Web App chatbot always-on
7. ✅ **Un solo punto de falla, un solo lugar para monitorear**

---

## 🏗️ **ARQUITECTURA FINAL (VPS ALL-IN-ONE):**

```
┌─────────────────────────────────────────────────────────┐
│ ENTORNO DE DESARROLLO (LOCAL)                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Docker Compose:                                          │
│ ├─ PostgreSQL 15 (container)                            │
│ │  └─ Puerto: 5432                                      │
│ │  └─ Volumen persistente                               │
│ │  └─ Coder tiene ACCESO DIRECTO (psql, DBeaver, etc.) │
│ │                                                        │
│ ├─ Next.js App (container)                              │
│ │  ├─ Landing page                                      │
│ │  ├─ Dashboards                                        │
│ │  ├─ API Routes (Auth, Realtime, etc.)                │
│ │  └─ Puerto: 3000                                      │
│ │                                                        │
│ └─ Chatbots (containers separados)                      │
│    ├─ Telegram bot (puerto 3001)                        │
│    ├─ WhatsApp bot (puerto 3002)                        │
│    └─ Web chatbot (puerto 3003)                         │
│                                                          │
│ VENTAJAS:                                                │
│ ✅ Coder prueba todo localmente                         │
│ ✅ Control total de BD (migrations, seeds, queries)     │
│ ✅ Sin costos                                            │
│ ✅ Mismo entorno que producción (Docker)                │
│ ✅ NO necesita Supabase (ni local ni cloud)             │
└─────────────────────────────────────────────────────────┘

                        ↓ DEPLOY

┌─────────────────────────────────────────────────────────┐
│ ENTORNO DE PRODUCCIÓN (VPS ALL-IN-ONE)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Hetzner VPS CX51 ($32/mes):                             │
│ ├─ 8 vCPU, 32GB RAM, 240GB SSD                         │
│ ├─ Ubuntu 22.04 LTS                                     │
│ ├─ Docker + Docker Compose                              │
│ ├─ Nginx (reverse proxy + SSL)                          │
│ ├─ PM2 (process manager)                                │
│ │                                                        │
│ ├─ PostgreSQL 15 (container):                           │
│ │  ├─ Puerto: 5432 (interno)                           │
│ │  ├─ Volumen persistente: /var/lib/postgresql         │
│ │  ├─ Backups automáticos (pg_dump diario)             │
│ │  └─ PgBouncer (connection pooling)                    │
│ │                                                        │
│ ├─ Next.js App (container):                             │
│ │  ├─ Landing page                                      │
│ │  ├─ Dashboards (Admin Plataforma + Admin PH)         │
│ │  ├─ API Routes:                                       │
│ │  │  ├─ /api/auth (Email + OTP + WebAuthn)            │
│ │  │  ├─ /api/assemblies (CRUD + Votación)             │
│ │  │  ├─ /api/votes (Votación en tiempo real)          │
│ │  │  └─ Socket.io (Realtime updates)                  │
│ │  └─ Puerto: 3000                                      │
│ │                                                        │
│ ├─ Chatbots (3 containers always-on):                   │
│ │  ├─ Telegram bot (puerto 3001)                        │
│ │  ├─ WhatsApp bot (puerto 3002)                        │
│ │  └─ Web chatbot (puerto 3003)                         │
│ │                                                        │
│ ├─ Redis (container - opcional):                        │
│ │  ├─ Cache de sesiones                                 │
│ │  ├─ Queue para votes masivos                          │
│ │  └─ Puerto: 6379 (interno)                            │
│ │                                                        │
│ └─ Nginx config:                                         │
│    ├─ assembly20.com → 3000 (Next.js)                  │
│    ├─ bot.assembly20.com → 3001 (Telegram)             │
│    ├─ whatsapp.assembly20.com → 3002 (WhatsApp)        │
│    └─ chat.assembly20.com → 3003 (Web)                 │
│                                                          │
│ VENTAJAS:                                                │
│ ✅ TODO en un solo servidor (un solo pago)              │
│ ✅ Control total de BD (sin límites)                    │
│ ✅ Sin saltos de precio artificiales ($25 → $599)       │
│ ✅ Chatbots always-on (no se duermen)                   │
│ ✅ IP fija (crítico para WhatsApp Business API)         │
│ ✅ Soporta 500-1,000 concurrentes (CX51)                │
│ ✅ Escalable: upgrade gradual sin migración compleja    │
│ ✅ Costo: $32/mes (0.45% de ingresos) 🔥                │
└─────────────────────────────────────────────────────────┘

                        ↓ SI CRECE A 50+ ASAMBLEAS/MES

┌─────────────────────────────────────────────────────────┐
│ PATH DE ESCALAMIENTO (FUTURO)                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ OPCIÓN A: VPS más Potente (MÁS ECONÓMICO)               │
│ ├─ Hetzner CCX33 ($57/mes)                              │
│ │  └─ 8 vCPU Dedicados, 32GB RAM (1,500+ concurrentes) │
│ │                                                        │
│ ├─ O Hetzner CCX43 ($115/mes)                           │
│ │  └─ 16 vCPU Dedicados, 64GB RAM (3,000+ concurrentes)│
│ │                                                        │
│ └─ Ventaja: Mismo setup, solo cambiar de VPS            │
│                                                          │
│ OPCIÓN B: VPS Cluster (ALTA DISPONIBILIDAD)             │
│ ├─ 2-3 VPS Hetzner CX51 ($64-96/mes)                    │
│ ├─ Load Balancer Hetzner ($6/mes)                       │
│ ├─ PostgreSQL Primary-Replica (HA)                      │
│ └─ TOTAL: ~$100/mes                                     │
│                                                          │
│ OPCIÓN C: Cloud Full (solo si ingresos >$20k/mes)       │
│ ├─ AWS Lightsail cluster ($120/mes)                     │
│ ├─ RDS PostgreSQL ($50/mes)                             │
│ └─ TOTAL: ~$170/mes                                     │
│                                                          │
│ DECISIÓN: Basada en métricas reales de crecimiento      │
│ Recomendación: Opción A hasta 100 asambleas/mes         │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 **COSTOS FINALES (APROBADOS - VPS ALL-IN-ONE):**

```
FASE 1: DESARROLLO (Mes 1-3)
├─ Docker Local: $0 (corre en tu Mac)
├─ Cursor Pro: $20/mes
└─ TOTAL: $20/mes = $60 (3 meses)

FASE 2: PRODUCCIÓN (Mes 4-12)
├─ Hetzner CX51 VPS: $32/mes
│  └─ TODO incluido: PostgreSQL + Next.js + Chatbots
├─ Dominio (assembly20.com): $1/mes
├─ Cursor Pro: $20/mes (desarrollo continuo)
└─ TOTAL: $53/mes = $636/año (9 meses = $477)

TOTAL AÑO 1: $60 + $477 = $537

vs Ingresos proyectados (30 asambleas/mes × $233 promedio):
= $7,000/mes × 9 meses (Mes 4-12) = $63,000
Costo infraestructura: 0.76% ✅ (antes era 0.9% con Supabase)

AHORRO vs Arquitectura Anterior (VPS + Supabase):
├─ Antes: $762/año
├─ Ahora: $537/año
└─ AHORRO: $225/año (29% más barato) 🔥

FASE 3: ESCALA (50+ asambleas/mes, >$15k ingresos)
├─ Hetzner CCX33: $57/mes (1,500 concurrentes)
├─ Hetzner CCX43: $115/mes (3,000 concurrentes)
├─ VPS Cluster: $100/mes (alta disponibilidad)
└─ Cloud: $170/mes (solo si >$20k/mes)
```

---

## 📊 **COMPARATIVA DE COSTOS (30 Asambleas/mes):**

| Opción | Costo/mes | Costo/año | % Ingresos | Límites |
|--------|-----------|-----------|------------|---------|
| **VPS All-in-One** ⭐ | **$53** | **$537** | **0.76%** | Ninguno |
| VPS + Supabase Pro | $63.50 | $762 | 0.9% | 500 conn, 8GB storage |
| VPS + Supabase Team | $642 | $7,704 | 9% ❌ | 1,500 conn, 100GB |
| Cloud Full (AWS) | $266 | $3,192 | 3.8% | Ilimitado |

**Conclusión: VPS All-in-One es 29% más barato y sin límites artificiales.** 🔥
```

---

## 📋 **PARA DATABASE AGENT - TAREAS CRÍTICAS (ACTUALIZADO):**

**Por favor revisar y validar con la nueva arquitectura VPS All-in-One:**

### **1. Schema de Base de Datos (PostgreSQL Self-Hosted):**
```
✅ Multi-tenancy con RLS (Row Level Security)
✅ Índices optimizados para:
   - Consultas de quórum (500 residentes × 30 asambleas/mes)
   - Votación en tiempo real (Socket.io)
   - Chatbot conversations (búsquedas rápidas)
   - Auth sessions (Email + OTP)

✅ Tablas críticas:
   - organizations (PHs)
   - units (residentes con coefficients)
   - assemblies (asambleas)
   - votes (votación ponderada)
   - chatbot_conversations (historial)
   - auth_sessions (OTP + WebAuthn)
   - auth_otp_codes (códigos temporales)

✅ Snapshots para auditabilidad (Ley 284 Panamá)

NUEVO - Sin Supabase:
✅ Tabla auth_users (reemplaza auth.users de Supabase)
✅ Tabla auth_sessions (manejo manual de sesiones)
✅ Tabla auth_otp_codes (códigos de 6 dígitos)
✅ Triggers para cleanup de OTPs expirados
```

### **2. Estrategia de Migración (Docker → VPS PostgreSQL):**
```
Docker Local → VPS PostgreSQL:
├─ Mismo PostgreSQL 15 (consistencia)
├─ Migrations con SQL scripts (sin Prisma por simplicidad)
├─ Seeds para datos de prueba
├─ Backup automático con pg_dump (diario + S3 o local)
└─ Testing de performance (500-1,000 concurrentes)

VALIDAR:
- ¿Los índices soportan 500 inserts/segundo (votación)?
- ¿RLS policies no causan bottleneck?
- ✅ ¿PgBouncer configurado? (connection pooling crítico)
- ✅ ¿Backups automáticos con pg_dump funcionan?
- ✅ ¿Restore desde backup funciona? (testing obligatorio)
```

### **3. Concurrencia y Performance (VPS All-in-One):**
```
Escenario: 500 usuarios votando simultáneamente

PREGUNTAS PARA DATABASE AGENT:
1. ✅ ¿Necesitamos Redis para queue de votes? (Sí, recomendado)
2. ✅ ¿Los triggers de quórum dinámico son eficientes? (Validar EXPLAIN ANALYZE)
3. ✅ ¿Debemos usar LISTEN/NOTIFY + Socket.io para realtime? (Sí)
4. ✅ ¿PgBouncer configurado para pool connections? (Obligatorio)
5. ✅ ¿PostgreSQL configurado para alta concurrencia? (max_connections, shared_buffers)

OPTIMIZACIONES REQUERIDAS:
- Redis queue para batch inserts de votes (100 votos → 1 bulk insert)
- Debouncing de updates (quórum recalcula cada 2 segundos, no en cada voto)
- Cache de legal_rules (Ley 284) en Redis (TTL 1 hora)
- Índices parciales (solo asambleas activas: WHERE status = 'active')
- PgBouncer: transaction pooling para máximo throughput
- PostgreSQL tuning: work_mem, maintenance_work_mem, effective_cache_size

CONFIGURACIÓN POSTGRESQL (/etc/postgresql/15/main/postgresql.conf):
max_connections = 200
shared_buffers = 8GB (25% de RAM)
effective_cache_size = 24GB (75% de RAM)
work_mem = 64MB
maintenance_work_mem = 2GB
```

### **4. Backup y Disaster Recovery (SIN SUPABASE):**
```
Docker Local:
- Volume persistente (no se pierde al reiniciar)
- Script de backup diario → GitHub (migrations + seeds)

VPS Producción:
- ✅ pg_dump automático (diario) → S3 o local + offsite
  └─ Script cron: 0 2 * * * /scripts/backup-db.sh
- ✅ Hetzner Snapshots semanales ($1.80/mes)
- ✅ WAL archiving (Point-in-Time Recovery opcional)
- ✅ GitHub: Código + migrations siempre actualizados

SCRIPT DE BACKUP (backup-db.sh):
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres assembly > /backups/assembly_$DATE.sql
gzip /backups/assembly_$DATE.sql
# Opcional: subir a S3
aws s3 cp /backups/assembly_$DATE.sql.gz s3://assembly-backups/
# Limpiar backups viejos (>7 días)
find /backups -name "*.sql.gz" -mtime +7 -delete

VALIDAR:
- ✅ ¿Proceso de restore funciona? (testing mensual obligatorio)
- ✅ ¿RPO (Recovery Point Objective)? 1 día (backup diario)
- ✅ ¿RTO (Recovery Time Objective)? < 1 hora (restore manual)
- ✅ ¿Backups se suben a S3/offsite? (protección contra pérdida VPS)
```

---

## 📋 **PARA CODER - INSTRUCCIONES ACTUALIZADAS (VPS ALL-IN-ONE):**

### **TAREA 1: Configurar Docker Local (Prioridad 1)**

**Archivo a crear:** `docker-compose.yml` en la raíz del proyecto

**CAMBIO IMPORTANTE:** Ya NO usamos Supabase. TODO es self-hosted.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: assembly-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: assembly
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql_snippets:/docker-entrypoint-initdb.d
      - ./backups:/backups
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=1GB
      -c effective_cache_size=3GB
      -c work_mem=32MB
    networks:
      - assembly-network

  redis:
    image: redis:7-alpine
    container_name: assembly-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - assembly-network

  app:
    build: .
    container_name: assembly-app
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/assembly
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      OTP_SECRET: ${OTP_SECRET}
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    networks:
      - assembly-network

  telegram-bot:
    build:
      context: .
      dockerfile: Dockerfile.telegram
    container_name: assembly-telegram-bot
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/assembly
      REDIS_URL: redis://redis:6379
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    networks:
      - assembly-network

  whatsapp-bot:
    build:
      context: .
      dockerfile: Dockerfile.whatsapp
    container_name: assembly-whatsapp-bot
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/assembly
      REDIS_URL: redis://redis:6379
      WHATSAPP_PHONE_NUMBER_ID: ${WHATSAPP_PHONE_NUMBER_ID}
      WHATSAPP_ACCESS_TOKEN: ${WHATSAPP_ACCESS_TOKEN}
      WHATSAPP_VERIFY_TOKEN: ${WHATSAPP_VERIFY_TOKEN}
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis
    networks:
      - assembly-network

  web-chatbot:
    build:
      context: .
      dockerfile: Dockerfile.webchat
    container_name: assembly-web-chatbot
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/assembly
      REDIS_URL: redis://redis:6379
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3003:3003"
    depends_on:
      - postgres
      - redis
    networks:
      - assembly-network

volumes:
  postgres_data:
  redis_data:

networks:
  assembly-network:
    driver: bridge
```

**Comandos para el Coder:**
```bash
# 1. Crear .env desde .env.example
cp .env.example .env
# Luego edita .env con tus secrets

# 2. Levantar todo el stack local
docker-compose up -d

# 3. Verificar que todo está corriendo
docker-compose ps

# 4. Ver logs
docker-compose logs -f app

# 5. Conectar a PostgreSQL con psql
docker exec -it assembly-db psql -U postgres -d assembly

# 6. Conectar a Redis (testing)
docker exec -it assembly-redis redis-cli

# 7. Acceder a la app
# Abrir: http://localhost:3000

# 8. Testing manual del OTP
# En terminal:
docker exec -it assembly-redis redis-cli
> GET otp:user@example.com
# Debería mostrar el código OTP

# 9. Backup manual de BD
docker exec assembly-db pg_dump -U postgres assembly > backup.sql

# 10. Restore de backup
docker exec -i assembly-db psql -U postgres assembly < backup.sql

# 11. Detener todo
docker-compose down

# 12. Detener y eliminar datos (reset completo)
docker-compose down -v
```

---

### **TAREA 2: Implementar Auth Self-Hosted (SIN SUPABASE)**

**Archivo:** `src/lib/auth.ts`

```typescript
import { createHash, randomBytes } from 'crypto';
import { Redis } from 'ioredis';
import nodemailer from 'nodemailer';

const redis = new Redis(process.env.REDIS_URL);

// Generar OTP de 6 dígitos
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Guardar OTP en Redis (TTL 5 minutos)
export async function saveOTP(email: string, code: string): Promise<void> {
  await redis.setex(`otp:${email}`, 300, code);
}

// Verificar OTP
export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const storedCode = await redis.get(`otp:${email}`);
  if (storedCode === code) {
    await redis.del(`otp:${email}`); // Eliminar después de usar
    return true;
  }
  return false;
}

// Enviar email con OTP
export async function sendOTPEmail(email: string, code: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Assembly 2.0" <noreply@assembly20.com>',
    to: email,
    subject: 'Tu código de verificación',
    html: `
      <h2>Tu código de verificación</h2>
      <p>Código: <strong>${code}</strong></p>
      <p>Este código expira en 5 minutos.</p>
    `,
  });
}

// Crear sesión JWT
export function createSession(userId: string, email: string): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// Verificar sesión JWT
export function verifySession(token: string): { userId: string; email: string } | null {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
```

**Archivo:** `src/app/api/auth/send-otp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, saveOTP, sendOTPEmail } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Verificar si el usuario existe
  const user = await sql`
    SELECT id FROM users WHERE email = ${email}
  `;

  if (user.length === 0) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  // Generar y guardar OTP
  const code = generateOTP();
  await saveOTP(email, code);

  // Enviar email
  await sendOTPEmail(email, code);

  return NextResponse.json({ success: true });
}
```

**Archivo:** `src/app/api/auth/verify-otp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, createSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  // Verificar OTP
  const valid = await verifyOTP(email, code);
  if (!valid) {
    return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
  }

  // Obtener usuario
  const [user] = await sql`
    SELECT id, email, role FROM users WHERE email = ${email}
  `;

  // Crear sesión JWT
  const token = createSession(user.id, user.email);

  return NextResponse.json({ token, user });
}
```

---

### **TAREA 3: Crear Dockerfile para cada servicio**

**Dockerfile (Next.js app):**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Dockerfile.telegram (Telegram bot):**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY bots/telegram/package*.json ./
RUN npm install

COPY bots/telegram/ ./

EXPOSE 3001

CMD ["node", "index.js"]
```

**Dockerfile.whatsapp y Dockerfile.webchat:** Similar estructura

---

### **TAREA 4: Implementar Realtime con Socket.io (SIN SUPABASE REALTIME)**

**Archivo:** `src/lib/socket.ts` (Server)

```typescript
import { Server } from 'socket.io';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const redisSub = new Redis(process.env.REDIS_URL); // Para subscriptions

export function initSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  // Subscribe a eventos de PostgreSQL vía Redis Pub/Sub
  redisSub.subscribe('assembly:votes', 'assembly:quorum');

  redisSub.on('message', (channel, message) => {
    const data = JSON.parse(message);
    
    if (channel === 'assembly:votes') {
      io.to(`assembly:${data.assembly_id}`).emit('vote', data);
    }
    
    if (channel === 'assembly:quorum') {
      io.to(`assembly:${data.assembly_id}`).emit('quorum', data);
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join:assembly', (assemblyId: string) => {
      socket.join(`assembly:${assemblyId}`);
      console.log(`Cliente ${socket.id} se unió a asamblea ${assemblyId}`);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
}
```

**Archivo:** `src/app/api/votes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function POST(req: NextRequest) {
  const { assembly_id, unit_id, topic_id, vote_value } = await req.json();

  // Insertar voto
  const [vote] = await sql`
    INSERT INTO votes (assembly_id, unit_id, topic_id, vote_value)
    VALUES (${assembly_id}, ${unit_id}, ${topic_id}, ${vote_value})
    RETURNING *
  `;

  // Publicar evento en Redis (Socket.io lo captura)
  await redis.publish('assembly:votes', JSON.stringify({
    assembly_id,
    unit_id,
    vote_value,
    timestamp: new Date(),
  }));

  return NextResponse.json({ vote });
}
```

---

### **TAREA 5: Script de setup para desarrollo**

**Archivo:** `scripts/dev-setup.sh`

```bash
#!/bin/bash

echo "🚀 Assembly 2.0 - Setup de Desarrollo"
echo "======================================"

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instala Docker Desktop."
    exit 1
fi

# 2. Verificar docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose no está instalado."
    exit 1
fi

echo "✅ Docker OK"

# 3. Copiar .env.example a .env si no existe
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env creado (configura tus variables)"
fi

# 4. Levantar Docker Compose
echo "📦 Levantando servicios Docker..."
docker-compose up -d

# 5. Esperar a que PostgreSQL esté listo
echo "⏳ Esperando PostgreSQL..."
sleep 5

# 6. Ejecutar migrations
echo "🗄️ Ejecutando migrations..."
docker exec assembly-app npx prisma migrate dev

# 7. Ejecutar seeds
echo "🌱 Insertando datos de prueba..."
docker exec assembly-app npx prisma db seed

echo ""
echo "✅ Setup completo!"
echo ""
echo "📍 URLs:"
echo "  - App: http://localhost:3000"
echo "  - Supabase Studio: http://localhost:54323"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "📋 Comandos útiles:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Detener: docker-compose down"
echo "  - Resetear BD: docker-compose down -v && ./scripts/dev-setup.sh"
```

---

### **TAREA 6: Script de Backup Automático**

**Archivo:** `scripts/backup-db.sh`

```bash
#!/bin/bash
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="assembly"
DB_USER="postgres"

echo "🔄 Iniciando backup de BD..."

# 1. Crear backup con pg_dump
docker exec assembly-db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/assembly_$DATE.sql

# 2. Comprimir
gzip $BACKUP_DIR/assembly_$DATE.sql

echo "✅ Backup creado: assembly_$DATE.sql.gz"

# 3. (Opcional) Subir a S3
if [ ! -z "$AWS_S3_BUCKET" ]; then
  aws s3 cp $BACKUP_DIR/assembly_$DATE.sql.gz s3://$AWS_S3_BUCKET/backups/
  echo "✅ Backup subido a S3"
fi

# 4. Limpiar backups viejos (>7 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "🎉 Backup completado"
```

**Configurar cron (en VPS):**
```bash
# Ejecutar backup diario a las 2 AM
crontab -e

# Agregar:
0 2 * * * /root/assembly-2-0/scripts/backup-db.sh >> /var/log/backup-db.log 2>&1
```

---

### **TAREA 7: Preparar para VPS**

**Documentos a consultar:**
- `Arquitecto/SETUP_VPS_CHATBOTS_MULTI_CANAL.md` (ya existe - ACTUALIZAR)
- `Arquitecto/ANALISIS_SUPABASE_VS_VPS.md` (decisión final v3.0)

**Script de deploy a VPS:** `scripts/deploy-vps.sh`

```bash
#!/bin/bash

VPS_IP="TU_IP_VPS"
VPS_USER="deployer"

echo "🚀 Deploying to VPS..."

# 1. Build images
docker-compose build

# 2. Save images
docker save assembly-app:latest | gzip > app.tar.gz
docker save assembly-telegram-bot:latest | gzip > telegram.tar.gz
docker save assembly-whatsapp-bot:latest | gzip > whatsapp.tar.gz
docker save assembly-web-chatbot:latest | gzip > webchat.tar.gz

# 3. Upload to VPS
scp *.tar.gz $VPS_USER@$VPS_IP:~/assembly/

# 4. Load images on VPS
ssh $VPS_USER@$VPS_IP << 'EOF'
  cd ~/assembly
  docker load < app.tar.gz
  docker load < telegram.tar.gz
  docker load < whatsapp.tar.gz
  docker load < webchat.tar.gz
  docker-compose up -d
EOF

echo "✅ Deploy completo!"
```

---

## 📊 **CHECKLIST FINAL (VPS ALL-IN-ONE):**

### **Para Database Agent:**
```
[ ] Revisar schema multi-tenant (RLS)
[ ] Validar índices para 500-1,000 concurrentes
[ ] Confirmar estrategia de migrations (Docker → VPS PostgreSQL)
[ ] Evaluar bottlenecks de performance (EXPLAIN ANALYZE)
[ ] Diseñar tablas de auth self-hosted (auth_users, auth_sessions, auth_otp_codes)
[ ] Configurar PgBouncer para connection pooling
[ ] Documentar backup/restore process con pg_dump
[ ] Testing de restore desde backup (obligatorio)
[ ] Configurar PostgreSQL para alta concurrencia (max_connections, shared_buffers)
[ ] Implementar cleanup de OTPs expirados (trigger o cron)
```

### **Para Coder:**
```
[ ] Crear docker-compose.yml (PostgreSQL + Redis + App + 3 Bots)
[ ] Implementar Auth self-hosted (Email + OTP + WebAuthn)
  [ ] API /api/auth/send-otp
  [ ] API /api/auth/verify-otp
  [ ] API /api/auth/register-webauthn
  [ ] Middleware de autenticación JWT
[ ] Implementar Realtime self-hosted (Socket.io + Redis Pub/Sub)
  [ ] Server: src/lib/socket.ts
  [ ] Cliente: useSocket hook
  [ ] Publicar eventos: assembly:votes, assembly:quorum
[ ] Crear Dockerfiles (app + 3 bots)
[ ] Script dev-setup.sh
[ ] Script backup-db.sh (pg_dump automático)
[ ] Testing local (PostgreSQL + Redis accesibles)
[ ] Migrations funcionan en Docker
[ ] Seeds para datos de prueba
[ ] Testing de Auth (OTP flow completo)
[ ] Testing de Realtime (votos en vivo)
[ ] Git commit: "Setup VPS All-in-One: PostgreSQL + Auth + Realtime self-hosted"
```

### **Para Henry:**
```
[ ] Aprobar Hetzner CX51 ($32/mes) para producción
  └─ Ahorro: $225/año vs arquitectura anterior
[ ] Comprar dominio assembly20.com ($12/año)
[ ] Crear cuenta Hetzner (requiere tarjeta)
[ ] Decidir: ¿Backups a S3 o solo local + Hetzner Snapshots?
  └─ S3 Glacier: $1-2/mes (recomendado para seguridad)
  └─ Solo Hetzner: $1.80/mes (snapshots semanales)
[ ] Configurar cuenta SMTP para envío de OTPs
  └─ Opción 1: SendGrid (100 emails/día gratis)
  └─ Opción 2: AWS SES ($0.10 por 1,000 emails)
[ ] Siguiente fase: Coder ejecuta setup Docker local
```

---

---

## 🎯 **VENTAJAS DE VPS ALL-IN-ONE vs Supabase Cloud:**

| Aspecto | VPS All-in-One ⭐ | Supabase Cloud |
|---------|-------------------|----------------|
| **Costo/mes** | $32 | $25 (Pro) → $599 (Team) |
| **Límites** | Ninguno | 500 conn, 8GB storage |
| **Control BD** | Total | Limitado (no root) |
| **Escalamiento** | Gradual ($32→$57→$115) | Salto 24x ($25→$599) ❌ |
| **Auth** | Self-hosted (OTP+JWT) | Supabase Auth (managed) |
| **Realtime** | Socket.io + Redis | Supabase Realtime |
| **Backups** | pg_dump + S3 | Automático (Pro/Team) |
| **Mantenimiento** | Manual (Coder) | Managed (Supabase) |
| **Flexibilidad** | Total | Restringido |

**Conclusión:** VPS All-in-One es más barato, sin límites, y escalable gradualmente. El trade-off es más trabajo de setup inicial, pero con Docker todo está automatizado. 🔥

---

**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Status:** 🟢 DECISIÓN FINAL v2.0 APROBADA (VPS ALL-IN-ONE)

**Próximo paso:** Database Agent revisa arquitectura y diseña tablas de auth self-hosted, luego Coder ejecuta setup Docker local. 🚀
