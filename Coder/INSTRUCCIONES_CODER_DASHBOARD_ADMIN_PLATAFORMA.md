# 🎛️ INSTRUCCIONES: Dashboard Admin Plataforma
## Implementación de Botones con Lógica Completa

**Versión:** 1.0  
**Fecha:** 30 Enero 2026  
**Responsable:** Coder  
**Arquitectura base:** `Arquitecto/ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md`

---

## 🎯 OBJETIVO

Implementar todos los botones del Dashboard Admin Plataforma con su lógica funcional completa, basándose en la observación de Marketing sobre que **todos los botones deben tener lógica real, no placeholders**.

---

## 📊 ANÁLISIS DE BOTONES ACTUALES

### **✅ REVISIÓN ARQUITECTURA:**

He revisado el documento `ARQUITECTURA_DASHBOARD_ADMIN_INTELIGENTE.md` y todos los botones tienen lógica especificada. El código React (líneas 864-1221) ya incluye:

1. ✅ Botón "Reconocer" (alertas) → Lógica completa en líneas 1018-1025
2. ✅ Botón "Ver Detalles" (tickets) → Navegación funcional en líneas 1159-1164
3. ✅ Cards clicables (módulos) → Navegación con href en líneas 989-1008

**PROBLEMA IDENTIFICADO:** Faltan las páginas de destino completas.

---

## 📋 TAREAS PARA COMPLETAR LA LÓGICA

### **TAREA 1: Completar Página de Detalles de Ticket**

**Crear:** `src/app/platform-admin/tickets/[id]/page.tsx`

**Funcionalidad:**
- ✅ Ver detalles completos del ticket
- ✅ Historial de mensajes
- ✅ Botón "Resolver Ticket" con textarea para respuesta
- ✅ Botón "Escalar Prioridad"
- ✅ Actualizar estado en BD
- ✅ Agregar respuesta al historial (JSONB messages)

**Código base:** Ver líneas 100-300 en este documento (más abajo)

---

### **TAREA 2: Crear Página de Gestión de Leads**

**Crear:** `src/app/platform-admin/leads/page.tsx`

**Funcionalidad:**
- ✅ Listar todos los leads con paginación
- ✅ Filtros por funnel_stage (new_lead, qualified, demo_active, etc.)
- ✅ Botón "Calificar" → actualizar lead_qualified = true, lead_score = 80
- ✅ Botón "Activar Demo" → actualizar demo_activated_at, funnel_stage
- ✅ Botón "Ver Perfil" → navegación a /leads/[id]

**Código base:** Ver líneas 300-500 en este documento

---

### **TAREA 3: Crear Página de CRM & Campañas**

**Crear:** `src/app/platform-admin/crm/page.tsx`

**Funcionalidad:**
- ✅ Listar campañas con estadísticas (total_sent, total_opened, etc.)
- ✅ Botón "Activar/Desactivar" → toggle is_active
- ✅ Botón "Ejecutar Ahora" → llamar a `execute_crm_campaigns()` SQL function
- ✅ Mostrar última ejecución y performance

**Código base:** Ver líneas 500-700 en este documento

---

### **TAREA 4: Crear Página de Configuración de Chatbot**

**Crear:** `src/app/platform-admin/chatbot-config/page.tsx`

**Funcionalidad:**
- ✅ Listar contextos (landing, demo, customer, etc.)
- ✅ Editor de system_prompt y welcome_message
- ✅ Ajustar temperature y max_tokens
- ✅ Botón "Guardar Cambios" → actualizar chatbot_config
- ✅ Toggle is_active

**Código base:** Ver líneas 700-900 en este documento

---

### **TAREA 5: Agregar Toast Notifications**

**Instalar:**
```bash
npm install react-hot-toast
```

**Usar en todos los botones:**
```typescript
import { toast } from 'react-hot-toast';

// Éxito
toast.success('Ticket resuelto');

// Error
toast.error('No se pudo guardar');

// Loading
const loadingToast = toast.loading('Guardando...');
// ... await operación
toast.dismiss(loadingToast);
toast.success('Guardado');
```

**Agregar en layout principal:**
```typescript
import { Toaster } from 'react-hot-toast';

<Toaster position="top-right" />
```

---

## 💻 CÓDIGO COMPLETO PARA IMPLEMENTAR

### **1. Página de Detalles de Ticket**

```typescript
// src/app/platform-admin/tickets/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  async function loadTicket() {
    const { data, error } = await supabase
      .from('platform_tickets')
      .select(`
        *,
        platform_leads(*)
      `)
      .eq('id', ticketId)
      .single();
    
    if (error) {
      console.error('Error loading ticket:', error);
      toast.error('No se pudo cargar el ticket');
      return;
    }
    
    setTicket(data);
    setLoading(false);
  }

  async function handleResolve() {
    if (!response.trim()) {
      toast.error('Escribe una respuesta antes de resolver');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Agregar respuesta al historial
      const updatedMessages = [
        ...(ticket.messages || []),
        {
          role: 'admin',
          content: response,
          timestamp: new Date().toISOString()
        }
      ];

      // 2. Actualizar ticket
      const { error } = await supabase
        .from('platform_tickets')
        .update({
          status: 'resolved',
          resolved_by: 'admin_henry',
          resolution_notes: response,
          resolved_at: new Date().toISOString(),
          messages: updatedMessages
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('✅ Ticket resuelto exitosamente');
      setTimeout(() => router.push('/platform-admin'), 1500);
      
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast.error('No se pudo resolver el ticket');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEscalate() {
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('platform_tickets')
        .update({
          status: 'escalated',
          escalation_reason: 'Escalado manualmente por admin',
          priority: 'urgent'
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('⚡ Ticket escalado a prioridad urgente');
      loadTicket();
      
    } catch (error) {
      console.error('Error escalating ticket:', error);
      toast.error('No se pudo escalar el ticket');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando ticket...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-500">Ticket no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4 flex items-center"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold">Ticket {ticket.ticket_number}</h1>
        </div>

        {/* Info del Ticket */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span className={`inline-block px-3 py-1 rounded font-medium ${
                ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                ticket.status === 'escalated' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticket.status.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prioridad</p>
              <span className={`inline-block px-3 py-1 rounded font-medium ${
                ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                ticket.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{ticket.platform_leads?.full_name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{ticket.platform_leads?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categoría</p>
              <p className="font-medium capitalize">{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Creado</p>
              <p className="font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Origen</p>
              <p className="font-medium capitalize">{ticket.source}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-1">Asunto</p>
            <h2 className="text-xl font-bold mb-4">{ticket.subject}</h2>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Descripción</p>
            <p className="text-gray-700">{ticket.description}</p>
          </div>

          {ticket.escalation_reason && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm font-medium text-red-900">Razón de Escalación:</p>
              <p className="text-sm text-red-700">{ticket.escalation_reason}</p>
            </div>
          )}
        </div>

        {/* Historial de Mensajes */}
        {ticket.messages && ticket.messages.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="font-bold mb-4 text-lg">💬 Historial de Conversación</h3>
            <div className="space-y-3">
              {ticket.messages.map((msg: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-lg ${
                  msg.role === 'admin' ? 'bg-blue-50 ml-8 border-l-4 border-blue-500' : 'bg-gray-50 mr-8 border-l-4 border-gray-300'
                }`}>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                    <span className="font-medium">
                      {msg.role === 'admin' ? '👤 Admin' : msg.role === 'bot' ? '🤖 Bot' : '👥 Usuario'}
                    </span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleString()}</span>
                  </p>
                  <p className="text-gray-800">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Área de Respuesta */}
        {ticket.status !== 'resolved' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4 text-lg">✍️ Responder Ticket</h3>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Escribe tu respuesta aquí... Explica cómo se resolvió el problema."
              className="w-full h-32 p-4 border-2 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
              disabled={submitting}
            />

            <div className="flex gap-3">
              <button
                onClick={handleResolve}
                disabled={submitting || !response.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Guardando...' : '✅ Resolver Ticket'}
              </button>
              <button
                onClick={handleEscalate}
                disabled={submitting}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Escalando...' : '⚡ Escalar Prioridad'}
              </button>
              <button
                onClick={() => router.back()}
                disabled={submitting}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'resolved' && (
          <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">✅</span>
              <h3 className="font-bold text-xl text-green-900">Ticket Resuelto</h3>
            </div>
            <p className="text-gray-700 mb-2">
              <strong>Resuelto por:</strong> {ticket.resolved_by}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Fecha:</strong> {new Date(ticket.resolved_at).toLocaleString()}
            </p>
            {ticket.resolution_notes && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Notas de Resolución:</p>
                <p className="text-gray-800">{ticket.resolution_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```
[ ] Instalar react-hot-toast: npm install react-hot-toast
[ ] Agregar <Toaster /> en layout principal
[ ] Crear página /platform-admin/tickets/[id]/page.tsx
[ ] Implementar lógica de botones Resolver y Escalar
[ ] Testing con datos reales de Supabase
[ ] Verificar que se actualiza el historial de mensajes (JSONB)
[ ] Agregar loading states y error handling
[ ] Commit y push a GitHub
```

---

## 🎯 PRIORIDAD

**ALTA** - Marketing reportó que botones no tienen lógica. Esto bloquea QA.

**Tiempo estimado:** 2-3 horas para implementar todas las páginas.

---

**Fecha:** 30 Enero 2026  
**Responsable:** Coder  
**Status:** ⏸️ PENDIENTE DE IMPLEMENTACIÓN

**Nota:** Este documento solo muestra la página de tickets como ejemplo. Las páginas de Leads, CRM y Chatbot Config siguen el mismo patrón. Coder debe replicar estructura similar.
