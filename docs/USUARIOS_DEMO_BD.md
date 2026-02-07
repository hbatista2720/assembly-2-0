# Usuarios demo en base de datos – Pruebas

**Fecha:** Febrero 2026  
**Referencia:** QA/QA_FEEDBACK.md (Asamblea demo, PH A/PH B, Hallazgo crítico · Residente entra como Admin PH), sql_snippets/auth_otp_local.sql, seeds_residentes_demo.sql, 102_demo_ph_a_ph_b_assemblies.sql

---

## Objetivo

Lista única de usuarios demo creados en BD para pruebas, con **rol** y **organización** bien definidos. Usar para QA, Coder y validación de login (residente no debe entrar como Admin PH).

---

## Organizaciones

| ID (UUID) | Nombre | is_demo | Uso |
|-----------|--------|---------|-----|
| `11111111-1111-1111-1111-111111111111` | Demo - P.H. Urban Tower | true | PH A – asamblea activa para votar |
| `22222222-2222-2222-2222-222222222222` | P.H. Torres del Pacífico | true (tras script 102) | PH B – asamblea programada (no activa) |

---

## Usuarios por rol

### ADMIN_PLATAFORMA (Platform Admin – Henry)

| Email | Organización | Rol | Uso |
|-------|--------------|-----|-----|
| henry.batista27@gmail.com | — (NULL) | ADMIN_PLATAFORMA | Dashboard plataforma (monitoring, clients, leads, etc.). is_platform_owner = true. |

### ADMIN_PH (Administrador de PH)

| Email | Organización | Rol | Uso |
|-------|--------------|-----|-----|
| demo@assembly2.com | Demo - P.H. Urban Tower (PH A) | ADMIN_PH | Admin del PH demo. Login → Dashboard Admin PH. |
| admin@torresdelpacifico.com | P.H. Torres del Pacífico (PH B) | ADMIN_PH | Admin del PH B. Login → Dashboard Admin PH. |

### RESIDENTE – PH A (Demo - Urban Tower)

| Email | Organización | Rol | Uso |
|-------|--------------|-----|-----|
| residente1@demo.assembly2.com | Demo - P.H. Urban Tower | RESIDENTE | Pruebas residente, chatbot, votación (asamblea activa). |
| residente2@demo.assembly2.com | Demo - P.H. Urban Tower | RESIDENTE | Idem. **QA:** usado en hallazgo crítico – no debe redirigir a Admin PH. |
| residente3@demo.assembly2.com | Demo - P.H. Urban Tower | RESIDENTE | Idem. |
| residente4@demo.assembly2.com | Demo - P.H. Urban Tower | RESIDENTE | Idem. |
| residente5@demo.assembly2.com | Demo - P.H. Urban Tower | RESIDENTE | Idem. |

**Comportamiento esperado en login:** Cualquier usuario con `role === "RESIDENTE"` debe redirigirse a `/residentes/chat` (chatbot), **no** a Dashboard Admin PH, aunque la org tenga `is_demo = true`. Ver QA_FEEDBACK.md § "QA Hallazgo crítico · Residente entra como Admin PH".

### RESIDENTE – PH B (Torres del Pacífico)

| Email | Organización | Rol | Uso |
|-------|--------------|-----|-----|
| residente1@torresdelpacifico.com | P.H. Torres del Pacífico | RESIDENTE | Pruebas residente con asamblea **programada** (no activa). |
| residente2@torresdelpacifico.com | P.H. Torres del Pacífico | RESIDENTE | Idem. |
| residente3@torresdelpacifico.com | P.H. Torres del Pacífico | RESIDENTE | Idem. |

**Nota:** Creados con script `sql_snippets/102_demo_ph_a_ph_b_assemblies.sql`. Ejecutar ese script si no existen.

---

## Resumen por script

| Script | Qué crea |
|--------|----------|
| sql_snippets/auth_otp_local.sql | Organizaciones PH A y PH B; henry.batista27@gmail.com (ADMIN_PLATAFORMA), demo@ (ADMIN_PH), admin@torresdelpacifico.com (ADMIN_PH); residente1@…residente5@demo.assembly2.com (RESIDENTE, PH A). |
| sql_snippets/seeds_residentes_demo.sql | Mismos 5 residentes PH A (para ejecución manual si la BD ya existía). |
| sql_snippets/102_demo_ph_a_ph_b_assemblies.sql | Tabla assemblies; residente1@…3@torresdelpacifico.com (RESIDENTE, PH B); asamblea activa PH A, asamblea programada PH B. |

---

## Referencias QA

- **QA Hallazgo crítico · Residente entra como Admin PH:** Login con residente2@demo.assembly2.com (RESIDENTE) no debe redirigir a Admin PH; debe ir a `/residentes/chat`. Contralor/ESTATUS_AVANCE.md – bloque "Para CODER (login – residente no debe entrar como Admin PH)".
- **Usuarios demo para pruebas:** QA_FEEDBACK.md § "Recomendación: Asamblea demo con admin y residentes"; Plan de pruebas navegación; PH A y PH B (Database_DBA/INSTRUCCIONES_CODER_ASSEMBLY_CONTEXT_BD.md).
