# 🗳️ ARQUITECTURA: REGISTRO Y VOTACIÓN DE RESIDENTES
## Assembly 2.0 - Sistema de Votación con Face ID + Poderes Digitales

**Versión:** 1.0  
**Fecha:** 29 Enero 2026  
**Autor:** Arquitecto Assembly 2.0  
**Audiencia:** Henry, Coder, QA  
**Cumplimiento Legal:** Ley 284 de Panamá

---

## 📋 ÍNDICE

1. [Visión General](#visión-general)
2. [5 Escenarios de Registro](#5-escenarios-de-registro)
3. [Lógica de Co-Titulares](#lógica-de-co-titulares)
4. [Sistema de Poderes Digitales](#sistema-de-poderes-digitales)
5. [Face ID + Fallback Manual](#face-id--fallback-manual)
6. [Integración con Chatbot](#integración-con-chatbot)
7. [Schema de Base de Datos](#schema-de-base-de-datos)
8. [Instrucciones para el Coder](#instrucciones-para-el-coder)

---

## 🎯 VISIÓN GENERAL

### **Problema a Resolver:**

Assembly 2.0 debe manejar **múltiples escenarios** de registro y votación:

1. ✅ **Pre-registro por Admin** - El admin crea los residentes antes de la asamblea
2. ✅ **Auto-registro de Residentes** - Los residentes se registran solos con código de invitación
3. ✅ **Face ID para votar** - Validación biométrica como método principal
4. ✅ **Fallback Manual** - Alternativa cuando Face ID no funciona (celular defectuoso)
5. ✅ **Co-Titulares (2+ propietarios)** - Solo 1 voto por unidad (Ley 284)
6. ✅ **Poderes Digitales** - Un residente puede representar a otro

### **Reglas Legales (Ley 284 Panamá):**

```typescript
interface VotingRules {
  // 1. Solo propietarios AL DÍA pueden votar
  canVote: payment_status === 'AL_DIA';
  
  // 2. 1 voto por unidad (sin importar cuántos co-titulares)
  votesPerUnit: 1;
  
  // 3. El voto se pondera por coeficiente de participación
  voteWeight: unit.coefficient;
  
  // 4. Propietarios EN MORA solo tienen voz (no voto)
  hasVoice: payment_status === 'MORA';
  
  // 5. Se puede votar por poder notarial validado
  canVoteByProxy: hasValidPowerOfAttorney === true;
}
```

---

## 👥 5 ESCENARIOS DE REGISTRO

### **ESCENARIO 1: Pre-Registro por Administrador (Recomendado)**

**Flujo:**
```
Admin PH → Dashboard → Residentes → Importar Excel/CSV
                                  → O Agregar manual
```

**Excel de Importación:**

| unidad | email | nombre | apellido | cedula | es_titular | telefono |
|--------|-------|--------|----------|--------|-----------|----------|
| 101-A | carlos@email.com | Carlos | Martínez | 8-123-456 | SI | +507-6123-4567 |
| 101-A | maria@email.com | María | López | 8-789-012 | SI | +507-6789-0123 |
| 102-B | jose@email.com | José | Pérez | 8-345-678 | SI | - |

**Código (Admin Dashboard):**

```typescript
// app/dashboard/admin-ph/residents/import/page.tsx

export default function ImportResidentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ResidentImportRow[]>([]);
  
  const handleImport = async () => {
    const formData = new FormData();
    formData.append('file', file!);
    formData.append('property_id', propertyId);
    
    const response = await fetch('/api/residents/import', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success(`✅ ${result.imported} residentes importados`);
      
      // Enviar invitaciones por email automáticamente
      await sendInvitations(result.residents);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h2>Importar Residentes</h2>
      </CardHeader>
      
      <div className="space-y-4">
        {/* Upload de Excel */}
        <FileUpload 
          accept=".xlsx,.csv"
          onChange={setFile}
        />
        
        {/* Preview de datos */}
        {preview.length > 0 && (
          <DataTable 
            data={preview}
            columns={[
              { key: 'unidad', label: 'Unidad' },
              { key: 'nombre', label: 'Nombre' },
              { key: 'email', label: 'Email' },
              { key: 'es_titular', label: 'Titular' },
              { key: 'status', label: 'Estado' }
            ]}
          />
        )}
        
        {/* Opciones de invitación */}
        <Card className="bg-blue-50">
          <CardHeader>
            <h3>📧 Invitaciones Automáticas</h3>
          </CardHeader>
          <div className="space-y-2">
            <Checkbox 
              label="Enviar emails de invitación inmediatamente"
              defaultChecked
            />
            <Checkbox 
              label="Enviar SMS con código de acceso"
            />
            <Checkbox 
              label="Generar códigos QR para WhatsApp"
            />
          </div>
        </Card>
        
        <Button onClick={handleImport} size="lg">
          Importar {preview.length} Residentes
        </Button>
      </div>
    </Card>
  );
}
```

**API Endpoint:**

```typescript
// app/api/residents/import/route.ts

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const propertyId = formData.get('property_id') as string;
  
  // 1. Parsear Excel/CSV
  const workbook = XLSX.read(await file.arrayBuffer());
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: ResidentImportRow[] = XLSX.utils.sheet_to_json(sheet);
  
  const imported: string[] = [];
  const errors: string[] = [];
  
  for (const row of rows) {
    try {
      // 2. Validar datos
      if (!row.email || !row.unidad) {
        errors.push(`Fila ${row.__rowNum__}: Email o unidad faltante`);
        continue;
      }
      
      // 3. Buscar unidad
      const { data: unit } = await supabase
        .from('units')
        .select('id, code, property_id')
        .eq('property_id', propertyId)
        .eq('code', row.unidad)
        .single();
      
      if (!unit) {
        errors.push(`Unidad ${row.unidad} no encontrada`);
        continue;
      }
      
      // 4. Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', row.email)
        .maybeSingle();
      
      let userId: string;
      
      if (existingUser) {
        // Usuario ya existe, solo vincular a la unidad
        userId = existingUser.id;
      } else {
        // 5. Crear usuario (sin auth aún)
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            organization_id: organizationId,
            email: row.email,
            first_name: row.nombre,
            last_name: row.apellido,
            cedula: row.cedula,
            phone: row.telefono,
            role: row.es_titular === 'SI' ? 'PROPIETARIO' : 'RESIDENTE',
            email_verified: false
          })
          .select()
          .single();
        
        userId = newUser.id;
      }
      
      // 6. Crear relación unit_owners
      await supabase
        .from('unit_owners')
        .insert({
          unit_id: unit.id,
          user_id: userId,
          ownership: row.es_titular === 'SI' ? 100 : 0, // Titular = 100%, otros = 0%
          is_primary_owner: row.es_titular === 'SI'
        });
      
      // 7. Generar código de invitación
      const invitationCode = generateInvitationCode(); // INV-XXXXX
      
      await supabase
        .from('resident_invitations')
        .insert({
          user_id: userId,
          unit_id: unit.id,
          code: invitationCode,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          status: 'PENDING'
        });
      
      imported.push(row.email);
      
    } catch (error: any) {
      errors.push(`Error en ${row.email}: ${error.message}`);
    }
  }
  
  return Response.json({
    success: true,
    imported: imported.length,
    errors: errors.length,
    residents: imported,
    errorDetails: errors
  });
}

function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin O, 0, I, 1
  let code = 'INV-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

**Email de Invitación Automático:**

```html
<!-- emails/resident-invitation.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Bienvenido a Assembly 2.0</title>
</head>
<body>
  <h1>🏢 Bienvenido a [Nombre PH]</h1>
  
  <p>Hola <strong>{{nombre}}</strong>,</p>
  
  <p>El administrador de <strong>{{nombre_ph}}</strong> te ha registrado en Assembly 2.0 
     para participar en las asambleas de forma digital.</p>
  
  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
    <h3>📍 Tu información:</h3>
    <p>
      <strong>Unidad:</strong> {{unidad}}<br>
      <strong>Rol:</strong> {{rol}}<br>
      <strong>Email:</strong> {{email}}
    </p>
    
    <h3>🔑 Tu código de acceso:</h3>
    <p style="font-size: 32px; font-weight: bold; color: #2563eb;">
      {{invitation_code}}
    </p>
    <p style="font-size: 14px; color: #666;">
      Válido hasta: {{expiry_date}}
    </p>
  </div>
  
  <h3>✅ Pasos siguientes:</h3>
  <ol>
    <li>Descarga la app o ingresa a: <a href="{{app_url}}">assembly20.com</a></li>
    <li>Haz clic en "Ya tengo un código"</li>
    <li>Ingresa tu código: <code>{{invitation_code}}</code></li>
    <li>Configura tu Face ID para votar</li>
  </ol>
  
  <p>
    <a href="{{app_url}}/register?code={{invitation_code}}" 
       style="display: inline-block; background: #2563eb; color: white; 
              padding: 12px 24px; border-radius: 8px; text-decoration: none;">
      Activar mi Cuenta
    </a>
  </p>
  
  <hr>
  
  <p style="font-size: 12px; color: #999;">
    ¿Necesitas ayuda? Habla con Lex, nuestro asistente:
    <a href="https://t.me/Assembly2Bot">@Assembly2Bot</a>
  </p>
</body>
</html>
```

---

### **ESCENARIO 2: Auto-Registro con Código de Invitación**

**Flujo Simplificado:**
```
Residente → Recibe email/SMS con código INV-XXXXX
         → Ingresa a app/web
         → Ingresa código
         → Configura Face ID (el teléfono valida la identidad)
         → ✅ Listo para votar
```

**Importante:** ❌ NO pedimos foto de cédula. El Face ID del teléfono ya confirma la identidad de la persona.

**Página de Registro:**

```typescript
// app/register/page.tsx

export default function RegisterPage() {
  const [step, setStep] = useState<'code' | 'faceid'>('code'); // ⭐ Solo 2 pasos
  const [code, setCode] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  
  const handleValidateCode = async () => {
    const { data, error } = await supabase.rpc('validate_invitation_code', {
      p_code: code
    });
    
    if (error || !data.valid) {
      toast.error('Código inválido o expirado');
      return;
    }
    
    setInvitation(data.invitation);
    setStep('faceid'); // ⭐ Directo a Face ID
  };
  
  const handleSetupFaceId = async () => {
    try {
      // 1. Verificar soporte de WebAuthn
      if (!window.PublicKeyCredential) {
        toast.error('Tu dispositivo no soporta Face ID. Usa voto manual.');
        router.push('/dashboard/resident');
        return;
      }
      
      // 2. Crear credencial WebAuthn
      const challenge = await fetch('/api/auth/webauthn/challenge').then(r => r.json());
      
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: Uint8Array.from(challenge.challenge, c => c.charCodeAt(0)),
          rp: {
            name: 'Assembly 2.0',
            id: window.location.hostname
          },
          user: {
            id: Uint8Array.from(invitation.user_id, c => c.charCodeAt(0)),
            name: invitation.email,
            displayName: `${invitation.first_name} ${invitation.last_name}`
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Face ID / Touch ID
            userVerification: 'required'
          }
        }
      });
      
      // 3. Guardar credencial en BD
      await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        body: JSON.stringify({
          user_id: invitation.user_id,
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            type: credential.type,
            response: {
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              attestationObject: Array.from(new Uint8Array(credential.response.attestationObject))
            }
          }
        })
      });
      
      toast.success('✅ Face ID configurado exitosamente');
      router.push('/dashboard/resident');
      
    } catch (error: any) {
      console.error('Error configurando Face ID:', error);
      toast.error('No se pudo configurar Face ID. Usa voto manual.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1>🏢 Registro en Assembly 2.0</h1>
        </CardHeader>
        
        {step === 'code' && (
          <div className="space-y-4">
            <p>Ingresa el código que recibiste por email:</p>
            <Input 
              placeholder="INV-XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
            <Button onClick={handleValidateCode} fullWidth>
              Continuar
            </Button>
          </div>
        )}
        
        {step === 'faceid' && (
          <div className="space-y-4">
            {/* Confirmación de datos */}
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle>✅ Bienvenido {invitation.first_name}!</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 mt-2">
                  <p><strong>Unidad:</strong> {invitation.unit_code}</p>
                  <p><strong>Email:</strong> {invitation.email}</p>
                  <p><strong>Rol:</strong> {invitation.is_primary_owner ? 'Titular' : 'Residente'}</p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="text-center py-6">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-xl font-bold">Configura Face ID</h3>
              <p className="text-gray-600 mt-2">
                Tu teléfono validará tu identidad usando Face ID / Touch ID.<br/>
                Solo TÚ podrás votar desde este dispositivo.
              </p>
            </div>
            
            <Alert variant="info">
              <AlertTitle>🔐 Seguridad</AlertTitle>
              <AlertDescription>
                El Face ID de tu teléfono confirma tu identidad.<br/>
                No necesitas subir fotos ni documentos.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleSetupFaceId} fullWidth size="lg" className="mt-4">
              🔓 Configurar Face ID Ahora
            </Button>
            
            <Button 
              variant="ghost" 
              fullWidth 
              onClick={() => router.push('/dashboard/resident')}
              className="text-sm"
            >
              Configurar después (usaré voto manual si es necesario)
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
```

---

### **ESCENARIO 3: Residente sin Face ID (Voto Manual)**

**Problema:** El residente no puede configurar Face ID (celular viejo, no soporta biometría, defectuoso).

**Solución:** **Voto Manual** - Solo el administrador puede registrar el voto durante la asamblea.

**2 Modalidades de Voto Manual:**
1. 🏢 **Presencial** - El residente se presenta físicamente, muestra su cédula, el admin registra su voto
2. 📹 **Via Zoom** - El residente abre su cámara en videollamada, el admin lo identifica visualmente, registra su voto

---

#### **FASE A: Durante el Registro (Antes de la Asamblea)**

**Flujo cuando NO puede configurar Face ID:**

```
Residente → Intenta configurar Face ID
         → Error: "Tu dispositivo no soporta Face ID"
         → Sistema le informa: "Tu voto será MANUAL"
         → Se registra sin Face ID (face_id_enabled = false)
         → Recibe instrucciones claras
```

**Pantalla de Registro (cuando falla Face ID):**

```typescript
// app/register/page.tsx - Caso de error Face ID

const handleSetupFaceId = async () => {
  try {
    // Intento configurar Face ID
    if (!window.PublicKeyCredential) {
      throw new Error('NOT_SUPPORTED');
    }
    
    const credential = await navigator.credentials.create({
      publicKey: {
        // ... configuración WebAuthn
      }
    });
    
    // Éxito
    await saveWebAuthnCredential(credential);
    
  } catch (error: any) {
    // ⚠️ Face ID NO disponible
    
    // Marcar usuario como "voto manual"
    await supabase
      .from('users')
      .update({
        mfa_enabled: false,
        webauthn_credentials: [],
        voting_method: 'MANUAL' // ⭐ Nuevo campo
      })
      .eq('id', userId);
    
    // Mostrar modal informativo
    showManualVotingModal();
  }
};

function showManualVotingModal() {
  return (
    <Modal open={true}>
      <div className="text-center space-y-4">
        <div className="text-6xl">✋</div>
        <h2 className="text-xl font-bold">
          Tu voto será MANUAL
        </h2>
        
        <Alert variant="info">
          <AlertTitle>¿Qué significa esto?</AlertTitle>
          <AlertDescription>
            Tu dispositivo no soporta Face ID, por lo que votarás 
            de forma manual durante la asamblea.
          </AlertDescription>
        </Alert>
        
        <div className="bg-blue-50 p-4 rounded-lg text-left">
          <h3 className="font-semibold mb-2">
            📋 ¿Qué debes hacer?
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm mb-1">🏢 Opción 1: PRESENCIAL</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>✅ Asistir a la asamblea en persona</li>
                <li>✅ Traer tu cédula original</li>
                <li>✅ Presentarte ante el administrador</li>
                <li>✅ El admin registrará tu voto</li>
              </ul>
            </div>
            
            <div className="border-t pt-2">
              <p className="font-medium text-sm mb-1">📹 Opción 2: VIA ZOOM</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>✅ Conectarte a la asamblea por Zoom</li>
                <li>✅ Abrir tu cámara (obligatorio)</li>
                <li>✅ El admin te identificará visualmente</li>
                <li>✅ El admin registrará tu voto</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-lg text-sm">
          <strong>⚠️ Importante:</strong><br/>
          NO podrás votar desde tu celular de forma automática.<br/>
          Puedes elegir: Asistir presencial O conectarte por Zoom.
        </div>
        
        <Button onClick={() => {
          router.push('/dashboard/resident');
          // Enviar email informativo
          sendManualVotingEmail(userId);
        }}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
```

**Email Automático (después del registro):**

```html
<!-- emails/manual-voting-notification.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Configuración de Votación - Assembly 2.0</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>✋ Tu voto será MANUAL</h1>
    
    <p>Hola <strong>{{nombre}}</strong>,</p>
    
    <p>Te registraste exitosamente en Assembly 2.0, pero tu dispositivo 
       no soporta Face ID.</p>
    
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h3 style="margin-top: 0;">⚠️ Tu voto será MANUAL</h3>
      <p>Esto significa que votarás en persona durante la asamblea.</p>
    </div>
    
    <h3>📋 ¿Qué debes hacer?</h3>
    
    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <h4>🏢 Opción 1: PRESENCIAL</h4>
      <ul>
        <li>✅ Asistir a la asamblea en persona</li>
        <li>✅ Traer tu cédula original</li>
        <li>✅ Presentarte ante el administrador</li>
        <li>✅ El admin registrará tu voto</li>
      </ul>
    </div>
    
    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <h4>📹 Opción 2: VIA ZOOM</h4>
      <ul>
        <li>✅ Conectarte a la asamblea por Zoom</li>
        <li>✅ Abrir tu cámara (obligatorio)</li>
        <li>✅ El admin te identificará visualmente</li>
        <li>✅ El admin registrará tu voto</li>
      </ul>
    </div>
    
    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">💡 ¿Por qué voto manual?</h3>
      <p>Tu dispositivo no tiene Face ID o Touch ID, que son necesarios 
         para votar de forma digital y segura. El voto manual garantiza 
         que tu voz sea escuchada.</p>
    </div>
    
    <h3>📅 Próxima Asamblea:</h3>
    <p>
      <strong>Fecha:</strong> {{fecha_asamblea}}<br>
      <strong>Hora:</strong> {{hora_asamblea}}<br>
      <strong>Lugar:</strong> {{lugar_asamblea}}
    </p>
    
    <p>
      <strong>🔔 Recordatorio:</strong><br>
      Te enviaremos un SMS el día de la asamblea para recordarte 
      traer tu cédula.
    </p>
    
    <hr style="margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      ¿Preguntas? Habla con Lex: 
      <a href="https://t.me/Assembly2Bot">@Assembly2Bot</a><br>
      Comando: /mivoto
    </p>
  </div>
</body>
</html>
```

---

#### **FASE B: Recordatorio Antes de la Asamblea**

**SMS/WhatsApp Automático (1 día antes):**

```
📢 Asamblea mañana - P.H. Urban Tower

Hola Carlos, tu voto será MANUAL.

Puedes elegir:

🏢 PRESENCIAL
✅ Traer tu cédula
✅ Llegar 15 min antes
📍 [Dirección]

📹 VIA ZOOM
✅ Abrir tu cámara
✅ Link: [zoom.us/xxx]

🕐 Hora: [Hora]

¿Dudas? /mivoto en @Assembly2Bot
```

**Trigger Automático:**

```typescript
// Función que se ejecuta 24 horas antes de la asamblea
async function sendManualVotingReminders(assemblyId: string) {
  // Buscar todos los residentes sin Face ID que pueden votar
  const { data: manualVoters } = await supabase
    .from('users')
    .select(`
      id,
      first_name,
      phone,
      email,
      unit:unit_owners(
        unit:units(
          code,
          payment_status
        )
      )
    `)
    .eq('voting_method', 'MANUAL')
    .eq('unit.unit.payment_status', 'AL_DIA'); // Solo AL DÍA
  
  for (const voter of manualVoters) {
    // Enviar SMS
    await sendSMS(voter.phone, `
      📢 Asamblea mañana
      
      Hola ${voter.first_name}, tu voto será MANUAL.
      
      ✅ Trae tu cédula original
      ✅ Llega 15 min antes
      
      Unidad: ${voter.unit.unit.code}
    `);
    
    // Enviar WhatsApp (si está configurado)
    await sendWhatsApp(voter.phone, {
      template: 'manual_voting_reminder',
      variables: {
        nombre: voter.first_name,
        unidad: voter.unit.unit.code,
        fecha: assembly.scheduled_date,
        lugar: assembly.location
      }
    });
  }
}
```

---

#### **FASE C: Durante la Asamblea (Dashboard Admin)**

**Flujo en Vivo:**

```
Admin → Dashboard Asamblea en Vivo
     → Sección: "Votación Manual"
     → Lista: Residentes sin Face ID
     → Residente se presenta físicamente
     → Admin valida cédula
     → Admin registra voto
     → Sistema audita: quién, cuándo, método
```

**Dashboard Admin (durante asamblea):**

```typescript
// app/dashboard/admin-ph/assembly/[id]/live/page.tsx

export function LiveAssemblyControl() {
  const [manualVoteMode, setManualVoteMode] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showManualVotersPanel, setShowManualVotersPanel] = useState(true);
  
  // Obtener lista de residentes que requieren voto manual
  const { data: manualVoters } = useQuery('manual-voters', async () => {
    const { data } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        cedula,
        phone,
        unit_owners!inner(
          is_primary_owner,
          unit:units(
            id,
            code,
            coefficient,
            payment_status
          )
        )
      `)
      .eq('voting_method', 'MANUAL')
      .eq('unit_owners.is_primary_owner', true)
      .eq('unit_owners.unit.payment_status', 'AL_DIA');
    
    return data;
  });
  
  const handleManualVote = async (votationId: string, vote: 'SI' | 'NO' | 'ABSTENCION') => {
    // Validar ubicación seleccionada
    if (!votingLocation) {
      toast.error('Selecciona si está Presencial o via Zoom');
      return;
    }
    
    // Validar que el residente sea titular y esté AL DÍA
    if (!selectedResident.is_primary_owner) {
      toast.error('Este residente no es el titular de la unidad');
      return;
    }
    
    if (selectedResident.payment_status !== 'AL_DIA') {
      toast.error('Esta unidad está en mora. Solo tiene derecho a voz.');
      return;
    }
    
    // Verificar que no haya votado ya
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('votation_id', votationId)
      .eq('unit_id', selectedResident.unit_id)
      .maybeSingle();
    
    if (existingVote) {
      toast.error('Esta unidad ya votó en este tema');
      return;
    }
    
    // Registrar voto manual
    await supabase.from('votes').insert({
      votation_id: votationId,
      user_id: selectedResident.user_id,
      unit_id: selectedResident.unit_id,
      vote: vote,
      verification_method: 'MANUAL', // ⭐ Marcado como manual
      voting_location: votingLocation, // ⭐ PRESENCIAL o ZOOM
      coefficient: selectedResident.coefficient,
      voted_at: new Date().toISOString(),
      verified_by: currentAdminId, // Quién lo registró
      notes: `Voto manual ${votingLocation === 'ZOOM' ? 'via Zoom' : 'presencial'}: Identidad verificada visualmente`
    });
    
    toast.success(`✅ Voto de ${selectedResident.first_name} registrado (${votingLocation === 'ZOOM' ? 'Zoom' : 'Presencial'})`);
    setManualVoteMode(false);
    setSelectedResident(null);
    setVotingLocation(null);
  };
  
  return (
    <div className="space-y-6">
      {/* ⭐ Panel de Voto Manual - Siempre visible */}
      {manualVoters && manualVoters.length > 0 && (
        <Alert variant="warning" className="border-l-4 border-orange-500">
          <AlertTitle className="flex items-center gap-2">
            ✋ {manualVoters.length} residentes con VOTO MANUAL
          </AlertTitle>
          <AlertDescription>
            Estos residentes no tienen Face ID. Deben presentarse físicamente 
            con su cédula para votar.
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setShowManualVotersPanel(!showManualVotersPanel)}
            >
              {showManualVotersPanel ? 'Ocultar' : 'Ver'} lista
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Lista de residentes con voto manual */}
      {showManualVotersPanel && manualVoters && manualVoters.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <h3 className="font-bold">📋 Residentes con Voto Manual</h3>
            <p className="text-sm text-gray-600">
              Marca cuando se presenten físicamente
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualVoters.map(voter => {
                  const hasVoted = votes.some(v => v.unit_id === voter.unit_owners[0].unit.id);
                  const vote = votes.find(v => v.unit_id === voter.unit_owners[0].unit.id);
                  
                  return (
                    <TableRow 
                      key={voter.id}
                      className={hasVoted ? 'bg-green-50' : ''}
                    >
                      <TableCell className="font-medium">
                        {voter.unit_owners[0].unit.code}
                      </TableCell>
                      <TableCell>
                        {voter.first_name} {voter.last_name}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{voter.cedula}</code>
                      </TableCell>
                      <TableCell>
                        {hasVoted ? (
                          <Badge variant={vote.voting_location === 'ZOOM' ? 'info' : 'secondary'}>
                            {vote.voting_location === 'ZOOM' ? '📹 Zoom' : '🏢 Presencial'}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasVoted ? (
                          <Badge variant="success">✅ Ya votó</Badge>
                        ) : (
                          <Badge variant="warning">⏳ Esperando</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!hasVoted && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedResident(voter);
                              setManualVoteMode(true);
                            }}
                          >
                            Registrar Voto
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Grid de paneles principales */}
      <div className="grid grid-cols-2 gap-6">
        {/* Panel izquierdo: Tema de votación actual */}
        <Card>
        <CardHeader>
          <h3>🗳️ Votación Actual</h3>
        </CardHeader>
        <div className="space-y-4">
          <p className="text-lg">{currentVotation.topic}</p>
          
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="A Favor" value={votes.si} color="green" />
            <StatCard label="En Contra" value={votes.no} color="red" />
            <StatCard label="Abstenciones" value={votes.abstencion} color="gray" />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setManualVoteMode(true)}
          >
            📝 Registrar Voto Manual
          </Button>
        </div>
      </Card>
      
      {/* Panel derecho: Asistencia y estado */}
      <Card>
        <CardHeader>
          <h3>👥 Asistencia</h3>
        </CardHeader>
        <AttendanceList residents={residents} />
      </Card>
      
      {/* Modal de voto manual */}
      {manualVoteMode && (
        <Modal onClose={() => setManualVoteMode(false)}>
          <h3>📝 Registrar Voto Manual</h3>
          
          <div className="space-y-4">
            {/* Seleccionar ubicación del votante */}
            {selectedResident && (
              <Alert variant="info">
                <AlertTitle>¿Dónde está el votante?</AlertTitle>
                <div className="flex gap-3 mt-2">
                  <Button
                    variant={votingLocation === 'PRESENCIAL' ? 'default' : 'outline'}
                    onClick={() => setVotingLocation('PRESENCIAL')}
                  >
                    🏢 Presencial
                  </Button>
                  <Button
                    variant={votingLocation === 'ZOOM' ? 'default' : 'outline'}
                    onClick={() => setVotingLocation('ZOOM')}
                  >
                    📹 Via Zoom
                  </Button>
                </div>
              </Alert>
            )}
            
            {/* Buscar residente */}
            <Input 
              placeholder="Buscar por nombre, unidad o cédula..."
              onChange={(e) => searchResident(e.target.value)}
            />
            
            {/* Lista de residentes */}
            <div className="max-h-64 overflow-y-auto">
              {searchResults.map(resident => (
                <div 
                  key={resident.id}
                  className={cn(
                    "p-3 border rounded cursor-pointer hover:bg-gray-50",
                    selectedResident?.id === resident.id && "bg-blue-50 border-blue-500"
                  )}
                  onClick={() => setSelectedResident(resident)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{resident.first_name} {resident.last_name}</p>
                      <p className="text-sm text-gray-600">
                        Unidad: {resident.unit_code} | 
                        Cédula: {resident.cedula}
                      </p>
                    </div>
                    <div>
                      {resident.is_primary_owner ? (
                        <Badge variant="success">Titular</Badge>
                      ) : (
                        <Badge variant="secondary">No titular</Badge>
                      )}
                      {resident.payment_status === 'AL_DIA' ? (
                        <Badge variant="success">Al Día</Badge>
                      ) : (
                        <Badge variant="destructive">Mora</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botones de votación */}
            {selectedResident && selectedResident.is_primary_owner && (
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="success"
                  onClick={() => handleManualVote(currentVotation.id, 'SI')}
                >
                  ✅ A Favor
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleManualVote(currentVotation.id, 'NO')}
                >
                  ❌ En Contra
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handleManualVote(currentVotation.id, 'ABSTENCION')}
                >
                  ⚪ Abstención
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
```

---

## 👨‍👩‍👧 LÓGICA DE CO-TITULARES (2+ Propietarios por Unidad)

### **Regla de Negocio (Ley 284):**

```
Una unidad con múltiples propietarios = 1 SOLO VOTO
```

**Ejemplo:**
```
Unidad 101-A:
- Carlos Martínez (50% propiedad) - Titular Principal ⭐
- María López (50% propiedad) - Co-titular

Resultado: Solo Carlos puede votar (es el titular principal designado)
           María NO puede votar (aunque sea dueña del 50%)
           El voto cuenta como 1 voto con coeficiente de la unidad 101-A
```

### **Esquema de Base de Datos:**

```sql
-- Tabla unit_owners (relación N:M entre unidades y usuarios)
CREATE TABLE unit_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ownership NUMERIC(5,2) DEFAULT 100, -- % de propiedad (50.00, 33.33, etc.)
  is_primary_owner BOOLEAN DEFAULT FALSE, -- ⭐ Solo 1 puede ser true por unidad
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, user_id)
);

-- Constraint: Solo 1 titular principal por unidad
CREATE UNIQUE INDEX idx_unit_primary_owner 
  ON unit_owners(unit_id) 
  WHERE is_primary_owner = TRUE;

-- Vista: Obtener el titular principal de cada unidad
CREATE VIEW primary_owners AS
SELECT 
  uo.unit_id,
  uo.user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.cedula,
  un.code AS unit_code,
  un.coefficient,
  un.payment_status
FROM unit_owners uo
JOIN users u ON u.id = uo.user_id
JOIN units un ON un.id = uo.unit_id
WHERE uo.is_primary_owner = TRUE;
```

### **Validación al Votar:**

```typescript
// lib/voting/validateVoter.ts

export async function validateVoter(userId: string, votationId: string) {
  const supabase = createClient();
  
  // 1. Obtener información del usuario y su unidad
  const { data: voter } = await supabase
    .from('unit_owners')
    .select(`
      id,
      ownership,
      is_primary_owner,
      unit:units (
        id,
        code,
        coefficient,
        payment_status
      ),
      user:users (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('user_id', userId)
    .single();
  
  if (!voter) {
    return {
      canVote: false,
      reason: 'No eres propietario de ninguna unidad'
    };
  }
  
  // 2. VALIDAR: ¿Es el titular principal?
  if (!voter.is_primary_owner) {
    return {
      canVote: false,
      reason: 'Solo el titular principal puede votar. Contacta al otro co-propietario.',
      isPrimaryOwner: false
    };
  }
  
  // 3. VALIDAR: ¿Está AL DÍA?
  if (voter.unit.payment_status !== 'AL_DIA') {
    return {
      canVote: false,
      reason: 'Esta unidad está EN MORA. Solo tienes derecho a voz.',
      paymentStatus: 'MORA'
    };
  }
  
  // 4. VALIDAR: ¿Ya votó en este tema?
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id, vote, voted_at')
    .eq('votation_id', votationId)
    .eq('unit_id', voter.unit.id)
    .maybeSingle();
  
  if (existingVote) {
    return {
      canVote: false,
      reason: `Esta unidad ya votó: ${existingVote.vote} (${new Date(existingVote.voted_at).toLocaleString()})`,
      alreadyVoted: true
    };
  }
  
  // 5. TODO OK - Puede votar
  return {
    canVote: true,
    unitId: voter.unit.id,
    unitCode: voter.unit.code,
    coefficient: voter.unit.coefficient,
    voterName: `${voter.user.first_name} ${voter.user.last_name}`
  };
}
```

### **UI: Mensaje para Co-Titulares No Principales:**

```typescript
// app/vote/[votation_id]/page.tsx

export default async function VotePage({ params }: { params: { votation_id: string } }) {
  const validation = await validateVoter(currentUserId, params.votation_id);
  
  if (!validation.canVote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-red-600">
                No puedes votar
              </h2>
            </div>
          </CardHeader>
          
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Razón:</AlertTitle>
              <AlertDescription>
                {validation.reason}
              </AlertDescription>
            </Alert>
            
            {!validation.isPrimaryOwner && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">💡 ¿Qué significa esto?</h4>
                <p className="text-sm text-gray-700">
                  Tu unidad tiene múltiples propietarios. Según la Ley 284, 
                  solo el <strong>titular principal</strong> puede emitir el voto.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Si quieres ser el titular principal, habla con el administrador.
                </p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              fullWidth 
              onClick={() => router.push('/dashboard/resident')}
              className="mt-4"
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Si puede votar, mostrar interfaz de votación
  return <VotingInterface validation={validation} />;
}
```

---

## 📜 SISTEMA DE PODERES DIGITALES

### **Escenario:**

```
Carlos Martínez (Unidad 101-A) está de viaje.
Le da poder a María López (Unidad 102-B) para que vote por él.
María ahora puede votar por 2 unidades: la suya (102-B) y la de Carlos (101-A).
```

### **Tipos de Poderes:**

1. **Poder Digital** - Subido a la plataforma y validado con OCR de cédulas
2. **Poder Físico** - Presentado físicamente al admin durante la asamblea (registro manual)

### **Schema:**

```sql
CREATE TABLE powers_of_attorney (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Poderdante (quien DA el poder)
  grantor_user_id UUID NOT NULL REFERENCES users(id),
  grantor_unit_id UUID NOT NULL REFERENCES units(id),
  
  -- Apoderado (quien RECIBE el poder)
  attorney_user_id UUID NOT NULL REFERENCES users(id),
  
  -- Documento
  document_url TEXT, -- PDF/imagen del poder notarial
  document_hash TEXT, -- Hash para verificación
  
  -- OCR de cédulas
  grantor_cedula_ocr TEXT, -- Extraído por OCR
  grantor_cedula_match BOOLEAN, -- ¿Coincide con BD?
  attorney_cedula_ocr TEXT,
  attorney_cedula_match BOOLEAN,
  
  -- Validación
  status validation_status DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  validated_by UUID REFERENCES users(id), -- Admin que lo validó
  validated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Vigencia
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- Opcional: poder permanente o temporal
  
  -- Alcance
  applies_to_assembly_id UUID REFERENCES assemblies(id), -- NULL = todos
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_powers_grantor ON powers_of_attorney(grantor_user_id);
CREATE INDEX idx_powers_attorney ON powers_of_attorney(attorney_user_id);
CREATE INDEX idx_powers_status ON powers_of_attorney(status);
```

### **Flujo: Subir Poder Digital**

```typescript
// app/dashboard/resident/powers/upload/page.tsx

export default function UploadPowerOfAttorneyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [attorneyEmail, setAttorneyEmail] = useState('');
  const [validUntil, setValidUntil] = useState<Date | null>(null);
  const [applyToAssembly, setApplyToAssembly] = useState<string>('all');
  
  const handleUpload = async () => {
    // 1. Upload PDF/imagen a Supabase Storage
    const filePath = `powers/${currentUserId}/${Date.now()}_${file.name}`;
    const { data: uploadData } = await supabase.storage
      .from('legal-documents')
      .upload(filePath, file);
    
    const documentUrl = supabase.storage
      .from('legal-documents')
      .getPublicUrl(filePath).data.publicUrl;
    
    // 2. Procesar con OCR (Google Vision API)
    const ocrResult = await fetch('/api/ocr/process-power', {
      method: 'POST',
      body: JSON.stringify({ documentUrl })
    }).then(r => r.json());
    
    // 3. Buscar apoderado por email
    const { data: attorney } = await supabase
      .from('users')
      .select('id, cedula, first_name, last_name')
      .eq('email', attorneyEmail)
      .single();
    
    if (!attorney) {
      toast.error('El apoderado no está registrado en el sistema');
      return;
    }
    
    // 4. Crear registro de poder
    const { data: power } = await supabase
      .from('powers_of_attorney')
      .insert({
        grantor_user_id: currentUserId,
        grantor_unit_id: currentUserUnitId,
        attorney_user_id: attorney.id,
        document_url: documentUrl,
        document_hash: await hashFile(file),
        grantor_cedula_ocr: ocrResult.grantor_cedula,
        grantor_cedula_match: ocrResult.grantor_cedula === currentUserCedula,
        attorney_cedula_ocr: ocrResult.attorney_cedula,
        attorney_cedula_match: ocrResult.attorney_cedula === attorney.cedula,
        valid_until: validUntil?.toISOString(),
        applies_to_assembly_id: applyToAssembly !== 'all' ? applyToAssembly : null,
        status: 'PENDING' // Requiere aprobación del admin
      })
      .select()
      .single();
    
    toast.success('✅ Poder subido. Esperando aprobación del administrador.');
    router.push('/dashboard/resident/powers');
  };
  
  return (
    <Card>
      <CardHeader>
        <h2>📜 Otorgar Poder de Representación</h2>
      </CardHeader>
      
      <div className="space-y-6">
        <Alert variant="info">
          <AlertTitle>¿Qué es un poder?</AlertTitle>
          <AlertDescription>
            Es un documento notarial que autoriza a otra persona a votar por ti.
            Debe incluir ambas cédulas (poderdante y apoderado).
          </AlertDescription>
        </Alert>
        
        {/* Upload documento */}
        <div>
          <label className="block text-sm font-medium mb-2">
            1️⃣ Documento del Poder (PDF o Imagen)
          </label>
          <FileUpload 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={setFile}
          />
        </div>
        
        {/* Email del apoderado */}
        <div>
          <label className="block text-sm font-medium mb-2">
            2️⃣ Email del Apoderado
          </label>
          <Input 
            type="email"
            placeholder="maria.lopez@email.com"
            value={attorneyEmail}
            onChange={(e) => setAttorneyEmail(e.target.value)}
          />
          <p className="text-sm text-gray-600 mt-1">
            Debe estar registrado en el sistema
          </p>
        </div>
        
        {/* Vigencia */}
        <div>
          <label className="block text-sm font-medium mb-2">
            3️⃣ Vigencia del Poder
          </label>
          <Select value={validUntil ? 'temporary' : 'permanent'}>
            <option value="permanent">Permanente</option>
            <option value="temporary">Temporal</option>
          </Select>
          
          {validUntil && (
            <DatePicker 
              label="Válido hasta:"
              value={validUntil}
              onChange={setValidUntil}
            />
          )}
        </div>
        
        {/* Alcance */}
        <div>
          <label className="block text-sm font-medium mb-2">
            4️⃣ ¿Para qué asambleas aplica?
          </label>
          <Select value={applyToAssembly} onChange={(e) => setApplyToAssembly(e.target.value)}>
            <option value="all">Todas las asambleas</option>
            {upcomingAssemblies.map(assembly => (
              <option key={assembly.id} value={assembly.id}>
                {assembly.title} - {new Date(assembly.scheduled_date).toLocaleDateString()}
              </option>
            ))}
          </Select>
        </div>
        
        <Button onClick={handleUpload} fullWidth size="lg">
          📤 Subir Poder
        </Button>
      </div>
    </Card>
  );
}
```

### **Dashboard Admin: Validar Poderes**

```typescript
// app/dashboard/admin-ph/powers/page.tsx

export default function PowersManagementPage() {
  const { data: pendingPowers } = useQuery('pending-powers', async () => {
    const { data } = await supabase
      .from('powers_of_attorney')
      .select(`
        *,
        grantor:users!grantor_user_id(first_name, last_name, email, cedula),
        attorney:users!attorney_user_id(first_name, last_name, email, cedula),
        unit:units(code)
      `)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });
    
    return data;
  });
  
  const handleApprove = async (powerId: string) => {
    await supabase
      .from('powers_of_attorney')
      .update({
        status: 'APPROVED',
        validated_by: currentAdminId,
        validated_at: new Date().toISOString()
      })
      .eq('id', powerId);
    
    toast.success('✅ Poder aprobado');
    refetch();
  };
  
  const handleReject = async (powerId: string, reason: string) => {
    await supabase
      .from('powers_of_attorney')
      .update({
        status: 'REJECTED',
        validated_by: currentAdminId,
        validated_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', powerId);
    
    toast.success('Poder rechazado');
    refetch();
  };
  
  return (
    <div>
      <h1>📜 Poderes de Representación</h1>
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes ({pendingPowers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="approved">Aprobados</TabsTrigger>
          <TabsTrigger value="rejected">Rechazados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingPowers?.map(power => (
              <Card key={power.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">
                        {power.grantor.first_name} {power.grantor.last_name} 
                        → {power.attorney.first_name} {power.attorney.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Unidad: {power.unit.code} | 
                        Subido: {new Date(power.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="warning">Pendiente</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Preview del documento */}
                  <div>
                    <a 
                      href={power.document_url} 
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      📄 Ver Documento
                    </a>
                  </div>
                  
                  {/* Validación OCR */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium">Poderdante:</p>
                      <p className="text-sm">
                        Cédula BD: {power.grantor.cedula}
                      </p>
                      <p className="text-sm">
                        Cédula OCR: {power.grantor_cedula_ocr}
                      </p>
                      {power.grantor_cedula_match ? (
                        <Badge variant="success">✅ Coincide</Badge>
                      ) : (
                        <Badge variant="destructive">❌ No coincide</Badge>
                      )}
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium">Apoderado:</p>
                      <p className="text-sm">
                        Cédula BD: {power.attorney.cedula}
                      </p>
                      <p className="text-sm">
                        Cédula OCR: {power.attorney_cedula_ocr}
                      </p>
                      {power.attorney_cedula_match ? (
                        <Badge variant="success">✅ Coincide</Badge>
                      ) : (
                        <Badge variant="destructive">❌ No coincide</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex gap-3">
                    <Button 
                      variant="success"
                      onClick={() => handleApprove(power.id)}
                    >
                      ✅ Aprobar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('Razón del rechazo:');
                        if (reason) handleReject(power.id, reason);
                      }}
                    >
                      ❌ Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### **Validación al Votar con Poder:**

```typescript
// lib/voting/validateVoterWithPower.ts

export async function validateVoterWithPower(
  userId: string, 
  votationId: string,
  unitId?: string // Si vota por otra unidad (con poder)
) {
  // Si no especifica unidad, vota por la suya
  if (!unitId) {
    return validateVoter(userId, votationId);
  }
  
  // Verificar que tiene poder válido para esa unidad
  const { data: power } = await supabase
    .from('powers_of_attorney')
    .select(`
      *,
      grantor_unit:units!grantor_unit_id(
        id,
        code,
        coefficient,
        payment_status
      )
    `)
    .eq('attorney_user_id', userId)
    .eq('grantor_unit_id', unitId)
    .eq('status', 'APPROVED')
    .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
    .or(`applies_to_assembly_id.is.null,applies_to_assembly_id.eq.${assemblyId}`)
    .maybeSingle();
  
  if (!power) {
    return {
      canVote: false,
      reason: 'No tienes un poder válido para votar por esta unidad'
    };
  }
  
  // Validar que la unidad esté AL DÍA
  if (power.grantor_unit.payment_status !== 'AL_DIA') {
    return {
      canVote: false,
      reason: 'La unidad que representas está EN MORA'
    };
  }
  
  // Validar que no haya votado ya
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('votation_id', votationId)
    .eq('unit_id', unitId)
    .maybeSingle();
  
  if (existingVote) {
    return {
      canVote: false,
      reason: 'Esta unidad ya votó'
    };
  }
  
  return {
    canVote: true,
    unitId: power.grantor_unit.id,
    unitCode: power.grantor_unit.code,
    coefficient: power.grantor_unit.coefficient,
    votingByPower: true,
    powerId: power.id
  };
}
```

---

## 🤖 INTEGRACIÓN CON CHATBOT LEX

### **Comando: `/registrarme` (para residentes)**

```
Residente: /registrarme

Lex: ¡Hola! 👋 Te ayudo a registrarte en Assembly 2.0.
     
     ¿Tienes un código de invitación?
     (Tu administrador te lo envió por email)

Usuario: INV-ABC123

Lex: [🔍 Validando código...]
     
     [SI ES VÁLIDO]
     ✅ Código válido!
     
     📍 Tu información:
     Nombre: Carlos Martínez
     Unidad: 101-A
     PH: Urban Tower
     
     Ahora configura Face ID para votar:
     👉 https://assembly20.com/register?code=INV-ABC123
     
     💡 Tu teléfono validará tu identidad con Face ID.
     No necesitas subir fotos ni documentos.
     
     ¿Necesitas ayuda con Face ID? /ayudafaceid
```

### **Comando: `/mivoto` (consultar método de votación)** 🆕

```
Residente: /mivoto

Lex: [🔍 Consultando tu configuración...]

     [CASO A: Tiene Face ID configurado]
     
     ✅ Tu voto es DIGITAL
     
     📱 Método: Face ID / Touch ID
     🏢 Unidad: 101-A
     👤 Titular: Sí
     💳 Estado de pago: Al Día
     
     Cuando haya una votación:
     1️⃣ Recibirás notificación
     2️⃣ Abre el link desde tu celular
     3️⃣ Confirma con Face ID
     4️⃣ ¡Listo! Tu voto queda registrado
     
     ¿Dudas? /ayuda
     
     
     [CASO B: Voto Manual]
     
     ✋ Tu voto es MANUAL
     
     ⚠️ No tienes Face ID configurado
     🏢 Unidad: 102-B
     👤 Titular: Sí
     💳 Estado de pago: Al Día
     
     ¿Qué significa?
     El administrador registrará tu voto durante la asamblea.
     
     📋 PUEDES ELEGIR:
     
     🏢 OPCIÓN 1: PRESENCIAL
     ✅ Asistir a la asamblea
     ✅ Traer tu cédula original
     ✅ Presentarte ante el administrador
     ✅ El admin registrará tu voto
     
     📹 OPCIÓN 2: VIA ZOOM
     ✅ Conectarte a la asamblea por Zoom
     ✅ Abrir tu cámara (obligatorio)
     ✅ El admin te identificará visualmente
     ✅ El admin registrará tu voto
     
     📅 Próxima asamblea:
     Fecha: 15 de Febrero, 2026
     Hora: 6:00 PM
     Lugar: Salón Comunal
     Zoom: https://zoom.us/j/123456789
     
     🔔 Te recordaremos 1 día antes
     
     ¿Por qué manual? Tu dispositivo no soporta Face ID.
     
     
     [CASO C: No es titular - No puede votar]
     
     ⚠️ No puedes votar
     
     Razón: No eres el titular principal de tu unidad.
     
     🏢 Unidad: 103-C
     👥 Co-titulares: María López (titular), tú (co-titular)
     
     Solo el titular principal puede votar según la Ley 284.
     
     ¿Quieres ser el titular? Contacta al administrador.
```

---

### **Comando: `/votarconpoder` (votar por otro)**

```
Residente: /votarconpoder

Lex: 📜 Tienes poderes activos para votar por:
     
     1️⃣ Unidad 103-C (María López)
     2️⃣ Unidad 205-A (José Pérez)
     
     ¿Por cuál quieres votar?

Usuario: 1

Lex: Perfecto! Votarás por la Unidad 103-C.
     
     👉 Ingresa aquí: https://assembly20.com/vote/[id]?power=[power_id]
     
     Confirma con Face ID cuando te lo pida.
```

### **Comando: `/subir poder`**

```
Residente: /subirpoder

Lex: 📜 Te ayudo a subir un poder de representación.
     
     Necesitarás:
     ✅ Documento notarial (PDF o foto)
     ✅ Email del apoderado
     ✅ Cédulas de ambos
     
     📤 Por favor, envíame el documento del poder.

Usuario: [Envía PDF]

Lex: [📄 Procesando documento...]
     
     ✅ Documento recibido!
     
     ¿Cuál es el email del apoderado?

Usuario: maria.lopez@email.com

Lex: [🔍 Verificando...]
     
     ✅ María López encontrada en el sistema.
     Unidad: 102-B
     
     ¿Este poder es permanente o temporal?
     
     [Botones inline:]
     [🔄 Permanente] [📅 Temporal]

Usuario: [Selecciona Permanente]

Lex: ✅ Poder subido exitosamente!
     
     📊 Estado: Pendiente de aprobación
     
     El administrador lo revisará en las próximas 24 horas.
     Te notificaremos cuando esté aprobado.
     
     Puedes ver el estado en: /mispoderes
```

---

## 📊 SCHEMA SQL COMPLETO

```sql
-- ============================================
-- REGISTRO Y VOTACIÓN DE RESIDENTES
-- Fecha: 29 Enero 2026
-- ============================================

-- 1. TABLA: INVITACIONES
-- ============================================

CREATE TABLE resident_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL, -- INV-XXXXX
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, EXPIRED
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_code ON resident_invitations(code);
CREATE INDEX idx_invitations_status ON resident_invitations(status);

-- Función para validar código de invitación
CREATE OR REPLACE FUNCTION validate_invitation_code(p_code TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  invitation JSONB
) AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  SELECT * INTO v_invitation
  FROM resident_invitations ri
  JOIN users u ON u.id = ri.user_id
  JOIN units un ON un.id = ri.unit_id
  WHERE ri.code = p_code
    AND ri.status = 'PENDING'
    AND (ri.expires_at IS NULL OR ri.expires_at > NOW());
  
  IF v_invitation IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::JSONB;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    TRUE,
    jsonb_build_object(
      'user_id', v_invitation.user_id,
      'email', v_invitation.email,
      'first_name', v_invitation.first_name,
      'last_name', v_invitation.last_name,
      'cedula', v_invitation.cedula,
      'unit_id', v_invitation.unit_id,
      'unit_code', v_invitation.code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. TABLA: PODERES DE REPRESENTACIÓN
-- ============================================

CREATE TABLE powers_of_attorney (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  grantor_user_id UUID NOT NULL REFERENCES users(id),
  grantor_unit_id UUID NOT NULL REFERENCES units(id),
  attorney_user_id UUID NOT NULL REFERENCES users(id),
  
  document_url TEXT,
  document_hash TEXT,
  
  grantor_cedula_ocr TEXT,
  grantor_cedula_match BOOLEAN,
  attorney_cedula_ocr TEXT,
  attorney_cedula_match BOOLEAN,
  
  status validation_status DEFAULT 'PENDING',
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  applies_to_assembly_id UUID REFERENCES assemblies(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_powers_grantor ON powers_of_attorney(grantor_user_id);
CREATE INDEX idx_powers_attorney ON powers_of_attorney(attorney_user_id);
CREATE INDEX idx_powers_status ON powers_of_attorney(status);

-- ============================================
-- 3. ACTUALIZAR TABLA: UNIT_OWNERS
-- ============================================

ALTER TABLE unit_owners
  ADD COLUMN IF NOT EXISTS is_primary_owner BOOLEAN DEFAULT FALSE;

-- Constraint: Solo 1 titular principal por unidad
CREATE UNIQUE INDEX idx_unit_primary_owner 
  ON unit_owners(unit_id) 
  WHERE is_primary_owner = TRUE;

-- ============================================
-- 4. ACTUALIZAR TABLA: VOTES
-- ============================================

-- Enum para ubicación de voto manual
CREATE TYPE voting_location AS ENUM ('PRESENCIAL', 'ZOOM');

ALTER TABLE votes
  ADD COLUMN IF NOT EXISTS power_of_attorney_id UUID REFERENCES powers_of_attorney(id),
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id), -- Para votos manuales
  ADD COLUMN IF NOT EXISTS voting_location voting_location, -- PRESENCIAL o ZOOM
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX idx_votes_location ON votes(voting_location) WHERE voting_location IS NOT NULL;

-- ============================================
-- 5. VISTA: PRIMARY_OWNERS
-- ============================================

CREATE OR REPLACE VIEW primary_owners AS
SELECT 
  uo.unit_id,
  uo.user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.cedula,
  un.code AS unit_code,
  un.coefficient,
  un.payment_status,
  uo.ownership
FROM unit_owners uo
JOIN users u ON u.id = uo.user_id
JOIN units un ON un.id = uo.unit_id
WHERE uo.is_primary_owner = TRUE;

-- ============================================
-- 6. FUNCIÓN: GET_VOTER_POWERS
-- ============================================

CREATE OR REPLACE FUNCTION get_voter_powers(p_user_id UUID, p_assembly_id UUID)
RETURNS TABLE (
  power_id UUID,
  unit_id UUID,
  unit_code TEXT,
  grantor_name TEXT,
  coefficient NUMERIC,
  payment_status payment_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id AS power_id,
    u.id AS unit_id,
    u.code AS unit_code,
    usr.first_name || ' ' || usr.last_name AS grantor_name,
    u.coefficient,
    u.payment_status
  FROM powers_of_attorney pa
  JOIN units u ON u.id = pa.grantor_unit_id
  JOIN users usr ON usr.id = pa.grantor_user_id
  WHERE pa.attorney_user_id = p_user_id
    AND pa.status = 'APPROVED'
    AND (pa.valid_until IS NULL OR pa.valid_until > NOW())
    AND (pa.applies_to_assembly_id IS NULL OR pa.applies_to_assembly_id = p_assembly_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIN SCHEMA RESIDENTES
-- ============================================
```

---

## 🔨 INSTRUCCIONES PARA EL CODER

### **Checklist Completo:**

#### **FASE 1: Base de Datos**
- [ ] Ejecutar SQL completo (tablas + funciones)
- [ ] Crear enum `voting_method` (FACE_ID, MANUAL) 🆕
- [ ] Crear tabla `resident_invitations`
- [ ] Crear tabla `powers_of_attorney`
- [ ] Actualizar `unit_owners` (columna `is_primary_owner`)
- [ ] Actualizar `users` (columna `voting_method`) 🆕
- [ ] Actualizar `votes` (columnas para poderes y votos manuales)
- [ ] Crear función `validate_invitation_code()`
- [ ] Crear función `get_voter_powers()`
- [ ] Crear vista `primary_owners`

#### **FASE 2: Admin Dashboard - Importar Residentes**
- [ ] `app/dashboard/admin-ph/residents/import/page.tsx`
- [ ] `app/api/residents/import/route.ts`
- [ ] Lógica de parseo Excel/CSV
- [ ] Generación de códigos de invitación (INV-XXXXX)
- [ ] Envío automático de emails con código

#### **FASE 3: Registro de Residentes** ⭐ SIMPLIFICADO
- [ ] `app/register/page.tsx` - Flujo completo (**solo 2 pasos**)
- [ ] Paso 1: Validar código de invitación
- [ ] Paso 2: Configurar Face ID (WebAuthn) - **el teléfono valida la identidad**
- [ ] ❌ **NO** implementar OCR de cédula para registro
- [ ] Fallback: Si Face ID falla → Modal informativo 🆕
- [ ] Marcar usuario con `voting_method = 'MANUAL'` 🆕
- [ ] Enviar email automático: "Tu voto será manual" 🆕
- [ ] Dashboard residente: Banner si es voto manual 🆕

#### **FASE 4: Sistema de Votación**
- [ ] `lib/voting/validateVoter.ts` - Validar si puede votar
- [ ] `lib/voting/validateVoterWithPower.ts` - Votar con poder
- [ ] Validación: Solo titular principal puede votar
- [ ] Validación: 1 voto por unidad
- [ ] Validación: Solo AL DÍA puede votar

#### **FASE 5: Voto Manual (Fallback)** ⭐ ACTUALIZADO
- [ ] `app/dashboard/admin-ph/assembly/[id]/live/page.tsx`
- [ ] Panel destacado: "Residentes con voto manual" 🆕
- [ ] Tabla con lista de residentes sin Face ID 🆕
- [ ] Estado: "Ya votó" vs "Esperando" 🆕
- [ ] Modal de voto manual (existente)
- [ ] Búsqueda de residentes (existente)
- [ ] Registro de voto con `verification_method: 'MANUAL'`
- [ ] Auditoría: quién registró el voto
- [ ] Función: Enviar recordatorios SMS 1 día antes 🆕

#### **FASE 6: Poderes Digitales**
- [ ] `app/dashboard/resident/powers/upload/page.tsx` - Subir poder
- [ ] `app/dashboard/admin-ph/powers/page.tsx` - Validar poderes
- [ ] `app/api/ocr/process-power/route.ts` - OCR de cédulas
- [ ] Lógica de aprobación/rechazo
- [ ] UI: Lista de unidades que puede representar

#### **FASE 7: Integración Chatbot** ⭐ ACTUALIZADO
- [ ] Comando `/registrarme` - Registro via Telegram
- [ ] Comando `/mivoto` - Consultar método de votación 🆕
- [ ] Respuesta: Face ID vs Manual 🆕
- [ ] Si es manual: Instrucciones claras 🆕
- [ ] Comando `/votarconpoder` - Listar poderes
- [ ] Comando `/subirpoder` - Upload vía chatbot
- [ ] Comando `/mispoderes` - Ver estado de poderes
- [ ] ❌ **NO** validar cédula en registro (solo Face ID)
- [ ] ✅ **SÍ** validar cédula en poderes (OCR necesario)

#### **FASE 8: Testing**
- [ ] Test: Importar Excel con 50 residentes
- [ ] Test: Registro con código de invitación
- [ ] Test: Configurar Face ID exitosamente
- [ ] Test: Co-titular NO puede votar
- [ ] Test: Titular principal SÍ puede votar
- [ ] Test: Votar con poder válido
- [ ] Test: Voto manual (sin Face ID)
- [ ] Test: Validar que 1 unidad = 1 voto

---

## ✅ RESUMEN FINAL

### **Problemas Resueltos:**

1. ✅ **Pre-registro por admin** - Import Excel + emails automáticos
2. ✅ **Auto-registro de residentes** - Código de invitación + Face ID
3. ✅ **Face ID + Fallback** - WebAuthn o voto manual
4. ✅ **Co-titulares** - Solo 1 voto por unidad (titular principal)
5. ✅ **Poderes digitales** - Upload, OCR, validación, votar por otro
6. ✅ **Integración chatbot** - Comandos completos para residentes

### **Cumplimiento Ley 284:**

| Requisito Legal | ✅ Implementado |
|-----------------|----------------|
| 1 voto por unidad | ✅ Constraint BD + validación |
| Solo AL DÍA puede votar | ✅ Validación payment_status |
| Voto ponderado por coeficiente | ✅ Campo coefficient en votos |
| EN MORA solo voz | ✅ Bloqueado en UI |
| Poderes notariales válidos | ✅ OCR + validación admin |
| Auditoría completa | ✅ Logs, firmas, timestamps |

---

**Fecha:** 29 Enero 2026  
**Versión:** 1.0  
**Status:** 🟢 LISTO PARA IMPLEMENTAR

---

🎯 **SIGUIENTE PASO:** Henry revisa y aprueba para enviar al Coder.
