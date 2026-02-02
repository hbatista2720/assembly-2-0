# 📁 ARCHIVOS ARCHIVADOS - Assembly 2.0

**Propósito:** Documentos históricos o versiones anteriores que ya no están en uso activo.

---

## 📜 **DOCUMENTOS EN ESTA CARPETA:**

### **1. Supabase (Obsoletos - usamos VPS All-in-One)**

- **GUIA_HENRY_VERIFICAR_SUPABASE.md**
  - Guía para verificar configuración de Supabase Dashboard
  - Obsoleto: Ya no usamos Supabase Cloud
  - Fecha de archivo: 30 Enero 2026

- **supabase.ts.old** (código)
  - Biblioteca de conexión a Supabase para chatbot
  - Obsoleto: Auth y BD ahora son self-hosted
  - Fecha de archivo: 30 Enero 2026

### **2. Landing Page (Versiones anteriores)**

- **LANDING_PAGE_ESTRATEGIA_v1_2026-01-27.md**
  - Versión 1.0 de la estrategia de landing page
  - Reemplazado por: `Marketing/LANDING_PAGE_ESTRATEGIA.md` (versión actualizada)

### **3. Marketing (Versiones anteriores)**

- **MARKETING_v1_2026-01-27.md**
  - Versión 1.0 del documento de marketing
  - Reemplazado por: `Marketing/MARKETING_PRECIOS_COMPLETO.md` (v3.0 Premium)

---

## 🗑️ **POR QUÉ ESTÁN ARCHIVADOS:**

### **Archivos de Supabase:**
Decidimos usar **VPS All-in-One** (PostgreSQL + Redis + Auth self-hosted) en lugar de Supabase Cloud porque:
- ❌ Supabase Pro ($25/mes) es limitado (500 conexiones, 8GB storage)
- ❌ Supabase Team ($599/mes) es un salto de 24x en precio
- ✅ VPS All-in-One ($32/mes) da control total sin límites

**Decisión aprobada por:** DBA (Database Agent) - 30 Enero 2026

**Documentos vigentes:**
- `Arquitecto/ARQUITECTURA_FINAL_DOCKER_VPS.md` (v2.0)
- `Database_DBA/VEREDICTO_DBA_ARQUITECTURA_VPS.md`
- `Coder/INSTRUCCIONES_IMPLEMENTACION_VPS_ALL_IN_ONE.md`

### **Archivos de Marketing:**
Versiones anteriores reemplazadas por documentos consolidados más recientes.

---

## 📌 **POLÍTICA DE ARCHIVO:**

Solo guardamos:
- ✅ 1 versión anterior (backup inmediato)
- ✅ Documentos de decisiones importantes (histórico)

**Limpieza:** Archivos con >2 meses de antigüedad pueden eliminarse.

---

**Última actualización:** 30 Enero 2026
