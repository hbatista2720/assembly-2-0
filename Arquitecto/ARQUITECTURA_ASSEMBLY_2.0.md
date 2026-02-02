# 🏛️ Assembly 2.0 - Arquitectura Técnica
**Lead Software Architect**  
**Fecha:** 26 Enero 2026  
**Versión:** 1.0

---

## 1. VISIÓN GLOBAL Y ESCALABILIDAD

### Foco Inicial: Panamá (Ley 284)
- Cumplimiento estricto de normativa PH panameña
- Quórum por coeficientes
- Diferenciación legal entre "Al Día" (vota) y "En Mora" (solo voz)

### Internacionalización
- **Capa de Contexto Legal Configurable**
  - `legal_contexts`: tabla maestra por país/región
  - `legal_rules`: reglas parametrizables (quórum, mayorías, restricciones)
  - Permite agregar México, Colombia, Costa Rica sin refactorizar core

---

## 2. CASO DE USO DE REFERENCIA: P.H. URBAN TOWER

| Parámetro | Valor |
|-----------|-------|
| Total Unidades | 200 |
| Unidades Al Día | 150 (votan) |
| Unidades En Mora | 50 (solo voz) |
| Coeficiente Total | 100% |
| Quórum Mínimo | 51% del coef. total |

**Reglas de Negocio:**
- Quórum se calcula sobre **todas las unidades** (200)
- Solo las **Al Día** pesan en votaciones
- Alerta en tiempo real si quórum < 51%
- Votación ponderada por coeficiente

---

## 3. ARQUITECTURA MULTI-TENANT

### Estrategia: Row Level Security (RLS)
- Cada fila tiene `organization_id`
- Políticas RLS en Supabase (Postgres) por organización
- Un Admin puede gestionar múltiples PHs aislados

### Jerarquía de Tenancy
```
Organization (Promotora)
  └── Properties (PHs gestionados)
       └── Units (Unidades)
            └── Users (Propietarios/Residentes)
```

---

## 4. SISTEMA DE IDENTIDAD "YAPPY STYLE"

### Flujo de Registro y Acceso

#### Paso 1: Registro Inicial
1. Usuario ingresa **email**
2. Sistema envía **OTP de 6 dígitos** (vía servicio externo)
3. Usuario valida OTP
4. Sistema registra dispositivo verificado

#### Paso 2: Registro Biométrico
1. Tras validación OTP exitosa, se solicita registro **WebAuthn**
2. Usuario registra Face ID / Touch ID (credencial WebAuthn)
3. Credencial se vincula al `user_id` + `device_id`
4. Se almacena `credential_id` y `public_key` en BD

#### Paso 3: Accesos Futuros
1. Usuario solo usa **biometría** (WebAuthn)
2. No requiere OTP (solo en dispositivo nuevo)
3. Firma de votos mediante desafío WebAuthn

### Campos de Seguridad en Users
- `email` (identificador único)
- `email_verified` (bool)
- `mfa_enabled` (bool)
- `webauthn_credentials` (jsonb array)
  ```json
  [
    {
      "credential_id": "...",
      "public_key": "...",
      "device_name": "iPhone 15",
      "registered_at": "2026-01-26T10:00:00Z"
    }
  ]
  ```

---

## 5. ESQUEMA DE BASE DE DATOS (Prisma Schema)

```prisma
// ============================================
// MULTI-TENANT Y CONTEXTO LEGAL
// ============================================

model Organization {
  id                String      @id @default(uuid())
  name              String
  type              OrgType     // PROMOTORA, PH_INDEPENDIENTE
  legal_context_id  String
  legal_context     LegalContext @relation(fields: [legal_context_id], references: [id])
  created_at        DateTime    @default(now())
  updated_at        DateTime    @updatedAt
  
  properties        Property[]
  users             User[]
  crm_tickets       CRMTicket[]
}

enum OrgType {
  PROMOTORA
  PH_INDEPENDIENTE
}

model LegalContext {
  id            String   @id @default(uuid())
  country_code  String   @unique // PA, MX, CO
  name          String   // "Panamá - Ley 284"
  rules         Json     // Configuración legal
  /*
  {
    "quorum_base": "total_units",
    "quorum_percentage": 51,
    "mora_restriction": "no_vote",
    "majority_types": ["simple", "calificada", "unanimidad"]
  }
  */
  
  organizations Organization[]
}

// ============================================
// PROPIEDADES Y UNIDADES
// ============================================

model Property {
  id                String   @id @default(uuid())
  organization_id   String
  organization      Organization @relation(fields: [organization_id], references: [id])
  name              String
  address           String
  ruc               String?
  total_coefficient Decimal  @default(100)
  total_units       Int
  
  units             Unit[]
  assemblies        Assembly[]
  
  @@index([organization_id])
}

model Unit {
  id                String      @id @default(uuid())
  property_id       String
  property          Property    @relation(fields: [property_id], references: [id])
  code              String      // "A-101"
  coefficient       Decimal     // 0.32 (ejemplo)
  payment_status    PaymentStatus @default(AL_DIA)
  updated_at        DateTime    @updatedAt
  
  owners            UnitOwner[]
  attendance        AssemblyAttendance[]
  votes             Vote[]
  
  @@unique([property_id, code])
  @@index([property_id, payment_status])
}

enum PaymentStatus {
  AL_DIA
  MORA
}

// ============================================
// USUARIOS Y SEGURIDAD
// ============================================

model User {
  id                    String   @id @default(uuid())
  organization_id       String
  organization          Organization @relation(fields: [organization_id], references: [id])
  
  // Identificador único
  email                 String   @unique
  email_verified        Boolean  @default(false)
  
  // Datos personales
  cedula                String?  @unique
  first_name            String
  last_name             String
  phone                 String?
  
  // Seguridad Yappy Style
  mfa_enabled           Boolean  @default(false)
  webauthn_credentials  Json     @default("[]")
  otp_secret            String?  // Para generación temporal
  
  // Roles
  role                  UserRole @default(PROPIETARIO)
  
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
  
  unit_ownerships       UnitOwner[]
  attendance            AssemblyAttendance[]
  votes                 Vote[]
  audit_logs            AuditLog[]
  
  @@index([organization_id])
  @@index([email])
}

enum UserRole {
  PROPIETARIO
  RESIDENTE
  ADMIN_PH
  ADMIN_PROMOTORA
  JUNTA_DIRECTIVA
}

model UnitOwner {
  id          String   @id @default(uuid())
  unit_id     String
  unit        Unit     @relation(fields: [unit_id], references: [id])
  user_id     String
  user        User     @relation(fields: [user_id], references: [id])
  ownership   Decimal  @default(100) // % de propiedad si hay copropiedad
  
  @@unique([unit_id, user_id])
}

// ============================================
// ASAMBLEAS Y ASISTENCIA
// ============================================

model Assembly {
  id                String          @id @default(uuid())
  property_id       String
  property          Property        @relation(fields: [property_id], references: [id])
  
  type              AssemblyType
  scheduled_date    DateTime
  start_date        DateTime?
  end_date          DateTime?
  status            AssemblyStatus  @default(SCHEDULED)
  
  // Quórum
  quorum_rule       Json
  /*
  {
    "type": "STATIC",
    "base": "total_coefficient",
    "required_percentage": 51,
    "phases": []
  }
  */
  quorum_current    Decimal         @default(0)
  quorum_achieved   Boolean         @default(false)
  
  // Legal
  acta_url          String?
  acta_hash         String?
  
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  
  attendance        AssemblyAttendance[]
  votations         Votation[]
  
  @@index([property_id, status])
}

enum AssemblyType {
  ORDINARIA
  EXTRAORDINARIA
}

enum AssemblyStatus {
  SCHEDULED
  IN_PROGRESS
  CLOSED
  CANCELLED
}

model AssemblyAttendance {
  id                  String            @id @default(uuid())
  assembly_id         String
  assembly            Assembly          @relation(fields: [assembly_id], references: [id])
  user_id             String
  user                User              @relation(fields: [user_id], references: [id])
  unit_id             String
  unit                Unit              @relation(fields: [unit_id], references: [id])
  
  // Snapshot al momento de registro
  coefficient_snapshot Decimal
  payment_status_snapshot PaymentStatus
  
  // Derechos
  voting_rights       VotingRights
  
  // Método de verificación
  verification_method VerificationMethod
  verified_at         DateTime          @default(now())
  
  // Representación
  power_of_attorney_id String?
  power_of_attorney   PowerOfAttorney?  @relation(fields: [power_of_attorney_id], references: [id])
  
  @@unique([assembly_id, unit_id])
  @@index([assembly_id, voting_rights])
}

enum VotingRights {
  VOTA      // Al día
  SOLO_VOZ  // En mora
}

enum VerificationMethod {
  MANUAL
  FACE_ID
  TOUCH_ID
  POWER
}

// ============================================
// VOTACIONES
// ============================================

model Votation {
  id                String          @id @default(uuid())
  assembly_id       String
  assembly          Assembly        @relation(fields: [assembly_id], references: [id])
  
  order_number      Int
  topic             String
  description       String?
  majority_type     MajorityType
  
  status            VotationStatus  @default(OPEN)
  opened_at         DateTime        @default(now())
  closed_at         DateTime?
  
  // Resultados
  results           Json?
  /*
  {
    "coefficient_si": 45.8,
    "coefficient_no": 12.3,
    "coefficient_abstencion": 3.2,
    "approved": true
  }
  */
  
  votes             Vote[]
  crm_tickets       CRMTicket[]
  
  @@index([assembly_id, status])
}

enum VotationStatus {
  OPEN
  CLOSED
}

enum MajorityType {
  SIMPLE          // > 50% de presentes
  CALIFICADA      // >= 66.67%
  UNANIMIDAD      // 100%
}

model Vote {
  id                String      @id @default(uuid())
  votation_id       String
  votation          Votation    @relation(fields: [votation_id], references: [id])
  user_id           String
  user              User        @relation(fields: [user_id], references: [id])
  unit_id           String
  unit              Unit        @relation(fields: [unit_id], references: [id])
  
  value             VoteValue
  coefficient_used  Decimal     // Snapshot del coeficiente
  
  // Firma biométrica
  webauthn_signature Json?
  signed_at          DateTime   @default(now())
  
  @@unique([votation_id, unit_id])
  @@index([votation_id, value])
}

enum VoteValue {
  SI
  NO
  ABSTENCION
}

// ============================================
// PODERES DIGITALES
// ============================================

model PowerOfAttorney {
  id                    String   @id @default(uuid())
  property_id           String
  
  // Representado
  represented_cedula    String
  represented_name      String
  
  // Representante
  representative_cedula String
  representative_name   String
  
  // Documento
  document_url          String
  ocr_data              Json
  
  validation_status     ValidationStatus @default(PENDING)
  rejection_reason      String?
  
  validated_by          String?
  validated_at          DateTime?
  
  created_at            DateTime @default(now())
  
  attendance            AssemblyAttendance[]
  
  @@index([property_id, validation_status])
}

enum ValidationStatus {
  PENDING
  APPROVED
  REJECTED
}

// ============================================
// CRM ENTERPRISE
// ============================================

model CRMTicket {
  id                String      @id @default(uuid())
  organization_id   String
  organization      Organization @relation(fields: [organization_id], references: [id])
  
  source_type       TicketSource
  source_id         String      // votation_id o assembly_id
  votation          Votation?   @relation(fields: [source_id], references: [id])
  
  ticket_type       TicketType
  priority          TicketPriority @default(MEDIUM)
  status            TicketStatus @default(OPEN)
  
  subject           String
  description       String
  
  // Asignación
  assigned_to       String?
  
  created_at        DateTime    @default(now())
  updated_at        DateTime    @updatedAt
  resolved_at       DateTime?
  
  @@index([organization_id, status])
}

enum TicketSource {
  NEGATIVE_VOTE
  ASSEMBLY_CONCERN
  MANUAL
}

enum TicketType {
  MANTENIMIENTO
  QUEJA
  PREGUNTA
  SEGUIMIENTO_OBRA
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

// ============================================
// AUDITORÍA
// ============================================

model AuditLog {
  id            String    @id @default(uuid())
  entity_type   String    // "Unit", "Vote", "Assembly"
  entity_id     String
  action        String    // "CREATE", "UPDATE", "DELETE"
  actor_id      String?
  actor         User?     @relation(fields: [actor_id], references: [id])
  
  prev_state    Json?
  new_state     Json
  
  timestamp     DateTime  @default(now())
  
  @@index([entity_type, entity_id])
  @@index([timestamp])
}
```

---

## 6. MAPA DE RELACIONES CLAVE

### Flujo: Estado de Pago → Capacidad de Voto

```
Unit.payment_status
  ↓
AssemblyAttendance.payment_status_snapshot (congelado)
  ↓
AssemblyAttendance.voting_rights (VOTA | SOLO_VOZ)
  ↓
Vote.id (solo se permite inserción si voting_rights = VOTA)
```

### Constraint en Nivel de Aplicación
```typescript
// Antes de insertar voto
const attendance = await getAttendance(user_id, assembly_id);
if (attendance.voting_rights !== 'VOTA') {
  throw new Error('Usuario sin derecho a voto (En Mora)');
}
```

### Constraint en Nivel de BD (Trigger PostgreSQL)
```sql
CREATE OR REPLACE FUNCTION check_voting_rights()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "AssemblyAttendance"
    WHERE assembly_id = NEW.votation_id
      AND unit_id = NEW.unit_id
      AND voting_rights = 'VOTA'
  ) THEN
    RAISE EXCEPTION 'Unidad sin derecho a voto';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_voting_rights
  BEFORE INSERT ON "Vote"
  FOR EACH ROW
  EXECUTE FUNCTION check_voting_rights();
```

---

## 7. CRM ENTERPRISE: VOTOS NEGATIVOS → TICKETS

### Trigger Automático Post-Votación

```typescript
// Pseudo-lógica
async function onVotationClosed(votation_id: string) {
  const negativeVotes = await db.vote.findMany({
    where: { votation_id, value: 'NO' },
    include: { unit: true, user: true }
  });
  
  for (const vote of negativeVotes) {
    await db.cRMTicket.create({
      data: {
        organization_id: vote.unit.property.organization_id,
        source_type: 'NEGATIVE_VOTE',
        source_id: votation_id,
        ticket_type: 'SEGUIMIENTO_OBRA', // o lógica automática
        priority: 'MEDIUM',
        subject: `Voto negativo en: ${votation.topic}`,
        description: `Unidad ${vote.unit.code} votó NO. Requiere seguimiento.`
      }
    });
  }
}
```

---

## 8. ROADMAP PARA EL CODER

### Fase 1: Setup Infraestructura
1. Inicializar proyecto con Prisma + Supabase
2. Configurar RLS policies por `organization_id`
3. Implementar migración de schema completo
4. Seed de `LegalContext` para Panamá (Ley 284)

### Fase 2: Autenticación Yappy Style
1. Endpoint `/auth/register` (email → envío OTP externo)
2. Endpoint `/auth/verify-otp` (valida y marca `email_verified`)
3. Endpoint `/auth/register-webauthn` (guarda credential)
4. Endpoint `/auth/login-webauthn` (challenge/response)
5. Middleware para validar firma WebAuthn en votos

### Fase 3: Carga Masiva de Datos
1. Script de importación CSV → `Property`, `Unit`, `User`
2. Validación de coeficientes (suma = 100%)
3. Asignación de `UnitOwner` automática
4. Generación de invitaciones por email (delegar a servicio externo)

### Fase 4: Lógica de Asamblea
1. CRUD de `Assembly`
2. Endpoint `/assembly/:id/mark-attendance` (manual)
3. Endpoint `/assembly/:id/verify-face` (integración biométrica)
4. Cálculo en tiempo real de quórum (Supabase Realtime)
5. Alerta si quórum < 51%

### Fase 5: Votaciones
1. CRUD de `Votation`
2. Endpoint `/votation/:id/vote` con validación de `voting_rights`
3. Cálculo de resultados por coeficiente
4. Trigger de cierre → generación de CRM tickets

### Fase 6: CRM y Auditoría
1. Dashboard de tickets para promotora
2. Asignación y seguimiento
3. Logs de auditoría en todas las mutaciones críticas

### Fase 7: Poderes Digitales
1. Upload de documento → Storage
2. OCR (AWS Textract / Google Vision)
3. Validación manual por admin
4. Vinculación en `AssemblyAttendance`

---

## 9. RESTRICCIONES TÉCNICAS

### NO INCLUIR (por ahora)
- Frontend UI (React/Next.js)
- Servicio de envío de emails (usar placeholder: `EmailService.send()`)
- Integración real con proveedores de OCR (mock inicial)

### SÍ INCLUIR
- API REST/GraphQL endpoints documentados
- Lógica de negocio completa en servicios
- Triggers y constraints de BD
- Tests unitarios para cálculo de quórum y votaciones

---

## 10. MÉTRICAS DE ÉXITO

| Métrica | Target |
|---------|--------|
| Tiempo de carga de 200 unidades | < 2 segundos |
| Latencia de registro de voto | < 500ms |
| Actualización de quórum en tiempo real | < 1 segundo |
| Tasa de éxito WebAuthn | > 95% |
| Integridad de coeficientes | 100% (suma = total) |

---

## 11. PRÓXIMOS PASOS

**✅ Arquitectura Completada**

Esperando auditoría del **Agente de Calidad (QA)** para validar:
- Cumplimiento Ley 284
- Seguridad de datos sensibles
- Escalabilidad multi-tenant
- Integridad de lógica de votación

Una vez aprobado, el **Coder** puede iniciar la implementación siguiendo el Roadmap.

---

**Fin del documento técnico.**
