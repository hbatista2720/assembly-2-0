# 🚀 Roadmap de Implementación - Assembly 2.0
**Para el Agente Coder**

---

## FASE 0: Setup Inicial del Proyecto

### 0.1 Infraestructura Base
- [ ] Crear proyecto en Supabase
- [ ] Configurar repositorio Git
- [ ] Setup de entorno local (Node.js, pnpm/npm)
- [ ] Inicializar Prisma con schema.prisma
- [ ] Configurar variables de entorno (.env)

```bash
# .env.example
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
WEBAUTHN_RP_ID="assembly2.app"
WEBAUTHN_RP_NAME="Assembly 2.0"
WEBAUTHN_ORIGIN="https://assembly2.app"
```

### 0.2 Migración de Schema
- [ ] Ejecutar `schema.sql` en Supabase
- [ ] Verificar que todos los triggers estén activos
- [ ] Validar que RLS esté habilitado
- [ ] Seed de `legal_contexts` (Panamá - Ley 284)

```bash
psql $DATABASE_URL < schema.sql
```

### 0.3 Estructura de Carpetas
```
/src
  /api
    /auth
    /assemblies
    /votations
    /crm
  /services
    /webauthn
    /otp
    /ocr
  /middleware
    /rls
    /auth
  /utils
  /types
/prisma
  schema.prisma
/tests
```

---

## FASE 1: Autenticación Yappy Style

### 1.1 Registro con Email + OTP

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "cedula": "8-123-4567",
  "organization_id": "uuid"
}
```

**Lógica:**
1. Validar que email no exista
2. Crear usuario con `email_verified = false`
3. Generar OTP de 6 dígitos (usar `crypto.randomInt(100000, 999999)`)
4. Guardar `otp_secret` hasheado en BD
5. **Delegar envío de email a servicio externo** (mock inicial: console.log)
6. Responder con `user_id` y `otp_sent: true`

**Implementación:**
```typescript
// src/api/auth/register.ts
export async function registerUser(data: RegisterDTO) {
  // Validar email único
  const exists = await prisma.user.findUnique({ 
    where: { email: data.email } 
  });
  if (exists) throw new Error('Email ya registrado');
  
  // Generar OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otp_hash = await bcrypt.hash(otp, 10);
  
  // Crear usuario
  const user = await prisma.user.create({
    data: {
      ...data,
      email_verified: false,
      otp_secret: otp_hash,
      mfa_enabled: false
    }
  });
  
  // Enviar OTP (mock)
  await EmailService.sendOTP(user.email, otp); // Placeholder
  
  return { user_id: user.id, otp_sent: true };
}
```

---

### 1.2 Verificación de OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "user_id": "uuid",
  "otp": "123456"
}
```

**Lógica:**
1. Buscar usuario por `user_id`
2. Comparar OTP con `otp_secret` hasheado
3. Si válido: marcar `email_verified = true`, limpiar `otp_secret`
4. Emitir token temporal (JWT de 15 minutos) para registro WebAuthn
5. Responder con token y `webauthn_setup_required: true`

**Implementación:**
```typescript
export async function verifyOTP(user_id: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user || !user.otp_secret) throw new Error('OTP inválido');
  
  const valid = await bcrypt.compare(otp, user.otp_secret);
  if (!valid) throw new Error('OTP incorrecto');
  
  // Actualizar usuario
  await prisma.user.update({
    where: { id: user_id },
    data: {
      email_verified: true,
      otp_secret: null
    }
  });
  
  // Emitir token temporal
  const token = jwt.sign(
    { user_id, email: user.email, temp: true },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  return { token, webauthn_setup_required: true };
}
```

---

### 1.3 Registro de Credencial WebAuthn

**Endpoint:** `POST /api/auth/webauthn/register-challenge`

**Headers:** `Authorization: Bearer [token temporal]`

**Response:**
```json
{
  "challenge": "base64_random_string",
  "rp": {
    "name": "Assembly 2.0",
    "id": "assembly2.app"
  },
  "user": {
    "id": "uuid",
    "name": "usuario@example.com",
    "displayName": "Juan Pérez"
  },
  "pubKeyCredParams": [
    { "type": "public-key", "alg": -7 },
    { "type": "public-key", "alg": -257 }
  ],
  "authenticatorSelection": {
    "authenticatorAttachment": "platform",
    "userVerification": "required"
  }
}
```

**Lógica:**
1. Validar token temporal
2. Generar challenge aleatorio (32 bytes)
3. Guardar challenge en memoria/cache (Redis) con TTL 2 minutos
4. Devolver options para `navigator.credentials.create()`

---

**Endpoint:** `POST /api/auth/webauthn/register-verify`

**Request Body:**
```json
{
  "credential_id": "base64_credential_id",
  "public_key": "base64_public_key",
  "attestation_object": "base64_...",
  "client_data_json": "base64_...",
  "device_name": "iPhone 15"
}
```

**Lógica:**
1. Validar challenge guardado
2. Verificar attestation con librería `@simplewebauthn/server`
3. Guardar credencial en `users.webauthn_credentials`
4. Marcar `mfa_enabled = true`
5. Emitir JWT de sesión completa

**Implementación:**
```typescript
import { verifyRegistrationResponse } from '@simplewebauthn/server';

export async function verifyWebAuthnRegistration(
  user_id: string, 
  credential: CredentialResponse
) {
  const user = await prisma.user.findUnique({ where: { id: user_id } });
  const expectedChallenge = await cache.get(`challenge:${user_id}`);
  
  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: process.env.WEBAUTHN_ORIGIN,
    expectedRPID: process.env.WEBAUTHN_RP_ID
  });
  
  if (!verification.verified) throw new Error('Verificación fallida');
  
  // Guardar credencial
  const credentials = user.webauthn_credentials as any[];
  credentials.push({
    credential_id: verification.registrationInfo.credentialID,
    public_key: verification.registrationInfo.credentialPublicKey,
    device_name: credential.device_name,
    registered_at: new Date().toISOString()
  });
  
  await prisma.user.update({
    where: { id: user_id },
    data: {
      webauthn_credentials: credentials,
      mfa_enabled: true
    }
  });
  
  // Emitir sesión completa
  const token = jwt.sign(
    { user_id, email: user.email, org_id: user.organization_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { token };
}
```

---

### 1.4 Login con WebAuthn

**Endpoint:** `POST /api/auth/webauthn/login-challenge`

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "challenge": "base64_random_string",
  "allowCredentials": [
    {
      "id": "credential_id_1",
      "type": "public-key"
    }
  ]
}
```

---

**Endpoint:** `POST /api/auth/webauthn/login-verify`

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "credential_id": "...",
  "authenticator_data": "...",
  "client_data_json": "...",
  "signature": "..."
}
```

**Lógica:**
1. Buscar usuario por email
2. Recuperar challenge
3. Verificar firma con `@simplewebauthn/server`
4. Si válido: emitir JWT de sesión

---

## FASE 2: Carga Masiva de Datos

### 2.1 Script de Importación CSV

**Formato CSV esperado:**
```csv
organization_id,property_name,unit_code,coefficient,owner_email,owner_first_name,owner_last_name,owner_cedula,payment_status
uuid,Urban Tower,A-101,0.32,juan@example.com,Juan,Pérez,8-123-4567,AL_DIA
uuid,Urban Tower,A-102,0.32,maria@example.com,María,González,8-234-5678,MORA
...
```

**Script:** `scripts/import-units.ts`

```typescript
import { parse } from 'csv-parse/sync';
import fs from 'fs';

export async function importUnits(csvPath: string) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  
  for (const row of records) {
    // Crear o encontrar property
    let property = await prisma.property.findFirst({
      where: { 
        organization_id: row.organization_id,
        name: row.property_name 
      }
    });
    
    if (!property) {
      property = await prisma.property.create({
        data: {
          organization_id: row.organization_id,
          name: row.property_name,
          address: 'Dirección por definir',
          total_units: 200 // Calcular dinámicamente
        }
      });
    }
    
    // Crear unidad
    const unit = await prisma.unit.create({
      data: {
        property_id: property.id,
        code: row.unit_code,
        coefficient: parseFloat(row.coefficient),
        payment_status: row.payment_status
      }
    });
    
    // Crear o encontrar usuario
    let user = await prisma.user.findUnique({ 
      where: { email: row.owner_email } 
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          organization_id: row.organization_id,
          email: row.owner_email,
          first_name: row.owner_first_name,
          last_name: row.owner_last_name,
          cedula: row.owner_cedula,
          email_verified: false
        }
      });
      
      // Enviar invitación (mock)
      await EmailService.sendInvitation(user.email);
    }
    
    // Vincular propietario
    await prisma.unitOwner.create({
      data: {
        unit_id: unit.id,
        user_id: user.id,
        ownership: 100
      }
    });
  }
  
  // Validar suma de coeficientes = 100%
  const sumCoef = await prisma.unit.aggregate({
    where: { property_id: property.id },
    _sum: { coefficient: true }
  });
  
  if (Math.abs(sumCoef._sum.coefficient - 100) > 0.01) {
    throw new Error('Suma de coeficientes no es 100%');
  }
  
  console.log(`✅ Importadas ${records.length} unidades`);
}
```

---

## FASE 3: Lógica de Asamblea y Quórum

### 3.1 Crear Asamblea

**Endpoint:** `POST /api/assemblies`

**Request Body:**
```json
{
  "property_id": "uuid",
  "type": "ORDINARIA",
  "scheduled_date": "2026-02-15T10:00:00Z",
  "quorum_rule": {
    "type": "STATIC",
    "base": "total_coefficient",
    "required_percentage": 51
  }
}
```

**Roles permitidos:** `ADMIN_PH`, `JUNTA_DIRECTIVA`

---

### 3.2 Marcar Asistencia Manual

**Endpoint:** `POST /api/assemblies/:id/attendance`

**Request Body:**
```json
{
  "unit_id": "uuid",
  "verification_method": "MANUAL"
}
```

**Lógica:**
1. Validar que asamblea esté `IN_PROGRESS`
2. Buscar unidad y propietarios
3. Crear registro en `assembly_attendance`:
   - `coefficient_snapshot` = coef actual
   - `payment_status_snapshot` = estado actual
   - `voting_rights` = (AL_DIA ? VOTA : SOLO_VOZ)
4. Trigger `update_quorum()` se ejecuta automáticamente
5. Emitir evento Realtime a tablero

**Implementación:**
```typescript
export async function markAttendance(
  assembly_id: string,
  unit_id: string,
  method: VerificationMethod
) {
  const assembly = await prisma.assembly.findUnique({ 
    where: { id: assembly_id } 
  });
  if (assembly.status !== 'IN_PROGRESS') {
    throw new Error('Asamblea no está activa');
  }
  
  const unit = await prisma.unit.findUnique({ 
    where: { id: unit_id },
    include: { owners: { include: { user: true } } }
  });
  
  const user = unit.owners[0].user; // Tomar primer propietario
  
  const attendance = await prisma.assemblyAttendance.create({
    data: {
      assembly_id,
      user_id: user.id,
      unit_id,
      coefficient_snapshot: unit.coefficient,
      payment_status_snapshot: unit.payment_status,
      voting_rights: unit.payment_status === 'AL_DIA' ? 'VOTA' : 'SOLO_VOZ',
      verification_method: method
    }
  });
  
  // El trigger update_quorum() se ejecuta automáticamente
  
  // Emitir evento Realtime
  await supabase.channel('assemblies').send({
    type: 'broadcast',
    event: 'attendance_updated',
    payload: { assembly_id, attendance }
  });
  
  return attendance;
}
```

---

### 3.3 Verificación con Face ID

**Endpoint:** `POST /api/assemblies/:id/attendance/face-verify`

**Request Body:**
```json
{
  "unit_id": "uuid",
  "webauthn_signature": { ... }
}
```

**Lógica:**
1. Validar firma WebAuthn del usuario
2. Llamar a `markAttendance()` con `method = 'FACE_ID'`
3. Guardar evento en `biometria_eventos` (auditoría)

---

### 3.4 Obtener Estado de Asamblea en Tiempo Real

**Endpoint:** `GET /api/assemblies/:id/state`

**Response:**
```json
{
  "assembly": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "quorum_current": 65.4,
    "quorum_achieved": true
  },
  "quorum": {
    "current": 65.4,
    "required": 51.0,
    "percentage": 65.4,
    "achieved": true
  },
  "attendees": [
    {
      "unit_code": "A-101",
      "user_name": "Juan Pérez",
      "coefficient": 0.32,
      "voting_rights": "VOTA"
    }
  ]
}
```

**Implementación:**
```typescript
export async function getAssemblyState(assembly_id: string) {
  return await prisma.$queryRaw`
    SELECT * FROM get_assembly_state(${assembly_id}::UUID)
  `;
}
```

---

## FASE 4: Votaciones

### 4.1 Crear Votación

**Endpoint:** `POST /api/votations`

**Request Body:**
```json
{
  "assembly_id": "uuid",
  "order_number": 1,
  "topic": "Aprobación de presupuesto 2026",
  "description": "...",
  "majority_type": "SIMPLE"
}
```

---

### 4.2 Emitir Voto

**Endpoint:** `POST /api/votations/:id/vote`

**Request Body:**
```json
{
  "unit_id": "uuid",
  "value": "SI",
  "webauthn_signature": { ... }
}
```

**Lógica:**
1. Validar firma WebAuthn
2. Verificar que usuario tenga asistencia con `voting_rights = VOTA`
3. Insertar en `votes`:
   - `coefficient_used` = snapshot de asistencia
   - `webauthn_signature` = firma para auditoría
4. Trigger valida automáticamente
5. Emitir evento Realtime con resultados actualizados

**Implementación:**
```typescript
export async function castVote(
  votation_id: string,
  unit_id: string,
  value: VoteValue,
  signature: WebAuthnSignature
) {
  // Validar firma
  await verifyWebAuthnSignature(signature);
  
  // Buscar asistencia
  const votation = await prisma.votation.findUnique({ 
    where: { id: votation_id } 
  });
  
  const attendance = await prisma.assemblyAttendance.findFirst({
    where: {
      assembly_id: votation.assembly_id,
      unit_id
    }
  });
  
  if (!attendance || attendance.voting_rights !== 'VOTA') {
    throw new Error('Sin derecho a voto');
  }
  
  // Insertar voto (trigger valida automáticamente)
  const vote = await prisma.vote.create({
    data: {
      votation_id,
      user_id: attendance.user_id,
      unit_id,
      value,
      coefficient_used: attendance.coefficient_snapshot,
      webauthn_signature: signature
    }
  });
  
  // Emitir evento
  const results = await getVotationResults(votation_id);
  await supabase.channel('votations').send({
    type: 'broadcast',
    event: 'vote_cast',
    payload: { votation_id, results }
  });
  
  return vote;
}
```

---

### 4.3 Cerrar Votación y Calcular Resultados

**Endpoint:** `POST /api/votations/:id/close`

**Lógica:**
1. Cambiar status a `CLOSED`
2. Calcular resultados desde vista `votation_results`
3. Determinar si aprobó según `majority_type`
4. Guardar en `results` (JSONB)
5. Trigger automático crea tickets CRM para votos NO

**Implementación:**
```typescript
export async function closeVotation(votation_id: string) {
  const votation = await prisma.votation.findUnique({ 
    where: { id: votation_id } 
  });
  
  const results = await prisma.$queryRaw`
    SELECT * FROM votation_results WHERE votation_id = ${votation_id}
  `;
  
  const { coef_si, coef_no, coef_abstencion } = results[0];
  const total_coef = coef_si + coef_no + coef_abstencion;
  
  let approved = false;
  switch (votation.majority_type) {
    case 'SIMPLE':
      approved = coef_si > coef_no;
      break;
    case 'CALIFICADA':
      approved = (coef_si / total_coef) >= 0.6667;
      break;
    case 'UNANIMIDAD':
      approved = coef_si === total_coef;
      break;
  }
  
  await prisma.votation.update({
    where: { id: votation_id },
    data: {
      status: 'CLOSED',
      closed_at: new Date(),
      results: {
        coefficient_si: coef_si,
        coefficient_no: coef_no,
        coefficient_abstencion: coef_abstencion,
        approved
      }
    }
  });
  
  // Trigger crea tickets automáticamente
  
  return { approved, results };
}
```

---

## FASE 5: CRM Enterprise

### 5.1 Listar Tickets de Organización

**Endpoint:** `GET /api/crm/tickets?organization_id=uuid&status=OPEN`

**Response:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "source_type": "NEGATIVE_VOTE",
      "ticket_type": "SEGUIMIENTO_OBRA",
      "priority": "MEDIUM",
      "subject": "Voto negativo en: Aprobación presupuesto",
      "description": "Unidad A-105 votó NO. Requiere seguimiento.",
      "status": "OPEN",
      "created_at": "2026-01-26T..."
    }
  ]
}
```

---

### 5.2 Asignar y Resolver Tickets

**Endpoint:** `PATCH /api/crm/tickets/:id`

**Request Body:**
```json
{
  "assigned_to": "user_uuid",
  "status": "IN_PROGRESS"
}
```

---

## FASE 6: Poderes Digitales

### 6.1 Subir Documento

**Endpoint:** `POST /api/powers/upload`

**Form Data:**
- `file`: PDF o imagen
- `property_id`: uuid

**Lógica:**
1. Upload a Supabase Storage
2. Guardar URL en `powers_of_attorney`
3. Estado inicial: `PENDING`

---

### 6.2 Procesar con OCR

**Script automático (cron job):**

```typescript
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';

export async function processOCR(power_id: string) {
  const power = await prisma.powerOfAttorney.findUnique({ 
    where: { id: power_id } 
  });
  
  const textract = new TextractClient({ region: 'us-east-1' });
  const command = new AnalyzeDocumentCommand({
    Document: { S3Object: { Bucket: '...', Name: power.document_url } },
    FeatureTypes: ['FORMS', 'TABLES']
  });
  
  const response = await textract.send(command);
  
  // Extraer datos clave (lógica custom según formato de poder)
  const ocr_data = extractPowerData(response);
  
  await prisma.powerOfAttorney.update({
    where: { id: power_id },
    data: { ocr_data }
  });
}

function extractPowerData(ocrResponse: any) {
  // Buscar patterns: "Cédula: 8-123-4567", "Representante: ..."
  // Retornar objeto estructurado
  return {
    represented_cedula: '8-123-4567',
    represented_name: 'Juan Pérez',
    representative_cedula: '8-234-5678',
    representative_name: 'María González'
  };
}
```

---

### 6.3 Validar Poder

**Endpoint:** `POST /api/powers/:id/validate`

**Request Body:**
```json
{
  "status": "APPROVED",
  "rejection_reason": null
}
```

**Lógica:**
1. Admin revisa datos OCR
2. Actualiza `validation_status`
3. Si aprobado, queda listo para usar en asambleas

---

## FASE 7: Testing

### 7.1 Tests Unitarios

**Prioridad alta:**
- Cálculo de quórum
- Validación de derechos de voto
- Cálculo de resultados por mayoría
- Suma de coeficientes = 100%

**Herramienta:** Jest

```typescript
// tests/quorum.test.ts
describe('Quorum Calculation', () => {
  it('should calculate quorum correctly', async () => {
    const assembly = await createTestAssembly();
    await markAttendance(assembly.id, unit1.id, 'MANUAL'); // coef 0.30
    await markAttendance(assembly.id, unit2.id, 'MANUAL'); // coef 0.25
    
    const state = await getAssemblyState(assembly.id);
    expect(state.quorum.current).toBe(0.55);
    expect(state.quorum.achieved).toBe(true);
  });
});
```

---

### 7.2 Tests de Integración

- Flujo completo: registro → OTP → WebAuthn → login
- Flujo de asamblea: crear → marcar asistencia → votar → cerrar
- Validación de RLS (usuario no puede ver datos de otra org)

---

## FASE 8: Documentación API

**Herramienta:** OpenAPI / Swagger

Generar docs automáticas con:
- Todos los endpoints
- Ejemplos de request/response
- Códigos de error
- Esquemas de autenticación

---

## Checklist Final Antes de QA

- [ ] Todos los endpoints implementados
- [ ] Triggers de BD funcionando
- [ ] RLS validado con tests
- [ ] WebAuthn funcional en dispositivo real (no solo mock)
- [ ] Suma de coeficientes = 100% validada
- [ ] Auditoría guardando cambios críticos
- [ ] CRM generando tickets automáticamente
- [ ] Documentación API completa
- [ ] Tests con > 80% cobertura

---

**Fin del Roadmap. Listo para inicio de implementación.**
