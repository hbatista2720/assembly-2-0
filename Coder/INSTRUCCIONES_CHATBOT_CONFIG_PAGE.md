# 🤖 INSTRUCCIONES: Página de Configuración de Chatbots
## Para Admin Principal (Henry)

**Archivo a crear:** `src/app/platform-admin/chatbot-config/page.tsx`

**Prioridad:** 🔴 ALTA - Henry necesita configurar chatbots

---

## 🎯 **OBJETIVO:**

Crear una página donde Henry pueda:
1. ✅ Ver todos los chatbots (Telegram, WhatsApp, Web)
2. ✅ Editar prompts por contexto (landing, demo, soporte, residente)
3. ✅ Configurar parámetros IA (temperatura, max_tokens)
4. ✅ Activar/desactivar chatbots
5. ✅ Ver métricas (conversaciones, tasa de éxito)

---

## 📊 **TABLA EN BD (Validar si existe):**

```sql
-- Verificar si existe
SELECT * FROM information_schema.tables WHERE table_name = 'chatbot_config';

-- Si NO existe, crear:
CREATE TABLE IF NOT EXISTS chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador del chatbot
  bot_name TEXT UNIQUE NOT NULL, -- 'telegram', 'whatsapp', 'web'
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Configuración IA
  ai_model TEXT DEFAULT 'gemini-1.5-flash', -- 'gemini-1.5-flash', 'gpt-3.5-turbo', 'gpt-4'
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 500,
  
  -- Prompts por contexto (JSONB para flexibilidad)
  prompts JSONB DEFAULT '{}'::jsonb,
  /* Estructura:
  {
    "landing": "Eres Lex, asistente de Assembly 2.0...",
    "demo": "Eres el tutor de Assembly 2.0...",
    "soporte": "Eres soporte técnico...",
    "residente": "Ayudas a residentes a votar..."
  }
  */
  
  -- Métricas (actualizadas por triggers)
  total_conversations INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  avg_response_time_ms INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO chatbot_config (bot_name, is_active, prompts) VALUES
('telegram', true, '{
  "landing": "Eres Lex, asistente de Assembly 2.0. Califica leads y ofrece demos.",
  "demo": "Eres tutor de Assembly 2.0. Guía al usuario en el demo paso a paso.",
  "soporte": "Eres soporte técnico de Assembly 2.0. Resuelve dudas rápidamente.",
  "residente": "Ayudas a residentes a votar y ver información de asambleas."
}'::jsonb),
('whatsapp', false, '{
  "landing": "Eres Lex, asistente de Assembly 2.0. Califica leads y ofrece demos.",
  "soporte": "Eres soporte técnico de Assembly 2.0. Resuelve dudas rápidamente.",
  "residente": "Ayudas a residentes a votar y ver información de asambleas."
}'::jsonb),
('web', true, '{
  "landing": "Eres Lex, asistente de Assembly 2.0. Califica leads y ofrece demos.",
  "demo": "Eres tutor de Assembly 2.0. Guía al usuario en el demo paso a paso.",
  "soporte": "Eres soporte técnico de Assembly 2.0. Resuelve dudas rápidamente.",
  "residente": "Ayudas a residentes a votar y ver información de asambleas."
}'::jsonb)
ON CONFLICT (bot_name) DO NOTHING;

-- Índices
CREATE INDEX idx_chatbot_config_active ON chatbot_config(is_active);
```

---

## 🎨 **COMPONENTE REACT (COMPLETO):**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ChatbotConfig {
  id: string;
  bot_name: string;
  is_active: boolean;
  ai_model: string;
  temperature: number;
  max_tokens: number;
  prompts: {
    landing?: string;
    demo?: string;
    soporte?: string;
    residente?: string;
  };
  total_conversations: number;
  total_messages: number;
  success_rate: number;
}

const CONTEXT_LABELS: Record<string, string> = {
  landing: '🎯 Landing Page (Calificación de Leads)',
  demo: '🎓 Demo (Tutor Interactivo)',
  soporte: '🛠️ Soporte Técnico',
  residente: '👤 Residente (Votación)',
};

export default function ChatbotConfigPage() {
  const [configs, setConfigs] = useState<ChatbotConfig[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [editingContext, setEditingContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar configuración al montar
  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch('/api/chatbot/config');
      const data = await res.json();
      setConfigs(data);
      if (data.length > 0) setSelectedBot(data[0].bot_name);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const selectedConfig = configs.find(c => c.bot_name === selectedBot);
      
      const res = await fetch('/api/chatbot/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedConfig),
      });

      if (!res.ok) throw new Error('Error al guardar');

      toast.success('Configuración guardada exitosamente');
      fetchConfigs(); // Recargar
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(botName: string) {
    const config = configs.find(c => c.bot_name === botName);
    if (!config) return;

    try {
      await fetch('/api/chatbot/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          is_active: !config.is_active,
        }),
      });

      toast.success(`Chatbot ${config.is_active ? 'desactivado' : 'activado'}`);
      fetchConfigs();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  }

  function updatePrompt(context: string, value: string) {
    setConfigs(prev =>
      prev.map(config =>
        config.bot_name === selectedBot
          ? {
              ...config,
              prompts: { ...config.prompts, [context]: value },
            }
          : config
      )
    );
  }

  function updateConfig(field: keyof ChatbotConfig, value: any) {
    setConfigs(prev =>
      prev.map(config =>
        config.bot_name === selectedBot
          ? { ...config, [field]: value }
          : config
      )
    );
  }

  const selectedConfig = configs.find(c => c.bot_name === selectedBot);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🤖 Configuración de Chatbots</h1>
        <p className="text-gray-600 mt-2">
          Edita prompts, parámetros y activa/desactiva chatbots
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Lista de Chatbots */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Chatbots</h2>
            {configs.map(config => (
              <button
                key={config.bot_name}
                onClick={() => setSelectedBot(config.bot_name)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedBot === config.bot_name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold capitalize">{config.bot_name}</h3>
                    <p className="text-sm text-gray-500">
                      {config.total_conversations} conversaciones
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      config.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>

                {/* Métricas */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    <div>✅ Éxito: {config.success_rate}%</div>
                    <div>💬 Mensajes: {config.total_messages}</div>
                  </div>
                </div>

                {/* Toggle Active */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActive(config.bot_name);
                  }}
                  className={`mt-3 w-full py-2 px-4 rounded text-sm font-medium ${
                    config.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {config.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Configuración */}
        <div className="lg:col-span-3 space-y-6">
          {selectedConfig && (
            <>
              {/* Parámetros IA */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  ⚙️ Parámetros de IA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modelo IA
                    </label>
                    <select
                      value={selectedConfig.ai_model}
                      onChange={(e) => updateConfig('ai_model', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Gratis)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo ($)</option>
                      <option value="gpt-4">GPT-4 ($$$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperatura ({selectedConfig.temperature})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={selectedConfig.temperature}
                      onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = Preciso, 1 = Creativo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={selectedConfig.max_tokens}
                      onChange={(e) => updateConfig('max_tokens', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Longitud máxima de respuesta
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompts por Contexto */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📝 Prompts por Contexto
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Edita cómo responde el chatbot según la situación del usuario
                </p>

                <div className="space-y-6">
                  {Object.entries(selectedConfig.prompts).map(([context, prompt]) => (
                    <div key={context} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {CONTEXT_LABELS[context] || context}
                        </h3>
                        <button
                          onClick={() => setEditingContext(editingContext === context ? null : context)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {editingContext === context ? 'Cerrar' : 'Editar'}
                        </button>
                      </div>

                      {editingContext === context ? (
                        <textarea
                          value={prompt}
                          onChange={(e) => updatePrompt(context, e.target.value)}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                          placeholder="Escribe el prompt aquí..."
                        />
                      ) : (
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {prompt || <span className="text-gray-400">Sin prompt configurado</span>}
                        </p>
                      )}

                      {/* Ejemplo de uso */}
                      <div className="mt-3 text-xs text-gray-500 bg-blue-50 p-3 rounded">
                        <strong>Ejemplo de uso:</strong>{' '}
                        {context === 'landing' && 'Visitante anónimo pregunta: "¿Qué es Assembly 2.0?"'}
                        {context === 'demo' && 'Usuario en demo pregunta: "¿Cómo marco asistencia?"'}
                        {context === 'soporte' && 'Cliente pregunta: "No puedo cambiar el estado de pago"'}
                        {context === 'residente' && 'Residente pregunta: "¿Cómo voto?"'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
                <div>
                  <p className="text-sm text-gray-600">
                    Los cambios afectan inmediatamente al chatbot
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => fetchConfigs()}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 **API ROUTES:**

### **1. GET /api/chatbot/config (Obtener configuración)**

**Archivo:** `src/app/api/chatbot/config/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const configs = await sql`
      SELECT * FROM chatbot_config
      ORDER BY bot_name
    `;

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching chatbot config:', error);
    return NextResponse.json(
      { error: 'Error al cargar configuración' },
      { status: 500 }
    );
  }
}
```

---

### **2. PUT /api/chatbot/config (Actualizar configuración)**

```typescript
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { bot_name, is_active, ai_model, temperature, max_tokens, prompts } = body;

    const [updated] = await sql`
      UPDATE chatbot_config
      SET
        is_active = ${is_active},
        ai_model = ${ai_model},
        temperature = ${temperature},
        max_tokens = ${max_tokens},
        prompts = ${JSON.stringify(prompts)}::jsonb,
        updated_at = NOW()
      WHERE bot_name = ${bot_name}
      RETURNING *
    `;

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating chatbot config:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN:**

```
[ ] Verificar tabla chatbot_config existe en BD
[ ] Si no existe, ejecutar CREATE TABLE
[ ] Insertar configuración inicial (3 bots)
[ ] Crear página src/app/platform-admin/chatbot-config/page.tsx
[ ] Crear API GET /api/chatbot/config/route.ts
[ ] Crear API PUT /api/chatbot/config/route.ts
[ ] Instalar react-hot-toast: npm install react-hot-toast
[ ] Agregar link en dashboard admin:
    <a href="/platform-admin/chatbot-config">Configurar Chatbots</a>
[ ] Testing:
    [ ] Cargar página → ver 3 chatbots (Telegram, WhatsApp, Web)
    [ ] Desactivar Telegram → verificar estado cambia
    [ ] Editar prompt de "landing" → guardar → verificar persiste
    [ ] Cambiar temperatura → guardar → verificar persiste
[ ] Actualizar chatbot real para leer de esta tabla
    (modificar src/chatbot/index.ts para cargar prompts desde BD)
```

---

## 🔄 **ACTUALIZAR CHATBOT PARA USAR CONFIGURACIÓN:**

**Modificar:** `src/chatbot/index.ts`

```typescript
import TelegramBot from "node-telegram-bot-api";
import { sql } from "@/lib/db";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || "", { polling: true });

// Cargar configuración desde BD
async function getBotConfig() {
  const [config] = await sql`
    SELECT * FROM chatbot_config WHERE bot_name = 'telegram' AND is_active = TRUE
  `;
  return config;
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Obtener configuración actualizada
  const config = await getBotConfig();
  
  if (!config) {
    await bot.sendMessage(chatId, "Chatbot temporalmente desactivado.");
    return;
  }

  // Usar prompt desde configuración
  const prompt = config.prompts.landing || "Hola, soy Lex.";
  await bot.sendMessage(chatId, prompt, { parse_mode: "Markdown" });
});

console.log("🤖 Chatbot iniciado y leyendo configuración desde BD!");
```

---

**Henry, esta página te permite configurar TODO el chatbot sin tocar código.** 🚀

**¿El Coder debe implementar esto ahora?**
