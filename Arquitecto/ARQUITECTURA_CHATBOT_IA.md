# 🤖 ARQUITECTURA DEL CHATBOT IA - ASSEMBLY 2.0
## Sistema de Asistencia Inteligente Multi-Contexto

---

## 🎯 OBJETIVO DEL CHATBOT

Crear un **asistente IA conversacional** que acompaña al usuario en todo su journey:

1. **Landing Page** → Convertir visitantes en leads calificados
2. **Registro** → Guiar el onboarding sin fricciones
3. **Demo** → Actuar como tutor interactivo
4. **Uso Post-Afiliación** → Soporte técnico y consultoría en vivo

---

## 📊 CONTEXTOS DEL CHATBOT (5 Personalidades)

El chatbot cambia su comportamiento según la etapa del usuario:

### **Contexto 1: Visitante Anónimo (Landing Page)**
**Objetivo**: Calificar el lead y guiarlo al Demo

**Personalidad**:
- Amigable pero profesional
- Hace preguntas para entender el perfil
- Proactivo en mostrar beneficios

**Ejemplo de Conversación**:
```
🤖 ¡Hola! Soy Lex, el asistente de Assembly 2.0. 
   ¿Eres administrador de PHs o trabajas con una promotora? 👋

👤 Soy administradora de 8 propiedades

🤖 ¡Perfecto! Imagino que hacer 8 asambleas al año consume 
   mucho tiempo entre preparación de actas, control de asistencia 
   y validación de quórums. ¿Te gustaría ver cómo reducimos 
   eso de 4 horas a 15 minutos por asamblea?

👤 Sí, suena bien

🤖 Genial. Te propongo esto:
   1️⃣ Te muestro un video de 2 min de una asamblea real
   2️⃣ O mejor, te activo un Demo GRATIS para que lo pruebes tú misma
   
   ¿Cuál prefieres? 🎯
```

**Preguntas de Calificación**:
- ¿Cuántos PHs administras? (segmenta el plan a recomendar)
- ¿Cuántas asambleas haces al año?
- ¿Cuál es tu mayor dolor hoy con las asambleas?
- ¿Tienes presupuesto aprobado o necesitas justificar la inversión?

**Acciones del Chatbot**:
- Guarda las respuestas en `leads_calificados` (tabla nueva)
- Si el lead está calificado → Ofrece Demo
- Si no está listo → Ofrece suscripción a newsletter con caso de éxito

---

### **Contexto 2: Registro de Demo (Onboarding)**
**Objetivo**: Completar el registro sin abandonos

**Personalidad**:
- Tutor paciente
- Anticipa dudas antes de que surjan
- Celebra cada paso completado

**Ejemplo de Conversación**:
```
🤖 ¡Perfecto! Vamos a activar tu Demo en 3 pasos simples:

   PASO 1: Tu email (será tu usuario)
   👉 Escribe tu correo corporativo

👤 maria@adminpropiedades.com

🤖 ✅ Listo. PASO 2: Verificación
   Te envié un PIN de 6 dígitos a tu email.
   📱 Revisa tu bandeja (puede tardar 30 segundos)
   
   💡 Tip: Si no lo ves, revisa Spam o Promociones

👤 El código es 482910

🤖 ✅ Verificado! PASO 3: Crea tu primera Propiedad de prueba
   
   Voy a crear un PH ficticio para que pruebes:
   📍 Nombre: "Edificio Demo Tower"
   🏢 Unidades: 50 (puedes cambiarlo después)
   
   ¿Te parece bien o prefieres personalizarlo ahora?
```

**Ayudas Contextuales**:
- Si el usuario tarda >2 min en verificar el email → "¿No llegó el código? Te reenvío uno nuevo"
- Si intenta usar email personal → "💡 Recomiendo usar tu email corporativo para que tus colegas puedan acceder después"

---

### **Contexto 3: Guía de Demo (Tutor Interactivo)**
**Objetivo**: Mostrar el valor de la plataforma en <10 minutos

**Personalidad**:
- Entusiasta pero no invasivo
- Enseña haciendo (no solo explicando)
- Detecta confusión y ofrece ayuda

**Ejemplo de Conversación**:
```
🤖 ¡Bienvenida a tu primera asamblea virtual! 👏
   
   Estás viendo el Dashboard de "Edificio Demo Tower".
   Te voy a guiar en 4 pasos para que veas la magia:

   🎯 PASO 1: Agregar Propietarios
   👉 Click en "Importar Excel" (subí uno de ejemplo)
   
   [Usuario hace click]

🤖 ✅ Excelente! Subiste 50 propietarios. 
   Fíjate que algunos están marcados "En Mora" 🔴
   
   Esos podrán asistir pero NO votar (Ley 284)
   
   🎯 PASO 2: Marcar Asistencia
   👉 Simula que 30 personas llegaron
   (En la realidad usarían Face ID desde su teléfono)
   
   [Usuario marca 30 asistentes]

🤖 🎉 ¡Mira el Quórum en tiempo real! Subió a 65%
   
   ¿Ves el medidor verde? 🟢
   Si baja del 51%, te alertaría en rojo 🔴
   
   🎯 PASO 3: Crear una Votación
   Prueba esto: "Aprobar aumento de cuota de $50 a $60"
   👉 Click en "+ Nueva Votación"
```

**Triggers Inteligentes**:
| Acción del Usuario | Reacción del Chatbot |
|-------------------|----------------------|
| Pasa >30 seg sin hacer nada | "¿Te perdiste? Te ayudo con el siguiente paso" |
| Intenta hacer algo fuera de orden | "💡 Primero necesitas [X] para poder hacer eso" |
| Completa un flujo completo | "🏆 ¡Lo lograste! Ahora viste cómo funciona una asamblea digital" |
| Hace click en "Salir" | "¿Segura? Te falta ver la parte más impresionante (Resultados en Tiempo Real)" |

**Métricas a Rastrear**:
- ¿Completó el tour completo? (Sí/No)
- ¿En qué paso abandonó? (para mejorar el onboarding)
- Tiempo en Demo (ideal: 8-12 minutos)

---

### **Contexto 4: Conversión (Cierre de Venta)**
**Objetivo**: Convertir Demo → Plan Pagado

**Personalidad**:
- Consultor de confianza
- Muestra ROI con datos reales
- No presiona, pero sí recuerda el valor

**Ejemplo de Conversación**:
```
🤖 ¡María, completaste el Demo! 🎉
   
   Déjame mostrarte algo interesante:
   
   📊 Con 8 asambleas al año y el Plan Standard:
   - Ahorras: 28 horas/año (valor: ~$840)
   - Evitas: 1-2 reclamos legales (~$3,000)
   - Costo del Plan: $99/mes x 12 = $1,188/año
   
   ✅ ROI: Recuperas la inversión con 1 solo reclamo evitado
   
   ¿Quieres activar el Plan Standard o prefieres 
   empezar con "Por Asamblea" ($49 por evento)?

👤 Me interesa Standard pero necesito aprobación

🤖 Perfecto, te ayudo. ¿Necesitas:
   a) Un PDF con el Business Case para tu jefe
   b) Una llamada de 15 min con nuestro equipo
   c) Extender el Demo 15 días más mientras decides
```

**Tácticas de Conversión**:
- Si seleccionó "Standard" pero no completa el pago → Email automático con recordatorio
- Si usó el Demo más de 3 veces → "Veo que te gustó. ¿Qué te falta para decidir?"
- Si compara con competencia → "¿Quieres ver nuestra comparativa vs [Competidor]?"

---

### **Contexto 5: Cliente Activo (Soporte + Consultoría)**
**Objetivo**: Reducir tickets de soporte y aumentar retención

**Personalidad**:
- Experto confiable
- Proactivo en sugerir mejoras
- Conecta con humanos cuando es necesario

**Ejemplo de Conversación**:
```
🤖 Hola María! Veo que tienes una asamblea 
   programada para mañana. ¿Todo listo? ✅

👤 Sí, pero tengo duda: ¿Cómo marco a alguien "En Mora"?

🤖 Claro! Te muestro:
   1. Ve a "Propietarios" → Busca la unidad
   2. Click en los 3 puntos (⋮) → "Editar Estado"
   3. Cambia "Al Día" → "En Mora"
   
   ⚠️ Eso hará que pueda asistir pero NO votar
   
   [Gif animado mostrando los pasos]
   
   ¿Listo o necesitas ayuda con otra cosa?

👤 ¿Y si ya votó y después me doy cuenta que está en mora?

🤖 ⚠️ Excelente pregunta (eso es crítico).
   
   Por ley, NO puedes invalidar un voto después.
   Por eso recomiendo:
   
   ✅ ANTES de la asamblea: Valida el estado de pago
   (Puedes importar un Excel desde tu sistema contable)
   
   💡 ¿Quieres que un asesor te ayude a configurar 
   esa integración? Es 1 llamada de 20 min.
```

**Casos de Uso de Soporte**:
| Pregunta Común | Respuesta del Chatbot |
|----------------|----------------------|
| "No sé cómo calcular el quórum" | [Explica el algoritmo + video] |
| "Un propietario no puede votar con Face ID" | [Troubleshooting: iPhone viejo? Safari? Permisos?] |
| "Necesito cambiar el resultado de una votación" | ⚠️ [Escala a humano: "Eso requiere autorización legal"] |
| "¿Puedo hacer 2 asambleas el mismo día?" | ✅ "Sí, en el Plan Pro. Tu plan actual es Standard [Upgrade?]" |

**Proactividad Inteligente**:
- Si detecta inactividad de 30 días → "Hace tiempo que no haces asambleas. ¿Todo bien o necesitas ayuda?"
- Si usa funciones básicas solamente → "💡 Sabías que puedes [función avanzada]? Te muestro"
- Antes de renovación → "Tu suscripción vence en 7 días. ¿Renovamos o tienes dudas?"

---

## 🛠️ STACK TECNOLÓGICO DEL CHATBOT

### 🤖 **MODELOS DE IA DISPONIBLES (Comparativa)**

| Proveedor | Modelo | Costo | Límite Gratis | Calidad | Recomendado |
|-----------|--------|-------|---------------|---------|-------------|
| **Google Gemini** | 1.5 Flash | **GRATIS** | 15 req/min, 1M tokens/día | ⭐⭐⭐⭐ Muy buena | ✅ **DEMO/MVP** |
| **Google Gemini** | 1.5 Pro | **GRATIS** | 2 req/min, 50 req/día | ⭐⭐⭐⭐⭐ Excelente | ✅ **DEMO avanzado** |
| **OpenAI** | GPT-3.5 Turbo | $0.002/conv | No gratis | ⭐⭐⭐ Buena | Producción económica |
| **OpenAI** | GPT-4 Turbo | $0.08/conv | No gratis | ⭐⭐⭐⭐⭐ Excelente | Producción premium |
| **Groq** | Llama 3 70B | **GRATIS** | 30 req/min | ⭐⭐⭐⭐ Muy buena + RÁPIDA | Alternativa gratis |

---

### 🎯 **RECOMENDACIÓN PARA TU FASE DE DEMO**

#### **Usar Google Gemini 1.5 Flash (100% GRATIS)**

**¿Por qué Gemini?**
- ✅ **Totalmente gratis** (sin tarjeta de crédito)
- ✅ Límite generoso: **1 millón de tokens/día** (suficiente para 500+ conversaciones)
- ✅ Calidad comparable a GPT-3.5 Turbo
- ✅ Respuestas rápidas (<2 segundos)
- ✅ API simple de usar (similar a OpenAI)
- ✅ Perfecto para validar el producto sin costos

**Cuando escales a producción:**
- Si <1,000 conversaciones/mes → **Gemini sigue siendo gratis**
- Si >1,000 conversaciones/mes → Evaluar entre:
  - Gemini de pago ($0.001/conv) = $10/mes por 10K conversaciones
  - OpenAI GPT-3.5 ($0.002/conv) = $20/mes por 10K conversaciones

---

### **Opción 1: Telegram Bot (Fase 1 - Más Simple)**
**Tecnología**: Telegram Bot API + **Google Gemini** (GRATIS)

**Pros**:
- ✅ Fácil de implementar (1 semana)
- ✅ No requiere frontend complejo
- ✅ Usuarios ya tienen Telegram instalado
- ✅ **100% gratis** (Telegram + Gemini)
- ✅ No necesitas tarjeta de crédito

**Contras**:
- ❌ Requiere que el usuario salga de la web
- ❌ Menos integrado con el flujo

**Implementación con Google Gemini (GRATIS)**:
```typescript
// src/lib/telegram/bot.ts
import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenerativeAI } from '@google/generative-ai';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Contextos del usuario (se guarda en Supabase)
interface UserContext {
  telegramId: string;
  stage: 'landing' | 'demo' | 'onboarding' | 'customer';
  leadData: {
    numPHs?: number;
    assembliesPerYear?: number;
    budget?: string;
  };
  sessionHistory: Array<{ role: string; content: string }>;
}

// Sistema de Prompts por Contexto
const SYSTEM_PROMPTS = {
  landing: `Eres Lex, asistente de Assembly 2.0. Tu objetivo es:
1. Calificar al lead (administrador o promotora, cuántos PHs, presupuesto)
2. Mostrar beneficios relevantes a su perfil
3. Guiarlo al Demo GRATIS

Personalidad: Amigable, profesional, orientado a resultados.
NO vendas directamente, educa y asesora.
Responde en español y de forma concisa (máximo 150 palabras).`,

  demo: `Eres el tutor de Assembly 2.0. El usuario está en el Demo.
Tu objetivo: Guiarlo en 4 pasos para que vea el valor en <10 minutos.

Pasos:
1. Importar propietarios
2. Marcar asistencia
3. Crear votación
4. Ver resultados en tiempo real

Si se pierde, ofrece ayuda. Si completa todo, felicítalo.
Responde en español, usa emojis y sé motivador.`,

  customer: `Eres el soporte técnico de Assembly 2.0. El usuario es cliente activo.
Tu objetivo: Resolver dudas técnicas rápidamente.

Capacidades:
- Explicar funciones con ejemplos
- Mostrar tutoriales (links a videos)
- Escalar a humano si es necesario (legal, bugs críticos)

Personalidad: Experto confiable, proactivo, claro.
Responde en español y de forma práctica.`
};

// Manejo de Mensajes
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  if (!userMessage) return;

  try {
    // Obtener contexto del usuario
    const userContext = await getUserContext(chatId);

    // Construir historial de conversación
    const conversationHistory = userContext.sessionHistory
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
      .join('\n');

    const prompt = `${SYSTEM_PROMPTS[userContext.stage]}

Historial de conversación:
${conversationHistory}

Usuario: ${userMessage}

Asistente:`;

    // Llamar a Gemini (GRATIS)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const botResponse = result.response.text();

    // Guardar historial
    await saveConversation(chatId, userMessage, botResponse);

    // Enviar respuesta
    await bot.sendMessage(chatId, botResponse, { parse_mode: 'Markdown' });

    // Lógica de Acciones Especiales
    if (botResponse.toLowerCase().includes('activar demo') || 
        botResponse.toLowerCase().includes('crear demo')) {
      // Crear cuenta de demo y enviar link
      const demoLink = await createDemoAccount(userContext.leadData.email);
      await bot.sendMessage(chatId, `🎉 Tu Demo está listo: ${demoLink}`);
    }

  } catch (error) {
    console.error('Error en chatbot:', error);
    await bot.sendMessage(chatId, 'Disculpa, tuve un problema técnico. ¿Puedes repetir tu pregunta?');
  }
});

// Funciones auxiliares
async function getUserContext(telegramId: number): Promise<UserContext> {
  // Buscar en Supabase
  const { data } = await supabase
    .from('chatbot_conversations')
    .select('*')
    .eq('telegram_id', telegramId.toString())
    .single();

  if (!data) {
    // Crear nuevo contexto
    const newContext: UserContext = {
      telegramId: telegramId.toString(),
      stage: 'landing',
      leadData: {},
      sessionHistory: []
    };
    
    await supabase.from('chatbot_conversations').insert({
      telegram_id: telegramId.toString(),
      stage: 'landing',
      session_id: `tg_${telegramId}_${Date.now()}`,
      messages: []
    });

    return newContext;
  }

  return {
    telegramId: data.telegram_id,
    stage: data.stage,
    leadData: data.lead_data || {},
    sessionHistory: data.messages || []
  };
}

async function saveConversation(
  telegramId: number, 
  userMessage: string, 
  botResponse: string
) {
  const { data: conversation } = await supabase
    .from('chatbot_conversations')
    .select('messages')
    .eq('telegram_id', telegramId.toString())
    .single();

  const updatedMessages = [
    ...(conversation?.messages || []),
    { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
    { role: 'assistant', content: botResponse, timestamp: new Date().toISOString() }
  ];

  await supabase
    .from('chatbot_conversations')
    .update({ 
      messages: updatedMessages,
      last_message_at: new Date().toISOString()
    })
    .eq('telegram_id', telegramId.toString());
}

async function createDemoAccount(email?: string): Promise<string> {
  // Lógica para crear cuenta de demo
  // (esto lo implementará el Coder en otra tarea)
  return 'https://assembly20.com/demo/xyz123';
}
```

---

### 📦 **Dependencias para package.json**:
```json
{
  "dependencies": {
    "node-telegram-bot-api": "^0.66.0",
    "@google/generative-ai": "^0.2.1",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@types/node-telegram-bot-api": "^0.64.0"
  }
}
```

---

### **Opción 2: Widget Web (Fase 2 - Más Integrado)**
**Tecnología**: React + OpenAI API + Embeddings (RAG)

**Pros**:
- ✅ Totalmente integrado en la web
- ✅ Puede interactuar con el DOM (mostrar elementos)
- ✅ Mejor UX (no sale de la página)

**Contras**:
- ❌ Más complejo de implementar (3-4 semanas)
- ❌ Requiere frontend avanzado

**Implementación**:
```typescript
// src/components/ChatbotWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { Message, ChatContext } from '@/lib/types/chatbot';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<ChatContext>('landing');

  // Detectar contexto automáticamente
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/demo')) setContext('demo');
    else if (path.includes('/register')) setContext('onboarding');
    else if (path.includes('/dashboard')) setContext('customer');
  }, []);

  // Mensaje de bienvenida automático
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(context);
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [isOpen, context]);

  const sendMessage = async (userMessage: string) => {
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Llamar a API
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        context: context,
        history: messages
      })
    });

    const data = await response.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

    // Si el bot sugiere una acción, ejecutarla
    if (data.action) {
      executeAction(data.action);
    }
  };

  const executeAction = (action: string) => {
    switch (action) {
      case 'open_demo':
        window.location.href = '/demo/register';
        break;
      case 'highlight_feature':
        // Resaltar elemento del DOM con animación
        document.querySelector('[data-feature="quorum"]')?.classList.add('pulse-highlight');
        break;
      case 'show_video':
        // Abrir modal con video tutorial
        openVideoModal('quorum-tutorial');
        break;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botón de Chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
      >
        💬 Chat con Lex
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-white w-96 h-[600px] rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white rounded-t-lg">
            <h3 className="font-bold">Lex - Asistente Assembly 2.0</h3>
            <p className="text-sm opacity-90">
              {context === 'landing' && 'Ayudándote a descubrir Assembly'}
              {context === 'demo' && 'Guiándote en el Demo'}
              {context === 'customer' && 'Soporte en línea'}
            </p>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              className="w-full p-2 border rounded-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### **Opción 3: RAG con Embeddings (Fase 3 - Más Preciso)**
**Objetivo**: Que el chatbot responda con información exacta de la documentación

**Tecnología**: OpenAI Embeddings + Vector Database (Pinecone o Supabase pgvector)

**Flujo**:
1. Pre-procesar toda la documentación (esta que estamos creando)
2. Convertirla en embeddings (vectores)
3. Guardarla en Supabase con extensión `pgvector`
4. Cuando el usuario pregunta → Buscar fragmentos relevantes
5. Pasarlos como contexto a GPT-4

**Implementación**:
```sql
-- En schema.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE chatbot_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  source TEXT, -- 'docs', 'faq', 'legal'
  embedding vector(1536), -- OpenAI ada-002 genera 1536 dimensiones
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida
CREATE INDEX ON chatbot_knowledge_base USING ivfflat (embedding vector_cosine_ops);
```

```typescript
// src/lib/chatbot/rag.ts
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function answerWithRAG(userQuestion: string) {
  // 1. Convertir pregunta en embedding
  const questionEmbedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: userQuestion
  });

  const embedding = questionEmbedding.data[0].embedding;

  // 2. Buscar fragmentos relevantes en la base de conocimiento
  const { data: relevantDocs } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.78,
    match_count: 3
  });

  // 3. Construir contexto con los fragmentos
  const context = relevantDocs.map(doc => doc.content).join('\n\n');

  // 4. Generar respuesta con GPT-4
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `Eres Lex, asistente de Assembly 2.0. 
Responde basándote ÚNICAMENTE en el siguiente contexto de nuestra documentación:

${context}

Si la pregunta no está en el contexto, di: "No tengo esa información, ¿quieres que te conecte con un asesor?"`
      },
      { role: 'user', content: userQuestion }
    ]
  });

  return completion.choices[0].message.content;
}

// Función SQL para búsqueda de vectores
/*
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  FROM chatbot_knowledge_base
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
*/
```

---

## 📊 ARQUITECTURA DE DATOS DEL CHATBOT

### **Nueva Tabla: `chatbot_conversations`**
```sql
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuario (puede ser anónimo si está en landing)
  user_id UUID REFERENCES auth.users(id) NULL,
  telegram_id TEXT NULL,
  session_id TEXT NOT NULL, -- Para visitantes anónimos
  
  -- Contexto
  stage TEXT NOT NULL CHECK (stage IN ('landing', 'onboarding', 'demo', 'customer', 'support')),
  
  -- Conversación
  messages JSONB NOT NULL DEFAULT '[]', -- Array de {role, content, timestamp}
  
  -- Metadata para Analytics
  lead_qualified BOOLEAN DEFAULT FALSE,
  converted_to_demo BOOLEAN DEFAULT FALSE,
  converted_to_paid BOOLEAN DEFAULT FALSE,
  
  -- Datos de Calificación
  lead_data JSONB NULL, -- {numPHs, assembliesPerYear, budget, painPoints}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chatbot_session ON chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_stage ON chatbot_conversations(stage);
CREATE INDEX idx_chatbot_qualified ON chatbot_conversations(lead_qualified) WHERE lead_qualified = TRUE;
```

### **Nueva Tabla: `chatbot_actions`**
```sql
CREATE TABLE chatbot_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chatbot_conversations(id),
  
  -- Acción ejecutada
  action_type TEXT NOT NULL, -- 'demo_created', 'video_shown', 'human_escalation', 'upgrade_suggested'
  action_data JSONB NULL,
  
  -- Resultado
  success BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 FLUJO DE IMPLEMENTACIÓN (Para el Coder)

### **FASE 1: Telegram Bot Básico (1-2 semanas)**
1. Crear bot en Telegram con @BotFather
2. Implementar conexión con OpenAI GPT-4
3. Sistema de contextos (landing, demo, customer)
4. Guardar conversaciones en Supabase
5. Integrar con sistema de Demos (crear cuenta automática)

### **FASE 2: Widget Web (3-4 semanas)**
1. Componente React del chatbot
2. API endpoint `/api/chatbot` con rate limiting
3. Detección automática de contexto
4. Acciones interactivas (resaltar elementos, abrir modals)
5. Persistencia de conversaciones

### **FASE 3: RAG con Embeddings (2-3 semanas)**
1. Configurar `pgvector` en Supabase
2. Script para convertir docs → embeddings
3. Función SQL de búsqueda semántica
4. Integrar RAG con el chatbot existente
5. Dashboard de Analytics de conversaciones

---

## 📊 MÉTRICAS CLAVE DEL CHATBOT

### **Para Marketing**:
| Métrica | Objetivo |
|---------|----------|
| Conversaciones iniciadas | >40% de visitantes |
| Leads calificados | >60% de conversaciones |
| Conversión Demo | >30% de leads calificados |
| Conversión Pago | >40% de demos activados |

### **Para Producto**:
| Métrica | Objetivo |
|---------|----------|
| Tiempo promedio de conversación | 3-5 minutos |
| Tasa de abandono | <20% |
| Escalaciones a humano | <10% (significa que el bot resuelve el 90%) |
| Satisfacción (CSAT) | >4.5/5 |

### **Para Soporte**:
| Métrica | Objetivo |
|---------|----------|
| Tickets resueltos por bot | >70% |
| Tiempo de primera respuesta | <10 segundos |
| Preguntas sin respuesta | <5% (para mejorar knowledge base) |

---

## 🔑 CÓMO OBTENER LAS API KEYS (PASO A PASO)

### **1. Google Gemini API Key (GRATIS - Recomendado para Demo)**

**Pasos:**
1. Ve a: https://aistudio.google.com/app/apikey
2. Haz clic en "Get API Key"
3. Selecciona "Create API key in new project" (o usa un proyecto existente)
4. Copia la API key (formato: `AIza...`)
5. Guárdala en tu `.env`:
   ```bash
   GEMINI_API_KEY=AIzaSy...tu-key-aqui
   ```

**Límites Gratuitos:**
- **Gemini 1.5 Flash**: 15 requests/minuto, 1 millón tokens/día
- **Gemini 1.5 Pro**: 2 requests/minuto, 50 requests/día

✅ **Suficiente para 500+ conversaciones/día SIN PAGAR NADA**

---

### **2. Telegram Bot Token (GRATIS)**

**Pasos:**
1. Abre Telegram y busca **@BotFather**
2. Envía el comando: `/newbot`
3. Elige un nombre: "Assembly 2.0 Assistant"
4. Elige un username: `assembly20_bot` (debe terminar en `_bot`)
5. Copia el token (formato: `123456789:ABC...`)
6. Guárdalo en tu `.env`:
   ```bash
   TELEGRAM_BOT_TOKEN=123456789:ABC...tu-token
   ```

**Configuraciones adicionales:**
- Descripción: `/setdescription` → "Asistente inteligente de Assembly 2.0"
- Comandos: `/setcommands` → 
  ```
  start - Iniciar conversación
  demo - Activar Demo GRATIS
  ayuda - Ver opciones de ayuda
  ```

---

### **3. OpenAI API Key (OPCIONAL - Solo si escalas mucho)**

**Pasos:**
1. Ve a: https://platform.openai.com/api-keys
2. Crea una cuenta (requiere tarjeta de crédito)
3. Clic en "Create new secret key"
4. Copia la key (formato: `sk-...`)
5. Guárdala en tu `.env`:
   ```bash
   OPENAI_API_KEY=sk-...tu-key
   ```

**Costos:**
- GPT-3.5 Turbo: $0.50 por 1M tokens input, $1.50 por 1M tokens output
- GPT-4 Turbo: $10 por 1M tokens input, $30 por 1M tokens output

**Nota:** Solo usar OpenAI si necesitas:
- Calidad superior a Gemini
- Más de 1M tokens/día
- Funciones avanzadas (function calling)

---

## 💰 COSTOS COMPARATIVOS

### **Fase Demo/MVP (0-1,000 conversaciones/día)**

| Proveedor | Costo Mensual | Límite Gratis | Recomendación |
|-----------|---------------|---------------|---------------|
| **Google Gemini Flash** | **$0/mes** | 1M tokens/día | ✅ **USAR ESTE** |
| Google Gemini Pro | $0/mes | 50 req/día | Solo si necesitas más calidad |
| OpenAI GPT-3.5 | ~$60/mes | No hay | Solo si Gemini no funciona |
| OpenAI GPT-4 | ~$2,400/mes | No hay | ❌ Muy caro para demo |
| Groq (Llama 3) | $0/mes | 30 req/min | Alternativa rápida |

---

### **Fase Producción (>10,000 conversaciones/mes)**

**Escenario 1: Gemini de Pago**
- 10,000 conversaciones x 2,000 tokens promedio = 20M tokens/mes
- Gemini 1.5 Flash: $0.075 por 1M tokens = **$1.50/mes**

**Escenario 2: OpenAI GPT-3.5**
- 10,000 conversaciones x 2,000 tokens = 20M tokens/mes
- Input (800 tokens): $0.50 x 16 = $8
- Output (1,200 tokens): $1.50 x 24 = $36
- **Total: ~$44/mes**

**Escenario 3: OpenAI GPT-4 Turbo**
- Mismo cálculo: **~$880/mes** ❌ Muy caro

---

### **Embeddings para RAG (Fase 3)**

| Opción | Costo Setup | Costo por Query | Recomendación |
|--------|-------------|-----------------|---------------|
| **Gemini Embeddings** | **GRATIS** | **$0** | ✅ Mejor opción |
| OpenAI Ada-002 | $0.007 | $0.00002 | Backup si Gemini falla |
| Supabase pgvector | Incluido | $0 | Gratis con plan DB |

---

### **Resumen de Costos para Assembly 2.0**

| Fase | Usuarios/Día | Conv/Mes | Costo IA | Costo Telegram | Total |
|------|--------------|----------|----------|----------------|-------|
| **Demo (Mes 1-3)** | 10-50 | 300-1,500 | **$0** (Gemini) | $0 | **$0/mes** ✅ |
| **Piloto (Mes 4-6)** | 100-200 | 3,000-6,000 | **$0** (Gemini) | $0 | **$0/mes** ✅ |
| **Producción (Mes 7+)** | 500+ | 15,000+ | $2-5 (Gemini) | $0 | **$2-5/mes** ✅ |

**Reducción esperada en costos de soporte humano**: 
- 1 agente de soporte cuesta ~$1,500/mes
- El chatbot resuelve 70% de tickets
- **Ahorro neto: ~$1,000/mes**
- **ROI: 200x** (gastas $5, ahorras $1,000)

---

## 🚀 PLAN DE IMPLEMENTACIÓN RECOMENDADO

### **FASE 1: Telegram Bot con Gemini (1-2 semanas) - GRATIS ✅**

**Tecnologías:**
- Telegram Bot API (gratis)
- Google Gemini 1.5 Flash (gratis, 1M tokens/día)
- Supabase para persistencia (plan gratuito suficiente)

**Ventajas:**
- ✅ **Costo: $0/mes**
- ✅ Implementación rápida (1-2 semanas)
- ✅ Validación real con usuarios
- ✅ Ajuste de prompts sin costo
- ✅ No requiere frontend complejo

**Entregables:**
1. Bot funcional en Telegram
2. 5 contextos implementados (landing, demo, onboarding, conversión, soporte)
3. Integración con Supabase (guardar conversaciones)
4. Dashboard de analytics básico

---

### **FASE 2: Widget Web (3-4 semanas después)**

Una vez validado el bot en Telegram y ajustados los prompts, migrar a widget web integrado en la landing page.

**Reutilización:**
- Mismos prompts de Gemini
- Misma lógica de contextos
- Solo cambiar interfaz (Telegram → React)

---

### **FASE 3: RAG con Embeddings (Opcional, cuando escalas)**

Cuando tengas mucha documentación y necesites respuestas ultra-precisas.

---

## 📝 VARIABLES DE ENTORNO NECESARIAS

Crear archivo `.env.local`:

```bash
# Telegram (GRATIS - obligatorio)
TELEGRAM_BOT_TOKEN=123456789:ABC...  # Obtener de @BotFather

# Google Gemini (GRATIS - obligatorio para Demo)
GEMINI_API_KEY=AIza...  # Obtener de https://aistudio.google.com/app/apikey

# Supabase (plan gratuito suficiente)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...  # Solo para operaciones admin

# OpenAI (OPCIONAL - solo si migras en futuro)
# OPENAI_API_KEY=sk-...  # Comentado por ahora

# Entorno
NODE_ENV=development
```

---

## ✅ CHECKLIST PARA EL CODER

### **Setup Inicial (30 min)**
- [ ] Crear bot en Telegram con @BotFather
- [ ] Obtener API key de Gemini (gratis)
- [ ] Crear archivo `.env.local` con las keys
- [ ] Instalar dependencias: `npm install node-telegram-bot-api @google/generative-ai`

### **Implementación Backend (1 semana)**
- [ ] Crear tablas en Supabase (`chatbot_conversations`, `chatbot_actions`)
- [ ] Implementar archivo `src/lib/telegram/bot.ts`
- [ ] Implementar funciones auxiliares (`getUserContext`, `saveConversation`)
- [ ] Configurar 5 prompts de contexto
- [ ] Manejar errores y rate limiting

### **Lógica de Contextos (3 días)**
- [ ] Detectar cambio de contexto (landing → demo → customer)
- [ ] Implementar calificación de leads
- [ ] Implementar acciones especiales (crear demo, enviar links)
- [ ] Guardar lead_data en Supabase

### **Testing (2 días)**
- [ ] Probar conversaciones en cada contexto
- [ ] Ajustar prompts según respuestas de Gemini
- [ ] Validar que guarda historial correctamente
- [ ] Probar límites de Gemini (15 req/min)

### **Analytics (2 días)**
- [ ] Dashboard simple para ver conversaciones
- [ ] Métricas: leads calificados, demos activados, tasa de conversión
- [ ] Alertas si el bot falla o alcanza límite de API

---

## 🎯 SIGUIENTE PASO PARA TI

**¿Quieres que le dé instrucciones detalladas al Coder para implementar el Telegram Bot con Gemini (GRATIS)?**

Si dices que sí, crearé un documento `TAREA_CHATBOT_TELEGRAM.md` con:
- Paso a paso técnico para el Coder
- Código completo listo para copiar/pegar
- Tests para validar
- Troubleshooting común

**¿Procedemos con el chatbot o prefieres primero terminar la Landing Page?**
