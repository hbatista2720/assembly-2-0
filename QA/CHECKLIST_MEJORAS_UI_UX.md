# 🎨 Checklist de Mejoras UI/UX - Assembly 2.0

**Revisión de diseño actual:** Landing Page y Dashboard  
**Fecha:** 27 Enero 2026  
**Estado:** 🔴 REQUIERE MEJORAS URGENTES

---

## 📊 RESUMEN EJECUTIVO DE PROBLEMAS

### 🚨 Críticos (Bloquean MVP)
1. **Landing page demasiado simple** - No genera confianza ni conversión
2. **Dashboard sin estructura de navegación** - Usuario se pierde
3. **Vista de presentación inexistente** - Especificada en arquitectura pero no implementada
4. **Sin autenticación UI** - No hay login/registro visual
5. **Sin integración con BD real** - Todo es mock/hardcoded

### ⚠️ Importantes (Afectan UX)
6. Falta jerarquía visual en componentes
7. No hay feedback de acciones (loading states, toasts)
8. Dashboard no muestra métricas clave (KPIs)
9. Responsive pobre en modo presentación
10. Sin dark mode toggle (aunque es dark por defecto)

### 💡 Mejoras Opcionales
11. Animaciones más fluidas
12. Ilustraciones/iconografía personalizada
13. Tutorial interactivo (onboarding)
14. Sistema de notificaciones

---

## 🏠 SECCIÓN 1: LANDING PAGE

### Estado Actual: 🔴 INSUFICIENTE

**Problemas identificados:**
- Solo tiene 1 sección hero + 3 cards simples
- No hay propuesta de valor clara
- No hay prueba social (testimonios, logos clientes)
- No hay sección de precios
- No hay comparación con competencia
- CTA ("Agendar demo") no es convincente
- Sin captura de leads (email)
- Sin video explicativo o demo interactivo

---

### ✅ Checklist de Mejoras - Landing Page

#### 1.1 Hero Section (Prioridad: 🔴 CRÍTICA)
- [ ] **Headline más potente**: 
  - ❌ Actual: "Asambleas legales en la era digital"
  - ✅ Mejorar a: "Automatiza tus asambleas de PH con validación biométrica y cumplimiento legal"
  
- [ ] **Subheadline con números**:
  ```
  "Ahorra 12+ horas en cada asamblea. 
   100% cumplimiento Ley 284 de Panamá."
  ```

- [ ] **CTA dual con jerarquía**:
  ```jsx
  <button primary>Empezar gratis (14 días)</button>
  <button secondary>Ver demo en vivo (2 min)</button>
  ```

- [ ] **Hero visual**:
  - Agregar mockup de dashboard en laptop/tablet
  - Usar imagen de asamblea real (stock photo) con overlay
  - O video de 10 seg en loop mostrando el dashboard

- [ ] **Trust badges** (debajo del CTA):
  ```
  ✅ Cumple Ley 284 PH Panamá
  ✅ Certificado ISO 27001 (seguridad)
  ✅ +50 edificios usando Assembly 2.0
  ```

---

#### 1.2 Sección "Problemas que Resolvemos" (Prioridad: 🔴 CRÍTICA)
**Agregar ANTES de las features**

```jsx
<section className="pain-points">
  <h2>¿Te suena familiar?</h2>
  <div className="grid-3">
    <PainPointCard 
      icon="😩"
      title="12+ horas preparando actas"
      description="Entre convocatorias, validación de poderes y cierre, pierdes días."
    />
    <PainPointCard 
      icon="⚖️"
      title="Riesgo legal en quórums"
      description="Un error en coeficientes puede invalidar toda la asamblea."
    />
    <PainPointCard 
      icon="📄"
      title="Poderes falsificados"
      description="Sin validación biométrica, cualquiera puede suplantar identidad."
    />
  </div>
</section>
```

---

#### 1.3 Sección de Features (Prioridad: ⚠️ IMPORTANTE)
**Mejorar las 3 cards actuales**

- [ ] **Agregar íconos visuales** (no solo texto):
  ```jsx
  <FeatureCard
    icon={<FingerprintIcon />}
    title="Face ID en asambleas"
    description="..."
    demo={<VideoPreview src="/demos/face-id.mp4" />}
  />
  ```

- [ ] **Expandir a 6 features clave**:
  1. ✅ Face ID (ya existe)
  2. ✅ Validación de poderes (ya existe)
  3. ✅ Reportes automáticos (ya existe)
  4. ➕ Votación por coeficientes
  5. ➕ CRM de seguimiento post-asamblea
  6. ➕ Dashboard en tiempo real para proyectar

- [ ] **Agregar microinteracciones**:
  - Hover: levantar card con sombra
  - Click: abrir modal con demo animado

---

#### 1.4 Sección "Cómo Funciona" (Prioridad: ⚠️ IMPORTANTE)
**Nueva sección - Paso a paso visual**

```jsx
<section className="how-it-works">
  <h2>De caótico a automatizado en 3 pasos</h2>
  <Timeline>
    <Step number="1" title="Sube tu Excel de propietarios">
      <Screenshot src="/tutorial/upload.png" />
      <p>CSV o Excel directo. 311 unidades en 30 segundos.</p>
    </Step>
    <Step number="2" title="Envía invitaciones con Face ID">
      <Screenshot src="/tutorial/invite.png" />
      <p>Cada propietario se registra con su email + biometría.</p>
    </Step>
    <Step number="3" title="Ejecuta tu asamblea en vivo">
      <Screenshot src="/tutorial/assembly.png" />
      <p>Quórum automático, votaciones legales, acta lista.</p>
    </Step>
  </Timeline>
</section>
```

---

#### 1.5 Sección de Prueba Social (Prioridad: 🔴 CRÍTICA)
**Nueva sección - Testimonios**

```jsx
<section className="social-proof">
  <h2>Edificios que confían en Assembly 2.0</h2>
  <TestimonialGrid>
    <Testimonial
      quote="Pasamos de 3 días a 4 horas en todo el proceso de asamblea."
      author="Juan Pérez"
      role="Presidente Junta Directiva, Urban Tower"
      avatar="/testimonials/juan.jpg"
      logo="/logos/urban-tower.png"
    />
    {/* Repetir 2-3 más */}
  </TestimonialGrid>
  
  <LogoCloud>
    {/* Logos de 8-10 edificios/promotoras */}
  </LogoCloud>
</section>
```

---

#### 1.6 Sección de Precios (Prioridad: ⚠️ IMPORTANTE)
**Nueva sección**

```jsx
<section className="pricing">
  <h2>Precios transparentes</h2>
  <PricingGrid>
    <PricingCard
      tier="Starter"
      price="$199/mes"
      features={[
        "Hasta 100 unidades",
        "1 asamblea/mes",
        "Face ID ilimitado",
        "Soporte por email"
      ]}
      cta="Empezar gratis"
    />
    <PricingCard
      tier="Professional"
      price="$499/mes"
      popular={true}
      features={[
        "Hasta 500 unidades",
        "Asambleas ilimitadas",
        "CRM integrado",
        "Soporte prioritario 24/7"
      ]}
      cta="Agendar demo"
    />
    <PricingCard
      tier="Enterprise"
      price="Personalizado"
      features={[
        "Unidades ilimitadas",
        "Multi-tenant (promotoras)",
        "Integración con ERP",
        "Consultoría legal incluida"
      ]}
      cta="Contactar ventas"
    />
  </PricingGrid>
</section>
```

---

#### 1.7 FAQ Section (Prioridad: 💡 OPCIONAL)
```jsx
<section className="faq">
  <h2>Preguntas frecuentes</h2>
  <Accordion>
    <FAQItem q="¿Cómo garantizan el cumplimiento de la Ley 284?" />
    <FAQItem q="¿Qué pasa si un propietario no tiene Face ID?" />
    <FAQItem q="¿Cuánto tiempo toma implementar Assembly 2.0?" />
    {/* 5-7 preguntas más */}
  </Accordion>
</section>
```

---

#### 1.8 Footer con CTA Final (Prioridad: ⚠️ IMPORTANTE)
```jsx
<section className="cta-final">
  <h2>Reduce 90% del tiempo en asambleas</h2>
  <p>Únete a +50 edificios que ya automatizaron su gobernanza.</p>
  <EmailCapture 
    placeholder="tu@email.com"
    button="Empezar gratis"
  />
  <p className="trust">✅ Sin tarjeta de crédito · ✅ 14 días gratis</p>
</section>

<Footer>
  <FooterColumn title="Producto">
    <Link>Features</Link>
    <Link>Precios</Link>
    <Link>Casos de uso</Link>
  </FooterColumn>
  <FooterColumn title="Legal">
    <Link>Términos</Link>
    <Link>Privacidad</Link>
    <Link>Cumplimiento Ley 284</Link>
  </FooterColumn>
  <FooterColumn title="Soporte">
    <Link>Documentación</Link>
    <Link>API</Link>
    <Link>Contacto</Link>
  </FooterColumn>
</Footer>
```

---

## 🎛️ SECCIÓN 2: DASHBOARD - ESTRUCTURA GENERAL

### Estado Actual: 🔴 INSUFICIENTE

**Problemas identificados:**
- No hay sidebar de navegación
- No hay header con usuario/logout
- No hay breadcrumbs
- No hay separación visual entre secciones
- El usuario no sabe dónde está parado

---

### ✅ Checklist de Mejoras - Dashboard Layout

#### 2.1 Layout Principal (Prioridad: 🔴 CRÍTICA)

**Crear componente `DashboardLayout.tsx`:**

```tsx
<div className="dashboard-layout">
  {/* SIDEBAR FIJO (izquierda) */}
  <Sidebar>
    <Logo />
    <Nav>
      <NavItem icon="🏠" href="/admin">Inicio</NavItem>
      <NavItem icon="👥" href="/admin/residents">Residentes</NavItem>
      <NavItem icon="📋" href="/admin/assemblies">Asambleas</NavItem>
      <NavItem icon="🗳️" href="/admin/votations">Votaciones</NavItem>
      <NavItem icon="📄" href="/admin/powers">Poderes</NavItem>
      <NavItem icon="🎫" href="/admin/crm">CRM</NavItem>
      <NavItem icon="📊" href="/admin/reports">Reportes</NavItem>
      <NavItem icon="⚙️" href="/admin/settings">Configuración</NavItem>
    </Nav>
    <SidebarFooter>
      <UserProfile />
    </SidebarFooter>
  </Sidebar>
  
  {/* HEADER (arriba) */}
  <Header>
    <Breadcrumbs />
    <HeaderActions>
      <NotificationBell />
      <QuickSearch />
      <UserMenu />
    </HeaderActions>
  </Header>
  
  {/* CONTENIDO */}
  <Main>
    {children}
  </Main>
</div>
```

**Checklist:**
- [ ] Crear `Sidebar` con navegación fija
- [ ] Agregar `Header` con breadcrumbs y usuario
- [ ] Implementar responsive (sidebar collapse en móvil)
- [ ] Agregar animación de transición entre páginas
- [ ] Persistir estado de sidebar (abierto/cerrado) en localStorage

---

#### 2.2 Dashboard Home (Prioridad: 🔴 CRÍTICA)

**Página actual `/admin/page.tsx` está vacía de métricas**

**Crear dashboard de métricas:**

```tsx
<DashboardHome>
  {/* KPIs principales */}
  <StatsGrid>
    <StatCard
      title="Asambleas este mes"
      value="3"
      change="+15%"
      icon={<CalendarIcon />}
      trend="up"
    />
    <StatCard
      title="Propietarios activos"
      value="287"
      subtitle="de 311 totales"
      icon={<UsersIcon />}
    />
    <StatCard
      title="Votaciones abiertas"
      value="2"
      icon={<VoteIcon />}
      alert={true}
    />
    <StatCard
      title="Tickets CRM pendientes"
      value="8"
      icon={<TicketIcon />}
    />
  </StatsGrid>
  
  {/* Gráfico de actividad */}
  <ActivityChart>
    <LineChart data={assemblyActivity} />
  </ActivityChart>
  
  {/* Próximas asambleas */}
  <UpcomingAssemblies>
    <AssemblyCard
      title="Asamblea Ordinaria 2026"
      date="15 Feb 2026"
      status="Programada"
      actions={<Button>Ver detalles</Button>}
    />
  </UpcomingAssemblies>
  
  {/* Alertas */}
  <AlertsPanel>
    <Alert type="warning">
      50 propietarios aún no completan Face ID
    </Alert>
    <Alert type="info">
      3 poderes pendientes de validación
    </Alert>
  </AlertsPanel>
</DashboardHome>
```

**Checklist:**
- [ ] Crear componente `StatCard` reutilizable
- [ ] Integrar gráfico de línea (Recharts o Chart.js)
- [ ] Mostrar próximas asambleas
- [ ] Panel de alertas con prioridad
- [ ] Quick actions (botones: "Nueva asamblea", "Importar Excel", etc.)

---

## 👥 SECCIÓN 3: MÓDULO DE RESIDENTES

### Estado Actual: ⚠️ FUNCIONAL PERO MEJORABLE

**Problemas:**
- Tabla demasiado simple
- Sin filtros avanzados (por estado, coeficiente, etc.)
- No muestra estado de Face ID
- No hay acciones bulk (ej. "Enviar invitación a todos")
- Sin visualización de coeficientes (gráfico de torta)

---

### ✅ Checklist de Mejoras - Residentes

#### 3.1 Vista de Tabla (Prioridad: ⚠️ IMPORTANTE)

- [ ] **Agregar columna "Face ID"**:
  ```tsx
  <td>
    {resident.email_verified ? 
      <Badge color="green">✅ Verificado</Badge> :
      <Badge color="gray">⏳ Pendiente</Badge>
    }
  </td>
  ```

- [ ] **Agregar columna "Acciones"**:
  ```tsx
  <td>
    <DropdownMenu>
      <MenuItem onClick={sendInvite}>Enviar invitación</MenuItem>
      <MenuItem onClick={viewDetails}>Ver detalles</MenuItem>
      <MenuItem onClick={editResident}>Editar</MenuItem>
      <MenuItem danger onClick={deleteResident}>Eliminar</MenuItem>
    </DropdownMenu>
  </td>
  ```

- [ ] **Filtros avanzados**:
  ```tsx
  <FilterBar>
    <Select label="Estado pago">
      <option>Todos</option>
      <option>Al día</option>
      <option>En mora</option>
    </Select>
    <Select label="Face ID">
      <option>Todos</option>
      <option>Verificado</option>
      <option>Pendiente</option>
    </Select>
    <RangeSlider label="Coeficiente" min={0} max={2} />
  </FilterBar>
  ```

- [ ] **Acciones bulk**:
  ```tsx
  <TableToolbar>
    <Checkbox onChange={selectAll}>
      {selectedCount > 0 && `${selectedCount} seleccionados`}
    </Checkbox>
    {selectedCount > 0 && (
      <BulkActions>
        <Button onClick={bulkSendInvites}>
          Enviar invitaciones ({selectedCount})
        </Button>
        <Button onClick={bulkChangeStatus}>
          Cambiar estado
        </Button>
      </BulkActions>
    )}
  </TableToolbar>
  ```

- [ ] **Paginación**:
  ```tsx
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
    itemsPerPage={50}
  />
  ```

---

#### 3.2 Visualización de Coeficientes (Prioridad: 💡 OPCIONAL)

- [ ] **Gráfico de distribución**:
  ```tsx
  <Card title="Distribución de coeficientes">
    <PieChart data={coefficientDistribution} />
    <Legend>
      <Item color="green">Al día (75%)</Item>
      <Item color="red">En mora (25%)</Item>
    </Legend>
  </Card>
  ```

---

## 🗳️ SECCIÓN 4: MÓDULO DE ASAMBLEAS Y VOTACIONES

### Estado Actual: ⚠️ FUNCIONAL PERO INCOMPLETO

**Problemas:**
- Vista de asistencia muy básica
- No hay vista de presentación robusta (como la especificada en arquitectura)
- Modo "Zoom" actual es insuficiente para proyectar en sala
- Falta integración con la matriz de unidades visual (como en las imágenes del usuario)
- No hay histórico de votaciones cerradas

---

### ✅ Checklist de Mejoras - Asambleas

#### 4.1 Panel de Asistencia (Prioridad: ⚠️ IMPORTANTE)

- [ ] **Agregar vista de matriz de unidades** (como en las imágenes del usuario):
  ```tsx
  <UnitsGrid>
    {units.map(unit => (
      <UnitCell
        key={unit.id}
        code={unit.code}
        status={getAttendanceStatus(unit)}
        onClick={() => toggleAttendance(unit)}
      />
    ))}
  </UnitsGrid>
  ```

- [ ] **Color coding**:
  - 🟢 Verde: Al día + Presente con voto
  - 🟡 Amarillo: Al día + Ausente
  - 🔴 Rojo: En mora
  - ⚪ Gris: Sin registrar

- [ ] **Quick stats en header**:
  ```tsx
  <StatsBar>
    <Stat label="Presentes" value="131/200" color="green" />
    <Stat label="Al día votando" value="98" color="blue" />
    <Stat label="En mora (solo voz)" value="33" color="orange" />
    <Stat label="Ausentes" value="69" color="gray" />
  </StatsBar>
  ```

---

#### 4.2 Vista de Presentación (Prioridad: 🔴 CRÍTICA)

**Según especificación en `VISTA_PRESENTACION_TIEMPO_REAL.md`**

**Crear nueva ruta `/presenter/:token`:**

```tsx
<PresenterView token={token}>
  {/* Panel de Quórum GRANDE */}
  <QuorumPanelLarge
    currentPercentage={65.4}
    requiredPercentage={51}
    size="extra-large" // 200px
  />
  
  {/* Votación Activa */}
  <VotationResultsLarge
    topic="Aprobación presupuesto 2026"
    results={{
      si: { coef: 78.2, percentage: 78.2 },
      no: { coef: 15.1, percentage: 15.1 },
      abs: { coef: 6.7, percentage: 6.7 }
    }}
  />
  
  {/* Matriz de 200 unidades */}
  <UnitsMatrixLarge
    units={units}
    columns={25}
    rows={8}
  />
  
  {/* Histórico de votaciones */}
  <VotationHistory>
    <VotationItem 
      title="Tema 1: Acta anterior" 
      result="✅ Aprobado (98%)"
      closed
    />
    <VotationItem 
      title="Tema 2: Informe financiero" 
      result="✅ Aprobado (85%)"
      closed
    />
    <VotationItem 
      title="Tema 3: Presupuesto 2026" 
      result="⏳ En votación..."
      active
    />
  </VotationHistory>
</PresenterView>
```

**Checklist:**
- [ ] Crear ruta `/presenter/:token`
- [ ] Validar token de presentación (24h expiración)
- [ ] Modo fullscreen automático
- [ ] Integración con Supabase Realtime
- [ ] Actualización automática cada 1-2 segundos
- [ ] Diseño responsive para 1920x1080 (proyector)
- [ ] Animaciones suaves en cambios de datos
- [ ] Panel de control admin para:
  - [ ] Generar token de presentación
  - [ ] Abrir/cerrar votaciones desde admin
  - [ ] Pausar/reanudar actualizaciones

---

#### 4.3 Panel de Votaciones (Prioridad: ⚠️ IMPORTANTE)

- [ ] **Mejorar visualización de resultados**:
  ```tsx
  <ResultsPanel>
    <ResultBar
      label="A FAVOR"
      value={78.2}
      color="green"
      icon="✅"
      coefficient={45.8}
    />
    <ResultBar
      label="EN CONTRA"
      value={15.1}
      color="red"
      icon="❌"
      coefficient={12.3}
      // Auto-generar tickets CRM
      onClose={() => createCRMTickets()}
    />
    <ResultBar
      label="ABSTENCIÓN"
      value={6.7}
      color="gray"
      icon="⚪"
      coefficient={3.2}
    />
  </ResultsPanel>
  ```

- [ ] **Agregar gráfico de pastel**:
  ```tsx
  <PieChart 
    data={[
      { label: 'SI', value: 78.2, color: '#10b981' },
      { label: 'NO', value: 15.1, color: '#ef4444' },
      { label: 'ABST', value: 6.7, color: '#94a3b8' }
    ]}
  />
  ```

- [ ] **Línea de tiempo de quórum**:
  ```tsx
  <QuorumTimeline>
    <LineChart
      data={quorumHistory}
      yAxis={{ domain: [0, 100] }}
      referenceLine={{ y: 51, color: 'red', dash: true }}
    />
  </QuorumTimeline>
  ```

---

## 🔐 SECCIÓN 5: AUTENTICACIÓN UI

### Estado Actual: 🔴 INEXISTENTE

**Problema crítico:** No hay pantallas de login/registro implementadas

---

### ✅ Checklist - Autenticación UI

#### 5.1 Pantalla de Login (Prioridad: 🔴 CRÍTICA)

**Crear `/login` page:**

```tsx
<LoginPage>
  <LoginCard>
    <Logo />
    <h1>Iniciar sesión</h1>
    
    {/* Paso 1: Email */}
    <EmailStep>
      <Input 
        type="email"
        placeholder="tu@email.com"
        autoFocus
      />
      <Button onClick={sendOTP}>
        Continuar
      </Button>
    </EmailStep>
    
    {/* Paso 2: OTP (si ya tiene cuenta) */}
    {showOTP && (
      <OTPStep>
        <p>Ingresa el código de 6 dígitos enviado a {email}</p>
        <OTPInput length={6} onChange={setOTP} />
        <Button onClick={verifyOTP}>
          Verificar
        </Button>
        <Link onClick={resendOTP}>Reenviar código</Link>
      </OTPStep>
    )}
    
    {/* Paso 3: Face ID (si ya configuró) */}
    {showWebAuthn && (
      <WebAuthnStep>
        <FingerprintIcon size={80} />
        <p>Usa tu Face ID o Touch ID</p>
        <Button onClick={authenticateWithWebAuthn}>
          Autenticar
        </Button>
      </WebAuthnStep>
    )}
  </LoginCard>
</LoginPage>
```

**Checklist:**
- [ ] Crear página `/login`
- [ ] Flujo de 3 pasos (Email → OTP → WebAuthn)
- [ ] Validación de email en tiempo real
- [ ] Loading states en cada paso
- [ ] Error handling con mensajes claros
- [ ] Redirección después de login exitoso
- [ ] Remember me (guardar email en localStorage)

---

#### 5.2 Pantalla de Registro (Prioridad: 🔴 CRÍTICA)

**Crear `/register` page:**

```tsx
<RegisterPage>
  <RegisterFlow>
    {/* Paso 1: Datos básicos */}
    <Step1>
      <Input label="Email" type="email" required />
      <Input label="Nombre" required />
      <Input label="Apellido" required />
      <Input label="Cédula" pattern="8-123-4567" required />
      <Button onClick={nextStep}>Continuar</Button>
    </Step1>
    
    {/* Paso 2: OTP */}
    <Step2>
      <OTPInput length={6} />
      <Button onClick={verifyAndNext}>Verificar</Button>
    </Step2>
    
    {/* Paso 3: Configurar Face ID */}
    <Step3>
      <h2>Configura tu Face ID</h2>
      <p>Úsalo para firmar votos y acceder sin contraseñas</p>
      <Button onClick={registerWebAuthn}>
        Configurar ahora
      </Button>
      <Link onClick={skipForNow}>Configurar después</Link>
    </Step3>
    
    {/* Paso 4: Confirmación */}
    <Step4Success>
      <CheckIcon color="green" size={100} />
      <h2>¡Listo!</h2>
      <p>Tu cuenta está activa</p>
      <Button href="/admin">Ir al dashboard</Button>
    </Step4Success>
  </RegisterFlow>
</RegisterPage>
```

**Checklist:**
- [ ] Crear página `/register`
- [ ] Wizard de 4 pasos con progress bar
- [ ] Validación en tiempo real de cédula panameña
- [ ] Setup de WebAuthn con instrucciones claras
- [ ] Opción de "Configurar después" para Face ID
- [ ] Email de bienvenida (mock por ahora)
- [ ] Tutorial rápido después de registro (tooltips)

---

## 🎨 SECCIÓN 6: MEJORAS DE DISEÑO VISUAL

### ✅ Checklist - Sistema de Diseño

#### 6.1 Componentes Base (Prioridad: ⚠️ IMPORTANTE)

**Crear librería de componentes reutilizables:**

- [ ] **Button** con variantes:
  ```tsx
  <Button variant="primary" size="lg">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="danger">Danger</Button>
  ```

- [ ] **Badge** para estados:
  ```tsx
  <Badge color="green">Al día</Badge>
  <Badge color="red">En mora</Badge>
  <Badge color="blue">Verificado</Badge>
  ```

- [ ] **Card** consistente:
  ```tsx
  <Card
    header={<CardHeader title="..." actions={...} />}
    footer={<CardFooter>...</CardFooter>}
  >
    {children}
  </Card>
  ```

- [ ] **Modal** reutilizable:
  ```tsx
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Confirmar acción"
    size="md"
  >
    <ModalBody>...</ModalBody>
    <ModalFooter>
      <Button onClick={onClose}>Cancelar</Button>
      <Button variant="primary" onClick={onConfirm}>
        Confirmar
      </Button>
    </ModalFooter>
  </Modal>
  ```

- [ ] **Toast notifications**:
  ```tsx
  toast.success('Asistencia registrada');
  toast.error('Error al guardar');
  toast.info('Quórum alcanzado');
  toast.warning('50 propietarios sin Face ID');
  ```

---

#### 6.2 Animaciones y Microinteracciones (Prioridad: 💡 OPCIONAL)

- [ ] **Loading states**:
  ```tsx
  <Button loading={isLoading}>
    {isLoading ? <Spinner /> : 'Guardar'}
  </Button>
  ```

- [ ] **Skeleton screens** para tablas:
  ```tsx
  {isLoading ? (
    <TableSkeleton rows={10} columns={5} />
  ) : (
    <Table data={residents} />
  )}
  ```

- [ ] **Page transitions**:
  ```tsx
  <AnimatePresence mode="wait">
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
  ```

- [ ] **Hover effects** consistentes:
  ```css
  .interactive:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }
  ```

---

## 📱 SECCIÓN 7: RESPONSIVE Y ACCESIBILIDAD

### ✅ Checklist - Mobile First

#### 7.1 Responsive Design (Prioridad: ⚠️ IMPORTANTE)

- [ ] **Sidebar colapsable en móvil**:
  ```tsx
  <Sidebar collapsed={isMobile}>
    {/* Solo íconos en móvil */}
  </Sidebar>
  <HamburgerMenu onClick={toggleSidebar} />
  ```

- [ ] **Tablas responsivas**:
  ```tsx
  {/* Desktop: tabla normal */}
  {/* Mobile: cards apiladas */}
  {isMobile ? (
    <ResidentCardList residents={residents} />
  ) : (
    <ResidentTable residents={residents} />
  )}
  ```

- [ ] **Grid adaptativo**:
  ```css
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  ```

- [ ] **Breakpoints consistentes**:
  ```tsx
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
  ```

---

#### 7.2 Accesibilidad (Prioridad: ⚠️ IMPORTANTE)

- [ ] **ARIA labels** en todos los botones:
  ```tsx
  <button aria-label="Cerrar modal">
    <XIcon />
  </button>
  ```

- [ ] **Navegación por teclado**:
  - Tab para navegar
  - Enter/Space para activar
  - Esc para cerrar modals

- [ ] **Contraste de colores** (WCAG AA):
  - Texto sobre fondo: ratio 4.5:1 mínimo
  - Validar con herramienta: https://webaim.org/resources/contrastchecker/

- [ ] **Focus visible**:
  ```css
  :focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  ```

- [ ] **Screen reader friendly**:
  ```tsx
  <span className="sr-only">Cargar más resultados</span>
  ```

---

## 🔌 SECCIÓN 8: INTEGRACIÓN CON BACKEND

### Estado Actual: 🔴 TODO ES MOCK

**Problema crítico:** No hay conexión con Supabase ni API real

---

### ✅ Checklist - Integración Backend

#### 8.1 Setup de Supabase Client (Prioridad: 🔴 CRÍTICA)

- [ ] **Configurar cliente Supabase**:
  ```tsx
  // lib/supabase.ts
  import { createClient } from '@supabase/supabase-js'
  
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  ```

- [ ] **Auth context provider**:
  ```tsx
  <AuthProvider>
    <App />
  </AuthProvider>
  ```

- [ ] **Protected routes**:
  ```tsx
  export default function ProtectedPage() {
    const { user, loading } = useAuth();
    
    if (loading) return <Spinner />;
    if (!user) redirect('/login');
    
    return <AdminDashboard />;
  }
  ```

---

#### 8.2 Reemplazar Mocks con Queries Reales (Prioridad: 🔴 CRÍTICA)

**Residentes:**
```tsx
// ❌ Antes (mock)
const residents = generateResidents(311);

// ✅ Después (real)
const { data: residents, loading } = useQuery('residents', async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*, units(*)')
    .eq('organization_id', currentOrgId);
  
  if (error) throw error;
  return data;
});
```

**Asambleas:**
```tsx
const { data: assembly } = useQuery(['assembly', id], async () => {
  const { data } = await supabase
    .rpc('get_assembly_state', { assembly_uuid: id });
  return data;
});
```

**Checklist:**
- [ ] Reemplazar `generateResidents()` con query real
- [ ] Conectar `AttendancePanel` con tabla `assembly_attendance`
- [ ] Conectar `TopicVotingPanel` con tabla `votations`
- [ ] Usar Supabase Realtime para updates automáticos
- [ ] Implementar error handling con `react-query`
- [ ] Agregar loading states en todas las queries
- [ ] Implementar optimistic updates

---

#### 8.3 Supabase Realtime (Prioridad: ⚠️ IMPORTANTE)

```tsx
useEffect(() => {
  const channel = supabase.channel(`assembly:${assemblyId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'assembly_attendance',
      filter: `assembly_id=eq.${assemblyId}`
    }, (payload) => {
      // Actualizar quórum en tiempo real
      queryClient.invalidateQueries(['assembly', assemblyId]);
    })
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}, [assemblyId]);
```

**Checklist:**
- [ ] Configurar Realtime en vista de presentación
- [ ] Actualizar quórum automáticamente
- [ ] Actualizar resultados de votación en vivo
- [ ] Manejar reconexión automática
- [ ] Mostrar indicador "🔴 En vivo" cuando está activo

---

## 📋 RESUMEN DE PRIORIDADES

### 🔴 CRÍTICO (Bloquea MVP)
1. ✅ Integración con Supabase (backend real)
2. ✅ Landing page completa (Hero + Prueba social + Precios)
3. ✅ Login/Registro UI (Email + OTP + WebAuthn)
4. ✅ Dashboard layout (Sidebar + Header + Nav)
5. ✅ Vista de presentación robusta (`/presenter/:token`)
6. ✅ Dashboard home con métricas (KPIs)

### ⚠️ IMPORTANTE (Afecta UX)
7. ✅ Mejoras en módulo de residentes (filtros, acciones bulk)
8. ✅ Matriz de unidades visual (grid 200 unidades)
9. ✅ Mejoras en panel de votaciones (gráficos, timeline)
10. ✅ Sistema de componentes base (Button, Badge, Modal)
11. ✅ Responsive design (móvil, tablet)
12. ✅ Toast notifications

### 💡 OPCIONAL (Nice to have)
13. Animaciones y microinteracciones
14. Ilustraciones personalizadas
15. Tutorial interactivo (onboarding)
16. Gráfico de distribución de coeficientes
17. Sistema de notificaciones
18. Dark mode toggle

---

## 🎯 PLAN DE EJECUCIÓN SUGERIDO

### Sprint 1 (2 semanas) - FUNDAMENTOS
- [ ] Integración Supabase (auth + queries)
- [ ] Login/Registro UI
- [ ] Dashboard layout base (Sidebar + Header)
- [ ] Protected routes

### Sprint 2 (2 semanas) - LANDING Y DASHBOARD HOME
- [ ] Landing page completa (7 secciones)
- [ ] Dashboard home con KPIs
- [ ] Sistema de componentes base

### Sprint 3 (2 semanas) - MÓDULOS CORE
- [ ] Módulo de residentes mejorado
- [ ] Módulo de asambleas con matriz de unidades
- [ ] Panel de votaciones mejorado

### Sprint 4 (1 semana) - VISTA DE PRESENTACIÓN
- [ ] `/presenter/:token` completo
- [ ] Realtime con Supabase
- [ ] Panel de control para admin

### Sprint 5 (1 semana) - POLISH
- [ ] Responsive design
- [ ] Toast notifications
- [ ] Animaciones
- [ ] Testing manual exhaustivo

**Total: 8 semanas (2 meses)**

---

## 📝 NOTAS PARA EL CODER

1. **Usa componentes compartidos**: No repitas código, crea `components/ui/` para Button, Badge, etc.

2. **React Query para data fetching**: Maneja loading/error states automáticamente.

3. **Tailwind para estilos**: Mantén consistencia con el diseño actual.

4. **Prioriza la vista de presentación**: Es el diferenciador clave vs competencia.

5. **Testing**: Prueba en Chrome, Safari, Firefox. Valida responsive en móvil real.

6. **Performance**: 
   - Lazy load de componentes pesados
   - Memo de cálculos costosos (quórum, resultados)
   - Virtualización de tablas largas (>100 filas)

7. **Accesibilidad**: Usa semantic HTML, ARIA labels, keyboard navigation.

8. **Git workflow**: 
   - Branch por feature (`feature/landing-page`)
   - Commits descriptivos
   - PR antes de merge a main

---

**FIN DEL CHECKLIST DE MEJORAS UI/UX**

🚀 **¡Listo para que el Coder implemente!**
