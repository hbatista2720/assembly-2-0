# 🐳 TAREA 1: Configurar Supabase con Docker Local

**Para:** Agente Coder  
**Guiado por:** Agente Arquitecto  
**Tiempo estimado:** 15-30 minutos  
**Prioridad:** 🔴 CRÍTICA

---

## 📝 ¿QUÉ VAMOS A HACER?

El usuario (Henry) está trabajando con **Docker local**. Vamos a configurar:
1. **PostgreSQL** (base de datos) en Docker
2. **Supabase Studio** (interfaz visual) en Docker
3. **Next.js App** (ya existe, vamos a conectarlo)

**Ventajas de usar Docker local:**
✅ No necesitas cuenta en Supabase.com (gratis total)  
✅ Todo corre en la computadora del usuario  
✅ Más rápido para desarrollo  
✅ Sin límites de uso  

---

## ✅ PASO 1: Actualizar docker-compose.yml

### Instrucciones para el Coder:

Reemplaza el contenido completo de `docker-compose.yml` con esto:

```yaml
version: "3.9"

services:
  # Base de datos PostgreSQL
  db:
    image: postgres:15-alpine
    container_name: assembly-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: assembly_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Supabase Studio (interfaz visual)
  studio:
    image: supabase/studio:latest
    container_name: assembly-studio
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      SUPABASE_URL: http://kong:8000
      SUPABASE_REST_URL: http://localhost:8000/rest/v1/
      STUDIO_PG_META_URL: http://localhost:8080
      SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDg3NDg4MzB9.xxx
    depends_on:
      db:
        condition: service_healthy

  # Aplicación Next.js
  web:
    build: .
    container_name: assembly-web
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      # Base de datos local
      DATABASE_URL: postgresql://postgres:postgres@db:5432/assembly_db
      
      # Supabase local (sin auth real, simplificado para desarrollo)
      NEXT_PUBLIC_SUPABASE_URL: http://localhost:5432
      NEXT_PUBLIC_SUPABASE_ANON_KEY: local-development-key
      
      # WebAuthn
      MOCK_WEBAUTHN: "true"
      WEBAUTHN_RP_ID: localhost
      WEBAUTHN_RP_NAME: Assembly 2.0
      WEBAUTHN_ORIGIN: http://localhost:3001
      
      # Next.js
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
    command: npm run dev

volumes:
  postgres_data:
```

**¿Qué hace esto?**
- **db:** Crea PostgreSQL con tus datos
- **studio:** Interfaz visual para ver tablas (como Excel pero para BD)
- **web:** Tu aplicación Next.js conectada a la BD

**Checkpoint:**
- [ ] Coder reemplaza docker-compose.yml
- [ ] Arquitecto valida: Reviso que esté correcto

---

## ✅ PASO 2: Crear Archivo .env.local

### Instrucciones para el Coder:

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
# Base de datos PostgreSQL (Docker local)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/assembly_db

# Supabase simplificado (local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:5432
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-development-key

# WebAuthn (modo desarrollo)
MOCK_WEBAUTHN=true
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=Assembly 2.0
WEBAUTHN_ORIGIN=http://localhost:3001
```

**Checkpoint:**
- [ ] Coder crea .env.local
- [ ] Arquitecto valida

---

## ✅ PASO 3: Actualizar package.json

### Instrucciones para el Coder:

Agrega estos scripts en `package.json` (en la sección "scripts"):

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f web",
    "docker:restart": "docker-compose restart web",
    "docker:rebuild": "docker-compose up -d --build"
  }
}
```

**Checkpoint:**
- [ ] Coder actualiza package.json
- [ ] Arquitecto valida

---

## ✅ PASO 4: Crear lib/supabase.ts (versión simplificada)

### Instrucciones para el Coder:

Crea `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

// Para desarrollo local con Docker
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:5432'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'local-development-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función auxiliar para queries directas a PostgreSQL
export async function queryDB(sql: string, params: any[] = []) {
  // En desarrollo local, usamos conexión directa
  const { Pool } = await import('pg')
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  
  try {
    const result = await pool.query(sql, params)
    await pool.end()
    return result.rows
  } catch (error) {
    console.error('Error en query:', error)
    await pool.end()
    throw error
  }
}

// Test de conexión
export async function testConnection() {
  try {
    const result = await queryDB('SELECT NOW() as time')
    console.log('✅ Base de datos conectada:', result[0].time)
    return true
  } catch (error) {
    console.error('❌ Error conectando a BD:', error)
    return false
  }
}
```

**Checkpoint:**
- [ ] Coder crea src/lib/supabase.ts
- [ ] Arquitecto valida

---

## ✅ PASO 5: Instalar Dependencias

### Instrucciones para el Coder:

```bash
npm install @supabase/supabase-js pg
```

**¿Qué instalamos?**
- `@supabase/supabase-js`: Cliente de Supabase
- `pg`: Driver de PostgreSQL para Node.js

**Checkpoint:**
- [ ] Coder ejecuta npm install
- [ ] Coder confirma: "Dependencias instaladas"

---

## ✅ PASO 6: Iniciar Docker

### Instrucciones para el Usuario (Henry):

Abre la terminal y ejecuta:

```bash
docker-compose up -d
```

**¿Qué hace esto?**
Inicia 3 contenedores:
1. **PostgreSQL** (base de datos) en puerto 5432
2. **Studio** (interfaz visual) en puerto 3000
3. **Web** (tu app) en puerto 3001

**Espera 30-60 segundos** (primera vez descarga imágenes)

**Deberías ver:**
```
✔ Container assembly-db      Started
✔ Container assembly-studio  Started
✔ Container assembly-web     Started
```

**Checkpoint:**
- [ ] Usuario ejecuta docker-compose up -d
- [ ] Usuario confirma: "3 contenedores iniciados"
- [ ] Arquitecto valida: Reviso que no haya errores

---

## ✅ PASO 7: Verificar que TODO está corriendo

### Instrucciones para el Usuario (Henry):

Abre tu navegador y verifica:

1. **Aplicación Web:**
   - Ve a: http://localhost:3001
   - Deberías ver tu landing page

2. **Supabase Studio:**
   - Ve a: http://localhost:3000
   - Deberías ver interfaz de Supabase
   - Puedes ver tus tablas aquí

3. **Base de datos:**
   - Ejecuta: `docker exec -it assembly-db psql -U postgres -d assembly_db -c "SELECT COUNT(*) FROM legal_contexts;"`
   - Debería mostrar: `count: 1` (el registro de Panamá)

**Si algo no funciona:**
```bash
# Ver logs de los contenedores
docker-compose logs

# Ver logs solo de la app
docker-compose logs web

# Ver logs solo de la BD
docker-compose logs db
```

**Checkpoint:**
- [ ] Usuario confirma: "3 servicios funcionando"
- [ ] Arquitecto valida: Reviso que schema.sql se ejecutó

---

## ✅ PASO 8: Crear Página de Prueba

### Instrucciones para el Coder:

Crea `src/app/test-db/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { testConnection, queryDB } from '@/lib/supabase'

export default function TestDBPage() {
  const [status, setStatus] = useState('🔄 Probando conexión...')
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    async function test() {
      try {
        // Test conexión
        const connected = await testConnection()
        if (!connected) {
          setStatus('❌ Error de conexión')
          return
        }
        
        // Test query
        const contexts = await queryDB('SELECT * FROM legal_contexts')
        setStatus('✅ Base de datos funcionando correctamente')
        setData(contexts)
      } catch (error: any) {
        setStatus('❌ Error: ' + error.message)
      }
    }
    
    test()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🐳 Prueba Docker + PostgreSQL</h1>
      
      <div className="mb-6 p-4 rounded-lg bg-slate-800">
        <p className="text-xl">{status}</p>
      </div>
      
      {data && (
        <div className="bg-slate-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Datos de legal_contexts:</h2>
          <pre className="text-sm overflow-auto bg-slate-950 p-4 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 text-sm text-slate-400">
        <p>📍 PostgreSQL: localhost:5432</p>
        <p>📍 Supabase Studio: http://localhost:3000</p>
        <p>📍 Aplicación: http://localhost:3001</p>
      </div>
    </div>
  )
}
```

**Checkpoint:**
- [ ] Coder crea la página
- [ ] Arquitecto valida

---

## ✅ PASO 9: Probar TODO

### Instrucciones para el Usuario (Henry):

1. Ve a: http://localhost:3001/test-db
2. Deberías ver:
   - ✅ Base de datos funcionando correctamente
   - Datos de Panamá - Ley 284

**Si ves esto: ¡TAREA 1 COMPLETADA!** 🎉

**Checkpoint:**
- [ ] Usuario confirma: "Veo el mensaje verde"
- [ ] Usuario confirma: "Veo datos de Panamá"
- [ ] Arquitecto valida: TAREA 1 APROBADA ✅

---

## 🎯 COMANDOS ÚTILES

```bash
# Iniciar todo
docker-compose up -d

# Detener todo
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar solo la app (después de cambios de código)
docker-compose restart web

# Reconstruir todo (si cambias Dockerfile o package.json)
docker-compose up -d --build

# Ver contenedores corriendo
docker ps

# Entrar a la base de datos (psql)
docker exec -it assembly-db psql -U postgres -d assembly_db

# Borrar TODO y empezar de cero (¡cuidado!)
docker-compose down -v
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Port 5432 already in use"
**Solución:** Ya tienes PostgreSQL corriendo en tu máquina.
```bash
# Mac:
brew services stop postgresql

# Linux:
sudo systemctl stop postgresql
```

### Error: "Port 3000 already in use"
**Solución:** Cambia el puerto de Studio en docker-compose.yml:
```yaml
studio:
  ports:
    - "3002:3000"  # Cambia 3000 a 3002
```

### Error: "schema.sql not found"
**Solución:** Asegúrate que el archivo `schema.sql` existe en la raíz del proyecto.

### La app no se actualiza al cambiar código
**Solución:**
```bash
docker-compose restart web
```

### Quiero ver las tablas visualmente
**Solución:** Ve a http://localhost:3000 (Supabase Studio)

---

## 📊 RESUMEN DE LO QUE LOGRAMOS

✅ PostgreSQL corriendo en Docker (puerto 5432)  
✅ Supabase Studio corriendo (puerto 3000)  
✅ App Next.js conectada a BD (puerto 3001)  
✅ Schema SQL ejecutado automáticamente  
✅ Datos de prueba cargados (Panamá - Ley 284)  
✅ Página de prueba funcionando  

**TODO funciona 100% LOCAL, sin necesidad de internet** 🎉

---

## 🎯 SIGUIENTE TAREA

Una vez que veas el ✅ en http://localhost:3001/test-db, el **Arquitecto** te dará:

**TAREA 2:** Crear queries reales para reemplazar todos los mocks

---

**🚀 Agente Coder, puedes empezar con PASO 1**
