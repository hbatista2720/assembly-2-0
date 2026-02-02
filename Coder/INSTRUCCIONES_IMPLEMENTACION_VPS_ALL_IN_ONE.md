# 🚀 INSTRUCCIONES PARA CODER: Implementación VPS All-in-One
## Assembly 2.0 - Setup Completo

**Versión:** 1.0 - APROBADO POR DBA  
**Fecha:** 30 Enero 2026  
**De:** Arquitecto  
**Para:** Coder  
**Prioridad:** 🔴 ALTA - IMPLEMENTACIÓN INMEDIATA  
**Status:** ✅ APROBADO POR DBA - PROCEDER

---

## ✅ **ARQUITECTURA APROBADA:**

El Database Agent (DBA) revisó y **APROBÓ** la arquitectura VPS All-in-One con mejoras.

**Documentos de referencia:**
1. ✅ `Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md` (v2.0)
2. ✅ `Database_DBA/VEREDICTO_DBA_ARQUITECTURA_VPS.md` (aprobación + mejoras)

**Decisión final:**
- ❌ NO usar Supabase Cloud (limitado y salto de $25 → $599/mes)
- ✅ TODO self-hosted en VPS: PostgreSQL + Redis + Next.js + Chatbots
- ✅ Costo: $17.50/mes (CX41) → escalable a $32/mes (CX51) cuando crezca

---

## 🎯 **TU OBJETIVO:**

Implementar el stack completo en Docker local, probarlo, y prepararlo para deploy en VPS.

**Stack tecnológico:**
```
Docker Compose:
├─ PostgreSQL 15 (con PgBouncer)
├─ Redis 7
├─ Next.js App (Frontend + Backend API)
├─ Auth self-hosted (Email + OTP + JWT)
├─ Realtime self-hosted (Socket.io + Redis Pub/Sub)
└─ 3 Chatbots (Telegram + WhatsApp + Web)
```

---

## 📋 **TAREAS PRIORIZADAS:**

### **FASE 1: Docker Local (PRIORIDAD 1) - 2-3 días**

#### **Tarea 1.1: Crear `docker-compose.yml` (mejorado por DBA)**

**Archivo:** Raíz del proyecto → `docker-compose.yml`

```yaml
version: '3.8'

services:
  # === PostgreSQL 15 ===
  postgres:
    image: postgres:15-alpine
    container_name: assembly-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: assembly
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql_snippets:/docker-entrypoint-initdb.d
      - ./backups:/backups
    # Configuración optimizada por DBA
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=1GB
      -c effective_cache_size=3GB
      -c work_mem=16MB
      -c maintenance_work_mem=512MB
      -c checkpoint_completion_target=0.9
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c shared_preload_libraries=pg_stat_statements
    networks:
      - assembly-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # === PgBouncer (NUEVO - Obligatorio por DBA) ===
  pgbouncer:
    image: edoburu/pgbouncer:latest
    container_name: assembly-pgbouncer
    environment:
      DATABASE_URL: postgres://postgres:${POSTGRES_PASSWORD:-postgres}@postgres:5432/assembly
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 1000
      DEFAULT_POOL_SIZE: 25
      RESERVE_POOL_SIZE: 10
    ports:
      - "6432:5432"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - assembly-network

  # === Redis 7 ===
  redis:
    image: redis:7-alpine
    container_name: assembly-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    networks:
      - assembly-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # === Next.js App ===
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: assembly-app
    environment:
      # Base de datos (USAR PGBOUNCER, no PostgreSQL directo)
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@pgbouncer:5432/assembly
      REDIS_URL: redis://redis:6379
      
      # Auth
      JWT_SECRET: ${JWT_SECRET}
      OTP_SECRET: ${OTP_SECRET}
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      
      # SMTP (para OTPs)
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      
      # Node.js
      NODE_ENV: development
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      pgbouncer:
        condition: service_started
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    networks:
      - assembly-network

  # === Telegram Bot ===
  telegram-bot:
    build:
      context: .
      dockerfile: Dockerfile.telegram
    container_name: assembly-telegram-bot
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@pgbouncer:5432/assembly
      REDIS_URL: redis://redis:6379
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      pgbouncer:
        condition: service_started
    networks:
      - assembly-network
    restart: unless-stopped

  # === WhatsApp Bot ===
  whatsapp-bot:
    build:
      context: .
      dockerfile: Dockerfile.whatsapp
    container_name: assembly-whatsapp-bot
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@pgbouncer:5432/assembly
      REDIS_URL: redis://redis:6379
      WHATSAPP_PHONE_NUMBER_ID: ${WHATSAPP_PHONE_NUMBER_ID}
      WHATSAPP_ACCESS_TOKEN: ${WHATSAPP_ACCESS_TOKEN}
      WHATSAPP_VERIFY_TOKEN: ${WHATSAPP_VERIFY_TOKEN}
    ports:
      - "3002:3002"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      pgbouncer:
        condition: service_started
    networks:
      - assembly-network
    restart: unless-stopped

  # === Web Chatbot ===
  web-chatbot:
    build:
      context: .
      dockerfile: Dockerfile.webchat
    container_name: assembly-web-chatbot
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-postgres}@pgbouncer:5432/assembly
      REDIS_URL: redis://redis:6379
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3003:3003"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      pgbouncer:
        condition: service_started
    networks:
      - assembly-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  assembly-network:
    driver: bridge
```

**Cambios vs versión del Arquitecto:**
1. ✅ **PgBouncer agregado** (obligatorio por DBA)
2. ✅ **work_mem = 16MB** (era 64MB, corregido por DBA)
3. ✅ **Healthchecks** para evitar errores de conexión
4. ✅ **DATABASE_URL apunta a PgBouncer** (puerto 6432), no PostgreSQL directo
5. ✅ **Redis con maxmemory** (512MB) y política de eviction

---

#### **Tarea 1.2: Crear `.env.example` y `.env`**

**Archivo:** Raíz del proyecto → `.env.example`

```bash
# === PostgreSQL ===
POSTGRES_PASSWORD=postgres

# === Auth (generar secretos seguros) ===
JWT_SECRET=change-me-to-random-64-chars
OTP_SECRET=change-me-to-random-32-chars
NEXTAUTH_SECRET=change-me-to-random-64-chars

# === SMTP (para enviar OTPs) ===
# Opción 1: SendGrid (gratis 100 emails/día)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxx

# Opción 2: Gmail (requiere "App Password")
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu-email@gmail.com
# SMTP_PASS=tu-app-password

# === Chatbots ===
TELEGRAM_BOT_TOKEN=
GEMINI_API_KEY=

# WhatsApp (opcional, para producción)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
```

**Comandos:**
```bash
# 1. Copiar template
cp .env.example .env

# 2. Generar secretos aleatorios
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('OTP_SECRET=' + require('crypto').randomBytes(16).toString('hex'))"
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# 3. Editar .env con tus valores reales
nano .env
```

---

#### **Tarea 1.3: Actualizar `schema.sql` (mejoras del DBA)**

**Archivo:** Raíz → `sql_snippets/schema_auth_improved.sql` (NUEVO)

```sql
-- === MEJORAS DE SEGURIDAD AGREGADAS POR DBA ===

-- Tabla de intentos de auth (rate limiting, prevenir brute force)
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL, -- 'otp_request', 'otp_verify'
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para rate limiting (último hora)
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_recent 
ON auth_attempts (email, created_at) 
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Índice para análisis de seguridad
CREATE INDEX IF NOT EXISTS idx_auth_attempts_failed 
ON auth_attempts (email, success, created_at) 
WHERE success = false;

-- Función de rate limiting (NUEVO - requerido por DBA)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_email TEXT,
  p_attempt_type TEXT,
  p_max_attempts INT DEFAULT 5,
  p_window_minutes INT DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM auth_attempts
  WHERE email = p_email
    AND attempt_type = p_attempt_type
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN v_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup automático de intentos viejos (>7 días)
CREATE OR REPLACE FUNCTION cleanup_old_auth_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_attempts
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Job diario para cleanup (ejecutar con pg_cron o cron externo)
-- SELECT cleanup_old_auth_attempts();

COMMENT ON TABLE auth_attempts IS 'Registro de intentos de autenticación para rate limiting y auditoría';
COMMENT ON FUNCTION check_rate_limit IS 'Verifica si un email ha excedido el límite de intentos';
```

**IMPORTANTE:** Este archivo se ejecuta DESPUÉS de `schema.sql` existente.

---

#### **Tarea 1.4: Levantar Docker y Testing**

```bash
# 1. Levantar servicios
docker-compose up -d

# 2. Ver logs en tiempo real
docker-compose logs -f

# 3. Verificar que todo está corriendo
docker-compose ps

# Salida esperada:
# assembly-db          running   5432/tcp
# assembly-pgbouncer   running   6432:5432/tcp
# assembly-redis       running   6379/tcp
# assembly-app         running   3000:3000/tcp
# assembly-telegram-bot running  3001:3001/tcp
# assembly-whatsapp-bot running  3002:3002/tcp
# assembly-web-chatbot  running  3003:3003/tcp

# 4. Testing de conexiones

# PostgreSQL (directo - solo para admin)
docker exec -it assembly-db psql -U postgres -d assembly -c "SELECT version();"

# PgBouncer (testing connection pool)
docker exec -it assembly-pgbouncer psql -U postgres -d assembly -h localhost -p 5432 -c "SHOW pool_mode;"
# Debería mostrar: transaction

# Redis (testing cache)
docker exec -it assembly-redis redis-cli PING
# Debería responder: PONG

# 5. Verificar schema de BD
docker exec -it assembly-db psql -U postgres -d assembly -c "\dt"
# Debería listar todas las tablas (organizations, users, etc.)

# 6. Testing de rate limiting (función del DBA)
docker exec -it assembly-db psql -U postgres -d assembly -c "SELECT check_rate_limit('test@example.com', 'otp_request');"
# Debería retornar: t (true)

# 7. Ver métricas de PgBouncer
docker exec -it assembly-app psql postgresql://postgres:postgres@pgbouncer:5432/assembly -c "SHOW STATS;"
```

---

### **FASE 2: Auth Self-Hosted (PRIORIDAD 2) - 3-4 días**

#### **Tarea 2.1: Implementar biblioteca de Auth**

**Archivo:** `src/lib/auth.ts`

```typescript
import { createHash, randomBytes } from 'crypto';
import { Redis } from 'ioredis';
import nodemailer from 'nodemailer';
import { sql } from '@/lib/db';

const redis = new Redis(process.env.REDIS_URL!);

// === OTP Generation ===

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOTP(email: string, code: string): Promise<void> {
  // TTL 5 minutos (300 segundos)
  await redis.setex(`otp:${email}`, 300, code);
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const storedCode = await redis.get(`otp:${email}`);
  if (storedCode === code) {
    // Eliminar después de usar (one-time use)
    await redis.del(`otp:${email}`);
    return true;
  }
  return false;
}

// === Rate Limiting (NUEVO - requerido por DBA) ===

export async function checkRateLimit(
  email: string,
  attemptType: 'otp_request' | 'otp_verify',
  maxAttempts: number = 5,
  windowMinutes: number = 60
): Promise<boolean> {
  try {
    const [result] = await sql`
      SELECT check_rate_limit(
        ${email},
        ${attemptType},
        ${maxAttempts},
        ${windowMinutes}
      ) as allowed
    `;
    return result.allowed;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // En caso de error, permitir (fail-open)
    return true;
  }
}

export async function logAuthAttempt(
  email: string,
  attemptType: 'otp_request' | 'otp_verify',
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO auth_attempts (email, attempt_type, success, ip_address, user_agent)
      VALUES (${email}, ${attemptType}, ${success}, ${ipAddress}, ${userAgent})
    `;
  } catch (error) {
    console.error('Error logging auth attempt:', error);
    // No fallar si el log falla
  }
}

// === Email Sending ===

export async function sendOTPEmail(email: string, code: string): Promise<void> {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Assembly 2.0" <noreply@assembly20.com>',
    to: email,
    subject: 'Tu código de verificación - Assembly 2.0',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
            .code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; letter-spacing: 5px; padding: 20px; background-color: #EEF2FF; border-radius: 8px; margin: 20px 0; }
            .footer { font-size: 12px; color: #666; margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Tu código de verificación</h2>
            <p>Has solicitado acceso a Assembly 2.0. Tu código de verificación es:</p>
            <div class="code">${code}</div>
            <p>Este código <strong>expira en 5 minutos</strong>.</p>
            <p>Si no solicitaste este código, ignora este email.</p>
            <div class="footer">
              <p>Assembly 2.0 - Plataforma de Gobernanza Digital</p>
              <p>Este es un email automático, por favor no respondas.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

// === JWT Sessions ===

export function createSession(userId: string, email: string, role: string): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySession(token: string): { userId: string; email: string; role: string } | null {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
```

---

#### **Tarea 2.2: Implementar API Routes**

**Archivo:** `src/app/api/auth/send-otp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, saveOTP, sendOTPEmail, checkRateLimit, logAuthAttempt } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // === RATE LIMITING (NUEVO - DBA) ===
    const allowed = await checkRateLimit(email, 'otp_request', 5, 60);
    if (!allowed) {
      // Registrar intento bloqueado
      await logAuthAttempt(
        email,
        'otp_request',
        false,
        req.ip,
        req.headers.get('user-agent') || undefined
      );

      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 1 hora.' },
        { status: 429 }
      );
    }

    // Verificar si el usuario existe
    const user = await sql`
      SELECT id, email, role FROM users WHERE email = ${email}
    `;

    if (user.length === 0) {
      // Registrar intento fallido (usuario no existe)
      await logAuthAttempt(
        email,
        'otp_request',
        false,
        req.ip,
        req.headers.get('user-agent') || undefined
      );

      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Generar y guardar OTP
    const code = generateOTP();
    await saveOTP(email, code);

    // Enviar email
    await sendOTPEmail(email, code);

    // Registrar intento exitoso
    await logAuthAttempt(
      email,
      'otp_request',
      true,
      req.ip,
      req.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Error al enviar el código' },
      { status: 500 }
    );
  }
}
```

**Archivo:** `src/app/api/auth/verify-otp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, createSession, checkRateLimit, logAuthAttempt } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email y código son requeridos' },
        { status: 400 }
      );
    }

    // === RATE LIMITING (NUEVO - DBA) ===
    const allowed = await checkRateLimit(email, 'otp_verify', 3, 10);
    if (!allowed) {
      await logAuthAttempt(
        email,
        'otp_verify',
        false,
        req.ip,
        req.headers.get('user-agent') || undefined
      );

      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Intenta de nuevo en 10 minutos.' },
        { status: 429 }
      );
    }

    // Verificar OTP
    const valid = await verifyOTP(email, code);
    if (!valid) {
      // Registrar intento fallido
      await logAuthAttempt(
        email,
        'otp_verify',
        false,
        req.ip,
        req.headers.get('user-agent') || undefined
      );

      return NextResponse.json(
        { error: 'Código inválido o expirado' },
        { status: 400 }
      );
    }

    // Obtener usuario
    const [user] = await sql`
      SELECT id, email, role FROM users WHERE email = ${email}
    `;

    // Crear sesión JWT
    const token = createSession(user.id, user.email, user.role);

    // Registrar intento exitoso
    await logAuthAttempt(
      email,
      'otp_verify',
      true,
      req.ip,
      req.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Error al verificar el código' },
      { status: 500 }
    );
  }
}
```

---

#### **Tarea 2.3: Actualizar componente de Login**

**Archivo:** `src/app/login/page.tsx`

Reemplazar TODO el contenido con la versión actualizada de `Arquitecto/ARQUITECTURA_LOGIN_AUTENTICACION.md` (sección 5).

**Testing de Auth:**

```bash
# 1. Levantar la app
docker-compose up -d

# 2. Abrir http://localhost:3000/login

# 3. Ingresar email de un usuario existente
# (crear usuario de prueba primero si es necesario)

# 4. Hacer clic en "Enviar código"

# 5. Verificar que el OTP llegó al email (revisar logs si es desarrollo)
docker-compose logs -f app | grep "OTP:"

# 6. Ver OTP en Redis (testing)
docker exec -it assembly-redis redis-cli GET otp:test@example.com

# 7. Ingresar el código y verificar que se crea la sesión JWT

# 8. Testing de rate limiting (intentar 6 veces seguidas)
# Debería bloquear después del 5to intento

# 9. Ver intentos en BD
docker exec -it assembly-db psql -U postgres -d assembly -c "SELECT * FROM auth_attempts ORDER BY created_at DESC LIMIT 10;"
```

---

### **FASE 3: Realtime Self-Hosted (PRIORIDAD 3) - 2-3 días**

*(Ver documento de arquitectura para implementación completa)*

---

### **FASE 4: Chatbot Web + Botones Residentes (PRIORIDAD 4) - 1-2 días**

#### **Tarea 4.1: Validar Chatbot Web en Landing Page**

**Objetivo:** Verificar que el chatbot web está funcionando en `http://localhost:3000` y es el único flujo (sin duplicados).

**Pasos:**

1. **Levantar la landing page**
   ```bash
   docker-compose up -d app
   # Abrir: http://localhost:3000
   ```

2. **Verificar chatbot web existe:**
   - Debe aparecer un widget/botón de chat en la esquina inferior derecha
   - Al hacer clic, debe abrir ventana de chat
   - Debe conectarse a la BD (PostgreSQL, no Supabase)

3. **Eliminar duplicados:**
   - Si hay referencias a Supabase chatbot → eliminar
   - Si hay múltiples implementaciones → dejar solo una (chatbot web)
   - Buscar en código:
     ```bash
     grep -r "supabase" src/chatbot/
     grep -r "telegram" src/app/  # Telegram es separado, OK
     ```

4. **Actualizar conexión:**
   - `src/chatbot/utils/supabase.ts` → debe cambiar a PostgreSQL directo
   - Usar `DATABASE_URL` de `.env`, no Supabase API

---

#### **Tarea 4.2: Implementar Botones de Acciones Rápidas para Residentes**

**Objetivo:** Cuando un residente abre el chatbot, debe ver botones específicos para sus acciones.

**Diseño de botones (SOLO para residentes):**

```typescript
// src/components/ChatbotResidentActions.tsx

interface ResidentAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  enabled: boolean; // true si está disponible ahora
}

const RESIDENT_ACTIONS: ResidentAction[] = [
  {
    id: 'votar',
    label: '🗳️ Votar Ahora',
    icon: '🗳️',
    action: () => handleVote(),
    enabled: hasActiveAssembly, // Solo si hay asamblea activa
  },
  {
    id: 'asambleas',
    label: '📅 Próximas Asambleas',
    icon: '📅',
    action: () => showAssemblies(),
    enabled: true,
  },
  {
    id: 'calendario',
    label: '📆 Calendario',
    icon: '📆',
    action: () => showCalendar(),
    enabled: true,
  },
  {
    id: 'temas',
    label: '📋 Temas del Día',
    icon: '📋',
    action: () => showTopics(),
    enabled: hasActiveAssembly,
  },
  {
    id: 'poder',
    label: '👥 Ceder Poder',
    icon: '👥',
    action: () => showPowerOfAttorney(),
    enabled: true,
  },
  {
    id: 'actas',
    label: '📄 Ver Actas',
    icon: '📄',
    action: () => showActs(),
    enabled: true,
  },
  {
    id: 'resultados',
    label: '📊 Resultados',
    icon: '📊',
    action: () => showResults(),
    enabled: true,
  },
];
```

**Implementación en el chatbot:**

```typescript
// src/components/ChatbotWidget.tsx

export function ChatbotWidget() {
  const [userRole, setUserRole] = useState<'admin' | 'resident' | 'visitor'>('visitor');
  const [isOpen, setIsOpen] = useState(false);

  // Detectar rol del usuario
  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUserRole('visitor');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await response.json();
      setUserRole(user.role); // 'admin_platform', 'admin_ph', 'resident'
    };

    checkUserRole();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón de chat */}
      <button onClick={() => setIsOpen(!isOpen)}>
        💬 Chat
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="w-96 h-[600px] bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white">
            <h3>Lex - Asistente Assembly 2.0</h3>
          </div>

          {/* Botones de acciones rápidas (SOLO para residentes) */}
          {userRole === 'resident' && (
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm font-semibold mb-2">Acciones Rápidas:</p>
              <div className="grid grid-cols-2 gap-2">
                {RESIDENT_ACTIONS.filter(a => a.enabled).map(action => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-blue-50 text-sm"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensajes del chat */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Aquí van los mensajes */}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

#### **Tarea 4.3: Implementar Acciones de Botones**

**Cada botón debe hacer lo siguiente:**

1. **🗳️ Votar Ahora:**
   ```typescript
   async function handleVote() {
     // 1. Verificar si hay asamblea activa
     const { data: assembly } = await fetch('/api/assemblies/active').then(r => r.json());
     
     if (!assembly) {
       showChatMessage('No hay asamblea activa en este momento.');
       return;
     }

     // 2. Redirigir a página de votación
     window.location.href = `/assembly/${assembly.id}/vote`;
   }
   ```

2. **📅 Próximas Asambleas:**
   ```typescript
   async function showAssemblies() {
     const { data } = await fetch('/api/assemblies/upcoming').then(r => r.json());
     
     const message = data.map(a => 
       `📍 ${a.name}\n📅 ${formatDate(a.scheduled_at)}\n📍 ${a.location}`
     ).join('\n\n');
     
     showChatMessage(message);
   }
   ```

3. **📆 Calendario:**
   ```typescript
   function showCalendar() {
     // Redirigir a página de calendario o mostrar en modal
     window.location.href = '/resident/calendar';
   }
   ```

4. **📋 Temas del Día:**
   ```typescript
   async function showTopics() {
     const { data: assembly } = await fetch('/api/assemblies/active').then(r => r.json());
     
     if (!assembly) {
       showChatMessage('No hay asamblea activa.');
       return;
     }

     const { data: topics } = await fetch(`/api/assemblies/${assembly.id}/topics`).then(r => r.json());
     
     const message = topics.map((t, i) => 
       `${i + 1}. ${t.title}\n   ${t.description}`
     ).join('\n\n');
     
     showChatMessage(`📋 Temas de la Asamblea:\n\n${message}`);
   }
   ```

5. **👥 Ceder Poder:**
   ```typescript
   function showPowerOfAttorney() {
     // Abrir modal o página para ceder poder
     window.location.href = '/resident/power-of-attorney';
   }
   ```

6. **📄 Ver Actas:**
   ```typescript
   async function showActs() {
     const { data } = await fetch('/api/assemblies/acts').then(r => r.json());
     
     const message = data.slice(0, 5).map(act => 
       `📄 ${act.assembly_name}\n📅 ${formatDate(act.date)}\n🔗 Ver: /acts/${act.id}`
     ).join('\n\n');
     
     showChatMessage(`📄 Últimas Actas:\n\n${message}`);
   }
   ```

7. **📊 Resultados:**
   ```typescript
   async function showResults() {
     const { data: assembly } = await fetch('/api/assemblies/recent').then(r => r.json());
     
     if (!assembly) {
       showChatMessage('No hay resultados disponibles.');
       return;
     }

     const { data: results } = await fetch(`/api/assemblies/${assembly.id}/results`).then(r => r.json());
     
     const message = results.map(r => 
       `📋 ${r.topic}\n✅ Sí: ${r.votes_yes} | ❌ No: ${r.votes_no}\n📊 Resultado: ${r.result}`
     ).join('\n\n');
     
     showChatMessage(message);
   }
   ```

---

#### **Tarea 4.4: Validar que Carga la Landing**

**Checklist de validación:**

```bash
# 1. Levantar Docker
docker-compose up -d

# 2. Verificar servicios
docker-compose ps
# Debe mostrar:
# - assembly-app: running (puerto 3000)
# - assembly-db: running
# - assembly-redis: running

# 3. Abrir landing page
open http://localhost:3000
# O en navegador: http://localhost:3000

# 4. Verificar elementos:
✅ Landing page carga sin errores
✅ Chatbot widget aparece (esquina inferior derecha)
✅ Al hacer clic, abre ventana de chat
✅ Si login como residente → muestra botones de acciones rápidas
✅ Si visitor → NO muestra botones (solo chat normal)

# 5. Testing de botones (como residente):
✅ Click en "🗳️ Votar Ahora" → redirige o muestra mensaje
✅ Click en "📅 Próximas Asambleas" → muestra lista
✅ Click en "📄 Ver Actas" → muestra historial
✅ Todos los botones responden sin errores de consola

# 6. Ver logs si hay errores
docker-compose logs -f app
```

---

## 📊 **CHECKLIST DE IMPLEMENTACIÓN:**

### **FASE 1: Docker Local** ✅
```
[ ] Crear docker-compose.yml (con PgBouncer)
[ ] Crear .env.example y .env
[ ] Generar secretos (JWT, OTP, NEXTAUTH)
[ ] Configurar SMTP (SendGrid o Gmail)
[ ] Ejecutar sql_snippets/schema_auth_improved.sql
[ ] Levantar Docker: docker-compose up -d
[ ] Verificar servicios: docker-compose ps
[ ] Testing PostgreSQL directo
[ ] Testing PgBouncer connection pool
[ ] Testing Redis
[ ] Verificar función check_rate_limit()
[ ] Ver métricas de PgBouncer
```

### **FASE 2: Auth Self-Hosted** ✅
```
[ ] Implementar src/lib/auth.ts (con rate limiting)
[ ] Implementar src/app/api/auth/send-otp/route.ts
[ ] Implementar src/app/api/auth/verify-otp/route.ts
[ ] Actualizar src/app/login/page.tsx
[ ] Testing: Enviar OTP a email real
[ ] Testing: Verificar OTP en Redis
[ ] Testing: Login completo (email → OTP → JWT)
[ ] Testing: Rate limiting (6 intentos)
[ ] Verificar auth_attempts en BD
```

### **FASE 3: Realtime** (próximo)
```
[ ] Implementar Socket.io server
[ ] Implementar Redis Pub/Sub
[ ] PostgreSQL triggers (notify_vote_inserted)
[ ] Testing de latencia (<100ms)
```

### **FASE 4: Chatbot Web + Botones Residentes** ⭐ NUEVO
```
[ ] Validar landing page carga en http://localhost:3000
[ ] Verificar chatbot web existe y funciona
[ ] Eliminar referencias a Supabase en chatbot
[ ] Actualizar conexión chatbot → PostgreSQL directo
[ ] Implementar detección de rol (visitor/admin/resident)
[ ] Crear componente ChatbotResidentActions.tsx
[ ] Implementar 7 botones de acciones rápidas:
    [ ] 🗳️ Votar Ahora (solo si hay asamblea activa)
    [ ] 📅 Próximas Asambleas
    [ ] 📆 Calendario
    [ ] 📋 Temas del Día (solo si hay asamblea activa)
    [ ] 👥 Ceder Poder
    [ ] 📄 Ver Actas
    [ ] 📊 Resultados
[ ] Implementar lógica de cada botón (API calls)
[ ] Testing: Login como residente → verificar botones
[ ] Testing: Login como admin → NO debe ver botones de residente
[ ] Testing: Visitor → solo chat normal, sin botones
```

### **FASE 5: Configuración Chatbots para Admin** ⭐ NUEVO CRÍTICO
```
[ ] Crear tabla chatbot_config en PostgreSQL (si no existe)
[ ] Crear página /platform-admin/chatbot-config
[ ] Implementar componente ChatbotConfigEditor.tsx
[ ] Funcionalidades:
    [ ] Ver lista de chatbots (Telegram, WhatsApp, Web)
    [ ] Editar prompts por contexto (landing, demo, soporte, residente)
    [ ] Configurar parámetros (temperatura, max_tokens)
    [ ] Activar/desactivar cada chatbot
    [ ] Ver métricas (conversaciones, respuestas exitosas)
    [ ] Botón "Probar cambios" (testing en vivo)
    [ ] Botón "Guardar cambios"
[ ] API Routes:
    [ ] GET /api/chatbot/config → obtener configuración actual
    [ ] PUT /api/chatbot/config → actualizar configuración
    [ ] GET /api/chatbot/metrics → obtener métricas
[ ] Testing:
    [ ] Login como Henry → acceso completo
    [ ] Cambiar prompt → verificar que chatbot responde diferente
    [ ] Desactivar Telegram → verificar que no responde
    [ ] Activar de nuevo → verificar que vuelve a funcionar
```

---

## 🆘 **TROUBLESHOOTING COMÚN:**

### **Error: "PgBouncer no conecta a PostgreSQL"**
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Ver logs de PgBouncer
docker-compose logs pgbouncer

# Verificar DATABASE_URL en pgbouncer
docker exec -it assembly-pgbouncer env | grep DATABASE_URL
```

### **Error: "Redis connection refused"**
```bash
# Verificar que Redis está corriendo
docker-compose ps redis

# Testing manual
docker exec -it assembly-redis redis-cli PING
```

### **Error: "OTP no llega por email"**
```bash
# Ver logs de la app
docker-compose logs app | grep -i smtp

# Verificar variables SMTP en .env
cat .env | grep SMTP

# Testing manual de SMTP
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.sendMail({
  from: 'test@assembly20.com',
  to: 'tu-email@example.com',
  subject: 'Test',
  text: 'Testing SMTP'
}).then(() => console.log('✅ Email enviado')).catch(console.error);
"
```

---

## 📞 **SOPORTE:**

**Si tienes dudas o problemas:**

1. ✅ Consulta `Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md` (arquitectura completa)
2. ✅ Consulta `Database_DBA/VEREDICTO_DBA_ARQUITECTURA_VPS.md` (mejoras del DBA)
3. ❓ Pregunta al Arquitecto (si es arquitectura)
4. ❓ Pregunta al DBA (si es base de datos/performance)

---

## 👨‍💼 **FASE 6: Sistema de Roles y Equipo (PRIORIDAD MEDIA)**

### **⚠️ Implementar DESPUÉS de FASE 1-2-4**

**Objetivo:** Permitir que una organización tenga múltiples administradores con roles y permisos específicos.

**Referencia completa:** `Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md` → **PANTALLA 0: GESTIÓN DE EQUIPO**

---

### **Tarea 6.1: Crear tabla `organization_users`**

**Archivo:** `sql_snippets/schema_team_management.sql` (NUEVO)

```sql
-- ============================================
-- SISTEMA DE MÚLTIPLES ADMINISTRADORES
-- ============================================

CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Rol dentro de esta organización
  role TEXT NOT NULL CHECK (role IN (
    'ADMIN_PRINCIPAL',      -- Dueño, acceso total
    'ADMIN_ASISTENTE',      -- Asistente, sin facturación/equipo
    'OPERADOR_ASAMBLEA',    -- Solo durante asambleas
    'VIEWER'                -- Solo lectura
  )),
  
  -- Permisos granulares
  permissions JSONB DEFAULT '{
    "manage_properties": true,
    "manage_owners": true,
    "create_assemblies": true,
    "execute_assemblies": true,
    "manual_voting": true,
    "view_reports": true,
    "export_acts": true,
    "manage_billing": false,
    "manage_team": false,
    "delete_organization": false
  }'::jsonb,
  
  -- Estado de invitación
  is_active BOOLEAN DEFAULT TRUE,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ NULL,
  invitation_token TEXT UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- Índices
CREATE INDEX idx_org_users_org ON organization_users(organization_id);
CREATE INDEX idx_org_users_user ON organization_users(user_id);
CREATE INDEX idx_org_users_role ON organization_users(role);
CREATE INDEX idx_org_users_active ON organization_users(is_active) WHERE is_active = TRUE;

-- Función para verificar permisos
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_organization_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  SELECT permissions INTO v_permissions
  FROM organization_users
  WHERE user_id = p_user_id
    AND organization_id = p_organization_id
    AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN COALESCE((v_permissions->>p_permission)::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Ejecutar:**
```bash
docker exec -i assembly-db psql -U postgres -d assembly < sql_snippets/schema_team_management.sql
```

---

### **Tarea 6.2: Crear middleware de permisos**

**Archivo:** `src/lib/permissions.ts` (NUEVO)

```typescript
import { sql } from './db';

export async function checkPermission(
  userId: string,
  organizationId: string,
  permission: string
): Promise<boolean> {
  try {
    const [result] = await sql`
      SELECT user_has_permission(
        ${userId}::UUID,
        ${organizationId}::UUID,
        ${permission}
      ) as has_permission
    `;
    return result.has_permission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

export async function requirePermission(
  userId: string,
  organizationId: string,
  permission: string
): Promise<void> {
  const hasPermission = await checkPermission(userId, organizationId, permission);
  if (!hasPermission) {
    throw new Error(`Permiso requerido: ${permission}`);
  }
}

// Ejemplo de uso en API Routes:
// await requirePermission(session.userId, orgId, 'manage_billing');
```

---

### **Tarea 6.3: API Routes para gestión de equipo**

**Archivo:** `src/app/api/team/route.ts` (NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

// GET /api/team - Obtener equipo
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const session = verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    // Obtener organization_id del usuario
    const [user] = await sql`
      SELECT ou.organization_id
      FROM organization_users ou
      WHERE ou.user_id = ${session.userId}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ error: 'Usuario sin organización' }, { status: 404 });
    }

    // Obtener todos los miembros del equipo
    const team = await sql`
      SELECT 
        ou.id,
        ou.user_id,
        ou.role,
        ou.permissions,
        ou.is_active,
        ou.invited_at,
        ou.accepted_at,
        u.email,
        u.first_name || ' ' || u.last_name as full_name
      FROM organization_users ou
      JOIN users u ON u.id = ou.user_id
      WHERE ou.organization_id = ${user.organization_id}
      ORDER BY 
        CASE ou.role
          WHEN 'ADMIN_PRINCIPAL' THEN 1
          WHEN 'ADMIN_ASISTENTE' THEN 2
          WHEN 'OPERADOR_ASAMBLEA' THEN 3
          WHEN 'VIEWER' THEN 4
        END,
        u.first_name
    `;

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Error al cargar equipo' }, { status: 500 });
  }
}
```

**Archivo:** `src/app/api/team/invite/route.ts` (NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { randomBytes } from 'crypto';

// POST /api/team/invite - Invitar usuario
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const session = verifySession(token!);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { email, role, permissions } = await req.json();

    // Obtener org del usuario actual
    const [currentUser] = await sql`
      SELECT ou.organization_id, ou.permissions
      FROM organization_users ou
      WHERE ou.user_id = ${session.userId}
    `;

    // Verificar permiso
    await requirePermission(session.userId, currentUser.organization_id, 'manage_team');

    // Verificar si el email ya existe
    let [invitedUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    // Si no existe, crear usuario
    if (!invitedUser) {
      [invitedUser] = await sql`
        INSERT INTO users (email, first_name, last_name, account_type)
        VALUES (${email}, '', '', 'ADMIN_PH')
        RETURNING id
      `;
    }

    // Generar token de invitación
    const invitationToken = randomBytes(32).toString('hex');

    // Crear relación en organization_users
    const [orgUser] = await sql`
      INSERT INTO organization_users (
        organization_id,
        user_id,
        role,
        permissions,
        invited_by,
        invitation_token
      )
      VALUES (
        ${currentUser.organization_id},
        ${invitedUser.id},
        ${role},
        ${JSON.stringify(permissions)}::jsonb,
        ${session.userId},
        ${invitationToken}
      )
      RETURNING *
    `;

    // TODO: Enviar email de invitación
    // const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${invitationToken}`;
    // await sendInvitationEmail(email, inviteLink);

    return NextResponse.json({ success: true, orgUser });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: 'Error al invitar usuario' }, { status: 500 });
  }
}
```

---

### **Tarea 6.4: Página de gestión de equipo**

**Archivo:** `src/app/dashboard/admin-ph/team/page.tsx` (NUEVO)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'ADMIN_PRINCIPAL' | 'ADMIN_ASISTENTE' | 'OPERADOR_ASAMBLEA' | 'VIEWER';
  is_active: boolean;
  permissions: Record<string, boolean>;
  invited_at: string;
  accepted_at: string | null;
}

const ROLE_LABELS = {
  ADMIN_PRINCIPAL: '👑 Admin Principal',
  ADMIN_ASISTENTE: '📋 Asistente',
  OPERADOR_ASAMBLEA: '🎙️ Operador Asamblea',
  VIEWER: '👁️ Viewer',
};

export default function TeamManagementPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      setTeam(data);
    } catch (error) {
      toast.error('Error al cargar equipo');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(email: string, role: string, permissions: Record<string, boolean>) {
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, permissions }),
      });

      if (!res.ok) throw new Error();

      toast.success('Invitación enviada por email');
      setShowInviteModal(false);
      fetchTeam();
    } catch (error) {
      toast.error('Error al enviar invitación');
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👨‍💼 Equipo de Administración</h1>
            <p className="text-gray-600 mt-2">
              Gestiona quién tiene acceso a este PH y sus permisos
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Invitar Usuario
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Usuario</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rol</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {team.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.full_name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span>{ROLE_LABELS[member.role]}</span>
                  </td>
                  <td className="px-6 py-4">
                    {member.accepted_at ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        ✅ Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        ⏳ Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Ver Permisos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TODO: Implementar modal de invitación */}
      </div>
    </div>
  );
}
```

---

### **Tarea 6.5: Actualizar sidebar para mostrar "Equipo"**

**Archivo:** `src/components/AdminSidebar.tsx` (MODIFICAR)

```typescript
// Agregar en la lista de links del sidebar:
{
  name: 'Equipo',
  href: '/dashboard/admin-ph/team',
  icon: '👨‍💼',
  visible: currentUser.permissions?.manage_team === true, // Solo si tiene permiso
},
```

---

### **Checklist FASE 6:**

```
SQL:
[ ] Crear tabla organization_users
[ ] Crear función user_has_permission()
[ ] Testing: Verificar función de permisos

Backend:
[ ] Crear src/lib/permissions.ts
[ ] API GET /api/team
[ ] API POST /api/team/invite
[ ] API DELETE /api/team/:userId (remover)

Frontend:
[ ] Crear src/app/dashboard/admin-ph/team/page.tsx
[ ] Agregar link en sidebar (condicional)
[ ] Componente InviteUserModal (completo)

Testing:
[ ] Login como Admin Principal → ve página equipo
[ ] Invitar usuario → recibe email
[ ] Usuario sin permiso → no ve página equipo
```

---

## 💳 **FASE 7: Sistema de Suscripción y Pagos (PRIORIDAD ALTA)**

### **⚠️ Implementar DESPUÉS de FASES 1-2-4-6**

**Objetivo:** Sistema completo de suscripción automático (TC con Stripe) + manual (ACH/Yappy) sin intervención de Henry.

**Inspiración:** Cursor, Vercel, GitHub Pro, Stripe Billing

**Referencia completa:** `Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_PH.md` → **PANTALLA 7: SUSCRIPCIÓN Y FACTURACIÓN**

---

### **Tarea 7.1: Crear tablas de suscripción**

**Archivo:** `sql_snippets/schema_subscriptions.sql` (NUEVO)

```sql
-- ============================================
-- SISTEMA DE SUSCRIPCIÓN Y PAGOS
-- ============================================

-- Tabla principal de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Plan y estado
  plan_tier TEXT NOT NULL CHECK (plan_tier IN (
    'DEMO',
    'EVENTO_UNICO',
    'DUO_PACK',
    'STANDARD',
    'MULTI_PH',
    'ENTERPRISE'
  )),
  
  status TEXT NOT NULL CHECK (status IN (
    'TRIAL',              -- Prueba gratuita
    'ACTIVE',             -- Activo y pagado
    'PAST_DUE',           -- Pago fallido
    'CANCELLED',          -- Cancelado por usuario
    'EXPIRED',            -- Expirado
    'PENDING_MANUAL'      -- Esperando aprobación manual (ACH/Yappy)
  )) DEFAULT 'TRIAL',
  
  -- Método de pago
  payment_method TEXT CHECK (payment_method IN (
    'STRIPE_CARD',        -- TC automática (recomendado)
    'MANUAL_ACH',         -- ACH manual (Panamá)
    'MANUAL_YAPPY',       -- Yappy manual (Panamá)
    'MANUAL_TRANSFER'     -- Transferencia manual
  )),
  
  -- Precios y facturación
  price_amount NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('one-time', 'monthly', 'annual')),
  currency TEXT DEFAULT 'USD',
  
  -- Fechas
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_effective_at TIMESTAMPTZ,  -- Para downgrade programado
  
  -- Stripe (solo para pagos automáticos)
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  stripe_latest_invoice_id TEXT,
  
  -- Créditos (solo para planes con sistema de créditos)
  credits_per_period INT DEFAULT 0,
  credits_rollover_months INT DEFAULT 6,
  
  -- Compromiso (anti-abuso)
  commitment_months INT DEFAULT 0,
  commitment_ends_at TIMESTAMPTZ,
  early_cancellation_penalty NUMERIC(10,2) DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subs_org ON subscriptions(organization_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
CREATE INDEX idx_subs_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subs_stripe_customer ON subscriptions(stripe_customer_id);

-- Tabla de créditos de asamblea
CREATE TABLE IF NOT EXISTS organization_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Créditos
  credits_available INT DEFAULT 0,
  credits_used_this_period INT DEFAULT 0,
  credits_total_accumulated INT DEFAULT 0,  -- Total histórico
  credits_expire_at TIMESTAMPTZ,
  
  -- Tracking
  last_refill_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id)  -- 1 registro por org
);

CREATE INDEX idx_credits_org ON organization_credits(organization_id);
CREATE INDEX idx_credits_expire ON organization_credits(credits_expire_at);

-- Tabla de solicitudes de pago manual
CREATE TABLE IF NOT EXISTS manual_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Datos de la solicitud
  plan_tier TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('ACH', 'YAPPY', 'TRANSFER')),
  
  -- Contacto
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  notes TEXT,
  
  -- Estado
  status TEXT CHECK (status IN (
    'PENDING',            -- Esperando revisión de Henry
    'INSTRUCTIONS_SENT',  -- Henry envió instrucciones de pago
    'PROOF_UPLOADED',     -- Cliente adjuntó comprobante
    'APPROVED',           -- Henry aprobó y activó
    'REJECTED'            -- Henry rechazó
  )) DEFAULT 'PENDING',
  
  -- Comprobante de pago
  proof_file_url TEXT,
  proof_uploaded_at TIMESTAMPTZ,
  
  -- Aprobación
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manual_requests_org ON manual_payment_requests(organization_id);
CREATE INDEX idx_manual_requests_status ON manual_payment_requests(status);
CREATE INDEX idx_manual_requests_pending ON manual_payment_requests(status) WHERE status = 'PENDING';

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Datos de la factura
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  description TEXT,
  
  -- Estado
  status TEXT CHECK (status IN (
    'DRAFT',     -- Borrador
    'OPEN',      -- Pendiente de pago
    'PAID',      -- Pagado
    'VOID',      -- Anulado
    'UNCOLLECTIBLE'  -- Incobrable
  )) DEFAULT 'OPEN',
  
  -- Fechas
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  
  -- Stripe
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_hosted_invoice_url TEXT,  -- URL de Stripe para pago
  
  -- PDF
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_sub ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_stripe_invoice ON invoices(stripe_invoice_id);

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_month TEXT;
  v_count INT;
  v_number TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_month := TO_CHAR(CURRENT_DATE, 'MM');
  
  SELECT COUNT(*) + 1 INTO v_count
  FROM invoices
  WHERE EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    AND EXTRACT(MONTH FROM issue_date) = EXTRACT(MONTH FROM CURRENT_DATE);
  
  v_number := 'INV-' || v_year || v_month || '-' || LPAD(v_count::TEXT, 4, '0');
  
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar número de factura
CREATE OR REPLACE FUNCTION set_invoice_number() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Función para consumir crédito
CREATE OR REPLACE FUNCTION consume_credit(
  p_organization_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_credits INT;
BEGIN
  SELECT credits_available INTO v_credits
  FROM organization_credits
  WHERE organization_id = p_organization_id
  FOR UPDATE;
  
  IF v_credits > 0 THEN
    UPDATE organization_credits
    SET 
      credits_available = credits_available - 1,
      credits_used_this_period = credits_used_this_period + 1,
      last_used_at = NOW()
    WHERE organization_id = p_organization_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para recargar créditos mensuales
CREATE OR REPLACE FUNCTION refill_monthly_credits() RETURNS VOID AS $$
BEGIN
  UPDATE organization_credits oc
  SET 
    credits_available = LEAST(
      credits_available + s.credits_per_period,
      s.credits_per_period * s.credits_rollover_months  -- Máx acumulable
    ),
    credits_used_this_period = 0,
    last_refill_at = NOW()
  FROM subscriptions s
  WHERE oc.subscription_id = s.id
    AND s.status = 'ACTIVE'
    AND s.billing_cycle = 'monthly'
    AND s.credits_per_period > 0
    AND (
      oc.last_refill_at IS NULL 
      OR oc.last_refill_at < DATE_TRUNC('month', CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;

-- Job mensual para recargar créditos (ejecutar con pg_cron o script externo)
-- Ejecutar el 1ro de cada mes: SELECT refill_monthly_credits();
```

**Ejecutar:**
```bash
docker exec -i assembly-db psql -U postgres -d assembly < sql_snippets/schema_subscriptions.sql
```

---

### **Tarea 7.2: Integrar Stripe**

**Instalardependencias:**
```bash
npm install stripe @stripe/stripe-js
```

**Archivo:** `src/lib/stripe.ts` (NUEVO)

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',  // Usar versión latest
});

// Precios de Stripe (crear en Dashboard de Stripe)
export const STRIPE_PRICES = {
  EVENTO_UNICO: process.env.STRIPE_PRICE_EVENTO_UNICO!,  // price_xxx
  DUO_PACK: process.env.STRIPE_PRICE_DUO_PACK!,
  STANDARD: process.env.STRIPE_PRICE_STANDARD!,
  MULTI_PH: process.env.STRIPE_PRICE_MULTI_PH!,
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE!,
};

// Mapeo de planes a precios
export function getPlanPrice(plan: string): number {
  const prices: Record<string, number> = {
    EVENTO_UNICO: 225,
    DUO_PACK: 389,
    STANDARD: 189,
    MULTI_PH: 699,
    ENTERPRISE: 2499,
  };
  return prices[plan] || 0;
}

// Mapeo de billing_cycle
export function getBillingCycle(plan: string): string {
  if (plan === 'EVENTO_UNICO' || plan === 'DUO_PACK') {
    return 'one-time';
  }
  return 'monthly';
}
```

**Agregar en `.env`:**
```bash
# ============================================
# PASARELAS DE PAGO (3 automáticas)
# ============================================

# Stripe (Tarjetas internacionales) - dashboard.stripe.com
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs de Stripe (crear productos en Stripe Dashboard)
STRIPE_PRICE_EVENTO_UNICO=price_xxx
STRIPE_PRICE_DUO_PACK=price_xxx
STRIPE_PRICE_STANDARD=price_xxx
STRIPE_PRICE_MULTI_PH=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx

# PayPal (Tarjetas + PayPal wallet) - developer.paypal.com
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=sandbox  # o 'live' en producción
PAYPAL_WEBHOOK_ID=xxx

# Tilopay (Centroamérica - tarjetas locales) - tilopay.com
TILOPAY_API_KEY=xxx
TILOPAY_SECRET_KEY=xxx
TILOPAY_MERCHANT_ID=xxx
TILOPAY_WEBHOOK_SECRET=xxx
TILOPAY_MODE=sandbox  # o 'production'
```

---

### **Tarea 7.3: API Routes - Suscripción**

**Archivo:** `src/app/api/subscription/create-checkout/route.ts` (NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES, getPlanPrice, getBillingCycle } from '@/lib/stripe';
import { sql } from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const session = verifySession(token!);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { plan_tier, payment_method } = await req.json();

    // Validar plan
    if (!['EVENTO_UNICO', 'DUO_PACK', 'STANDARD', 'MULTI_PH', 'ENTERPRISE'].includes(plan_tier)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
    }

    // Obtener organización del usuario
    const [org] = await sql`
      SELECT id, name FROM organizations WHERE id = (
        SELECT organization_id FROM organization_users WHERE user_id = ${session.userId} LIMIT 1
      )
    `;

    if (!org) {
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 });
    }

    // FLUJO AUTOMÁTICO CON STRIPE
    if (payment_method === 'STRIPE_CARD') {
      // Crear/obtener Stripe Customer
      let [existing_sub] = await sql`
        SELECT stripe_customer_id FROM subscriptions 
        WHERE organization_id = ${org.id} AND stripe_customer_id IS NOT NULL
        LIMIT 1
      `;

      let customerId = existing_sub?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: session.email,
          name: org.name,
          metadata: {
            organization_id: org.id,
            user_id: session.userId,
          },
        });
        customerId = customer.id;
      }

      // Crear Stripe Checkout Session
      const checkout_session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: plan_tier === 'EVENTO_UNICO' || plan_tier === 'DUO_PACK' ? 'payment' : 'subscription',
        line_items: [
          {
            price: STRIPE_PRICES[plan_tier],
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard/admin-ph/subscription?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/admin-ph/subscription?cancelled=true`,
        metadata: {
          organization_id: org.id,
          plan_tier,
        },
      });

      return NextResponse.json({ checkout_url: checkout_session.url });
    }

    // FLUJO MANUAL (ACH/YAPPY/TRANSFER)
    if (['MANUAL_ACH', 'MANUAL_YAPPY', 'MANUAL_TRANSFER'].includes(payment_method)) {
      // Crear solicitud de pago manual
      const [manual_request] = await sql`
        INSERT INTO manual_payment_requests (
          organization_id,
          plan_tier,
          amount,
          payment_method,
          contact_email
        )
        VALUES (
          ${org.id},
          ${plan_tier},
          ${getPlanPrice(plan_tier)},
          ${payment_method.replace('MANUAL_', '')},
          ${session.email}
        )
        RETURNING *
      `;

      // TODO: Notificar a Henry por email/WhatsApp
      // await sendNotificationToHenry(manual_request);

      return NextResponse.json({ 
        success: true, 
        message: 'Solicitud enviada. Te contactaremos en 1-2 días hábiles.',
        request_id: manual_request.id
      });
    }

    return NextResponse.json({ error: 'Método de pago no soportado' }, { status: 400 });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: 'Error al crear checkout' }, { status: 500 });
  }
}
```

---

**Archivo:** `src/app/api/subscription/route.ts` (NUEVO)

```typescript
// GET /api/subscription - Obtener suscripción actual
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const session = verifySession(token!);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [org_user] = await sql`
      SELECT organization_id FROM organization_users WHERE user_id = ${session.userId} LIMIT 1
    `;

    const [subscription] = await sql`
      SELECT * FROM subscriptions WHERE organization_id = ${org_user.organization_id}
      ORDER BY created_at DESC LIMIT 1
    `;

    if (!subscription) {
      return NextResponse.json({ error: 'Sin suscripción' }, { status: 404 });
    }

    // Obtener créditos
    const [credits] = await sql`
      SELECT * FROM organization_credits WHERE organization_id = ${org_user.organization_id}
    `;

    return NextResponse.json({ subscription, credits });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Error al obtener suscripción' }, { status: 500 });
  }
}
```

---

### **Tarea 7.4: Webhook de Stripe**

**Archivo:** `src/app/api/webhooks/stripe/route.ts` (NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sql } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Manejar eventos
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { organization_id, plan_tier } = session.metadata!;

  if (session.mode === 'subscription') {
    // Suscripción mensual
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await sql`
      INSERT INTO subscriptions (
        organization_id,
        plan_tier,
        status,
        payment_method,
        price_amount,
        billing_cycle,
        current_period_start,
        current_period_end,
        stripe_subscription_id,
        stripe_customer_id,
        credits_per_period,
        commitment_months
      )
      VALUES (
        ${organization_id},
        ${plan_tier},
        'ACTIVE',
        'STRIPE_CARD',
        ${(subscription.items.data[0].price.unit_amount || 0) / 100},
        'monthly',
        TO_TIMESTAMP(${subscription.current_period_start}),
        TO_TIMESTAMP(${subscription.current_period_end}),
        ${subscription.id},
        ${subscription.customer as string},
        ${plan_tier === 'STANDARD' ? 2 : 0},
        ${plan_tier === 'STANDARD' ? 2 : 0}
      )
    `;

    // Crear créditos iniciales si aplica
    if (plan_tier === 'STANDARD') {
      await sql`
        INSERT INTO organization_credits (organization_id, credits_available)
        VALUES (${organization_id}, 2)
        ON CONFLICT (organization_id) DO UPDATE SET credits_available = 2
      `;
    }
  } else {
    // Pago único (EVENTO_UNICO, DUO_PACK)
    const credits = plan_tier === 'EVENTO_UNICO' ? 1 : 2;

    await sql`
      INSERT INTO subscriptions (
        organization_id,
        plan_tier,
        status,
        payment_method,
        price_amount,
        billing_cycle,
        stripe_customer_id
      )
      VALUES (
        ${organization_id},
        ${plan_tier},
        'ACTIVE',
        'STRIPE_CARD',
        ${session.amount_total! / 100},
        'one-time',
        ${session.customer as string}
      )
    `;

    await sql`
      INSERT INTO organization_credits (
        organization_id,
        credits_available,
        credits_expire_at
      )
      VALUES (
        ${organization_id},
        ${credits},
        NOW() + INTERVAL '12 months'
      )
      ON CONFLICT (organization_id) 
      DO UPDATE SET credits_available = organization_credits.credits_available + ${credits}
    `;
  }

  console.log(`✅ Suscripción activada para org: ${organization_id}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Registrar factura como pagada
  await sql`
    UPDATE invoices
    SET status = 'PAID', paid_at = NOW()
    WHERE stripe_invoice_id = ${invoice.id}
  `;

  // TODO: Enviar email de confirmación
  console.log(`✅ Factura pagada: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Marcar suscripción como PAST_DUE
  await sql`
    UPDATE subscriptions
    SET status = 'PAST_DUE'
    WHERE stripe_customer_id = ${invoice.customer as string}
  `;

  // TODO: Enviar email de alerta
  console.log(`⚠️ Pago fallido: ${invoice.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Actualizar datos de suscripción
  await sql`
    UPDATE subscriptions
    SET 
      current_period_end = TO_TIMESTAMP(${subscription.current_period_end}),
      status = ${subscription.status === 'active' ? 'ACTIVE' : subscription.status.toUpperCase()}
    WHERE stripe_subscription_id = ${subscription.id}
  `;
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Marcar como cancelada
  await sql`
    UPDATE subscriptions
    SET status = 'CANCELLED', cancelled_at = NOW()
    WHERE stripe_subscription_id = ${subscription.id}
  `;
}
```

**IMPORTANTE:** Configurar webhook en Stripe Dashboard:
```
1. Ir a: dashboard.stripe.com → Developers → Webhooks
2. Add endpoint: https://tudominio.com/api/webhooks/stripe
3. Seleccionar eventos:
   - checkout.session.completed
   - invoice.paid
   - invoice.payment_failed
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copiar "Signing secret" y agregarlo en .env como STRIPE_WEBHOOK_SECRET
```

---

### **Tarea 7.5: Página de Suscripción (Frontend)**

**Archivo:** `src/app/dashboard/admin-ph/subscription/page.tsx` (NUEVO)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Subscription {
  plan_tier: string;
  status: string;
  price_amount: number;
  current_period_end: string;
  payment_method: string;
}

interface Credits {
  credits_available: number;
  credits_used_this_period: number;
  credits_expire_at: string;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        setCredits(data.credits);
      }
    } catch (error) {
      toast.error('Error al cargar suscripción');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(plan: string) {
    try {
      const res = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan_tier: plan, 
          payment_method: 'STRIPE_CARD' 
        }),
      });

      const data = await res.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      toast.error('Error al procesar pago');
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">💳 Suscripción y Facturación</h1>

      {/* Card de plan actual */}
      {subscription && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">📦 Plan Actual</h2>
          <p className="text-2xl font-bold">{subscription.plan_tier}</p>
          <p className="text-gray-600">${subscription.price_amount}/mes</p>
          <p className={`mt-2 ${subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
            {subscription.status === 'ACTIVE' ? '✅ Activo' : '⚠️ ' + subscription.status}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Próximo pago: {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Card de créditos */}
      {credits && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">🎫 Créditos de Asamblea</h2>
          <p className="text-3xl font-bold mb-4">{credits.credits_available} disponibles</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${(credits.credits_used_this_period / (credits.credits_used_this_period + credits.credits_available)) * 100}%` }}
            />
          </div>
          <button
            onClick={() => {/* TODO: Modal comprar créditos */}}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ➕ Comprar Créditos Adicionales
          </button>
        </div>
      )}

      {/* Botones de upgrade */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">⬆️ Actualizar Plan</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleUpgrade('MULTI_PH')}
            className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50"
          >
            <h3 className="font-bold">Multi-PH</h3>
            <p className="text-2xl">$699/mes</p>
            <p className="text-sm text-gray-600">Asambleas ilimitadas</p>
          </button>
          <button
            onClick={() => handleUpgrade('ENTERPRISE')}
            className="p-4 border-2 border-purple-600 rounded-lg hover:bg-purple-50"
          >
            <h3 className="font-bold">Enterprise</h3>
            <p className="text-2xl">$2,499/mes</p>
            <p className="text-sm text-gray-600">Todo ilimitado + soporte 24/7</p>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **Checklist FASE 7:**

```
SQL:
[ ] Crear tablas: subscriptions, organization_credits, manual_payment_requests, invoices
[ ] Crear funciones: consume_credit(), refill_monthly_credits()
[ ] Testing: Verificar consumo de créditos

Stripe:
[ ] Crear cuenta Stripe (stripe.com)
[ ] Crear productos y precios en Dashboard
[ ] Configurar webhook endpoint
[ ] Agregar keys en .env

Backend:
[ ] Instalar stripe, @stripe/stripe-js
[ ] Crear src/lib/stripe.ts
[ ] API POST /api/subscription/create-checkout
[ ] API GET /api/subscription
[ ] API POST /api/webhooks/stripe
[ ] API POST /api/payment/manual-request

Frontend:
[ ] Crear src/app/dashboard/admin-ph/subscription/page.tsx
[ ] Integrar Stripe Elements
[ ] Modal para pagos manuales
[ ] Modal para comprar créditos

Testing:
[ ] Pago con TC de prueba (4242424242424242)
[ ] Webhook recibido correctamente
[ ] Suscripción activada en BD
[ ] Créditos agregados
[ ] Solicitud de pago manual funciona
[ ] Facturas generadas correctamente
```

---

**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Aprobado por:** Database Agent  
**Para:** Coder  
**Prioridad:** 🔴 ALTA (FASES 1-2-4) / 🟡 MEDIA (FASE 6) / 🔴 ALTA (FASE 7)

**Próximo paso:** Empezar con FASE 1 (Docker Local). 🚀

---

## Validación rápida (Landing)

- URL local: `http://localhost:3000`
- Objetivo: confirmar que la landing y el chatbot web cargan correctamente.
