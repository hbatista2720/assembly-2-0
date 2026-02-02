# ☁️ ANÁLISIS: CLOUD (AWS, GCP, Azure) vs VPS TRADICIONALES
## Comparativa Completa para Assembly 2.0 Chatbots Multi-Canal (DECISIÓN FINAL)

**Versión:** 2.0 - DECISIÓN APROBADA  
**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Propósito:** Decisión estratégica de infraestructura

---

## ✅ **DECISIÓN FINAL APROBADA POR HENRY:**

**STACK SELECCIONADO: VPS (Hetzner) + Supabase Cloud + Vercel**

**Razones de la decisión:**
1. ✅ **Costo óptimo**: $510-762/año (0.6-0.9% de ingresos proyectados)
2. ✅ **Escalabilidad**: Soporta 300-500 usuarios concurrentes, escalable a 1,000+
3. ✅ **Control**: Docker local para desarrollo, VPS para producción
4. ✅ **Path de migración**: Cloud cuando se superen 50 asambleas/mes
5. ✅ **Prueba real**: Railway falló (chatbot se dormía), VPS es confiable
6. ✅ **Multi-canal**: Soporta WhatsApp + Telegram + Web App chatbot

**Escenario de negocio validado:**
- 30 asambleas/mes
- 300 residentes por asamblea
- $7,000/mes ingresos proyectados
- Infraestructura: <1% de costos

---

## 💰 COMPARATIVA DE PRECIOS (Mensual, 2026)

### **OPCIÓN 1: Cloud VMs (Equivalente a VPS tradicional)**

| Provider | Plan | CPU | RAM | Disco | Precio/mes |
|----------|------|-----|-----|-------|------------|
| **AWS EC2 t3.micro** | On-Demand | 2 vCPU | 1 GB | 30 GB EBS | ~$7.30 (730h × $0.01/h) |
| **AWS EC2 t3.small** | On-Demand | 2 vCPU | 2 GB | 30 GB EBS | ~$14.60 (730h × $0.02/h) |
| **Google Compute e2-micro** | On-Demand | 2 vCPU | 1 GB | 30 GB | ~$8.35 |
| **Google Compute e2-small** | On-Demand | 2 vCPU | 2 GB | 30 GB | ~$16.70 |
| **Azure B1s** | Standard | 1 vCPU | 1 GB | 30 GB | ~$9.50 |
| **Azure B1ms** | Standard | 1 vCPU | 2 GB | 30 GB | ~$18.00 |

**COSTOS ADICIONALES (Cloud VMs):**
```
AWS EC2:
├─ EBS Storage (SSD): $0.10/GB/mes = $3/mes (30GB)
├─ Data Transfer OUT: $0.09/GB (después de 100GB gratis)
├─ Elastic IP (si detienes la VM): $3.65/mes
└─ TOTAL: $7.30 + $3 + $3.65 = $13.95/mes (t3.micro)

Google Compute Engine:
├─ Persistent Disk: $0.10/GB/mes = $3/mes (30GB)
├─ Network Egress: $0.12/GB (después de 1GB gratis)
└─ TOTAL: $8.35 + $3 = $11.35/mes (e2-micro)

Azure:
├─ Managed Disk: $5/mes (30GB)
├─ Bandwidth: $0.087/GB (después de 100GB gratis)
└─ TOTAL: $9.50 + $5 = $14.50/mes (B1s)
```

---

### **OPCIÓN 2: Cloud VPS Simplificados (Competencia directa a VPS tradicionales)**

| Provider | Plan | CPU | RAM | Disco | Transfer | Precio/mes |
|----------|------|-----|-----|-------|----------|------------|
| **AWS Lightsail** | Basic | 1 vCPU | 512 MB | 20 GB | 1 TB | $3.50 |
| **AWS Lightsail** | Standard | 1 vCPU | 1 GB | 40 GB | 2 TB | $5.00 |
| **AWS Lightsail** | Medium | 2 vCPU | 2 GB | 60 GB | 3 TB | $10.00 |
| **AWS Lightsail** | Large | 2 vCPU | 4 GB | 80 GB | 4 TB | $20.00 |

**Ventajas Lightsail:**
- ✅ Precio fijo (incluye storage, transfer, IP fija)
- ✅ Más simple que EC2 (sin sorpresas en factura)
- ✅ DNS management incluido
- ✅ Firewall incluido
- ✅ Load balancer disponible ($18/mes)

---

### **OPCIÓN 3: Serverless/Managed (para chatbots)**

**AWS Lambda:**
```
Pricing:
├─ Requests: $0.20 por 1M requests (tras 1M gratis/mes)
├─ Duration: $0.0000166667/GB-segundo (tras 400,000 GB-seg gratis)

Estimado para chatbot (10,000 mensajes/mes, 1 seg avg):
├─ Requests: 10,000 × $0.20/1M = $0.002
├─ Duration: 10,000 seg × 512MB × $0.0000166667 = $0.08
└─ TOTAL: ~$0.10/mes

PROBLEMA: Cold starts (5-10 segundos) = ❌ No sirve para chatbots
```

**Google Cloud Run:**
```
Pricing:
├─ Requests: $0.40 por 1M requests (tras 2M gratis/mes)
├─ CPU: $0.00002400/vCPU-segundo
├─ Memory: $0.00000250/GiB-segundo

Estimado para chatbot (10,000 mensajes/mes, 1 seg avg):
├─ Requests: 10,000 × $0.40/1M = $0.004
├─ CPU: 10,000 seg × 1 vCPU × $0.00002400 = $0.24
├─ Memory: 10,000 seg × 0.5 GiB × $0.00000250 = $0.01
└─ TOTAL: ~$0.25/mes

PROBLEMA: 
- Cold starts (2-5 segundos) para chatbots always-on
- Para evitar cold starts, necesitas "minimum instances" = $12-20/mes
- Con min instances = más caro que VPS
```

**Conclusión Serverless:** ❌ **NO recomendado para chatbots always-on** (cold starts o costos de min instances)

---

### **OPCIÓN 4: VPS Tradicionales**

| Provider | Plan | CPU | RAM | Disco | Transfer | Precio/mes |
|----------|------|-----|-----|-------|----------|------------|
| **Hetzner CX11** | Standard | 1 vCPU | 2 GB | 20 GB | 20 TB | €3.79 (~$4.20) |
| **Hetzner CX21** | Standard | 2 vCPU | 4 GB | 40 GB | 20 TB | €5.83 (~$6.40) |
| **DigitalOcean Basic** | Shared CPU | 1 vCPU | 1 GB | 25 GB | 1 TB | $6.00 |
| **DigitalOcean Regular** | Shared CPU | 1 vCPU | 2 GB | 50 GB | 2 TB | $12.00 |
| **DigitalOcean Premium** | Shared CPU | 2 vCPU | 2 GB | 60 GB | 3 TB | $18.00 |
| **Linode Nanode** | Shared CPU | 1 vCPU | 1 GB | 25 GB | 1 TB | $5.00 |
| **Linode Basic** | Shared CPU | 1 vCPU | 2 GB | 50 GB | 2 TB | $12.00 |

**Ventajas VPS Tradicionales:**
- ✅ Precio más bajo (Hetzner = 40-60% más barato que Cloud)
- ✅ Transfer incluido (20 TB Hetzner vs 1-4 TB Cloud)
- ✅ Sin costos ocultos (storage, IP, bandwidth incluidos)
- ✅ Facturación simple (un solo precio mensual)

---

## 📊 TABLA COMPARATIVA COMPLETA

### **Para 3 Chatbots (WhatsApp + Telegram + Web) - 2GB RAM mínimo**

| Opción | Costo/mes | Storage | Transfer | IP Fija | Setup | Mantenimiento | Facturación |
|--------|-----------|---------|----------|---------|-------|---------------|-------------|
| **Hetzner CX11** | **$4.20** | 20 GB | 20 TB | ✅ | 3h | 2h/mes | Simple |
| **AWS Lightsail** | $10.00 | 60 GB | 3 TB | ✅ | 3h | 2h/mes | Simple |
| **DigitalOcean** | $12.00 | 50 GB | 2 TB | ✅ | 3h | 2h/mes | Simple |
| **AWS EC2 t3.small** | $17.60 | 30 GB | 100GB | ⚠️ $3.65 | 4h | 3h/mes | Compleja |
| **Google Compute e2-micro** | $14.35 | 30 GB | 1 GB | ✅ | 4h | 3h/mes | Compleja |
| **Azure B1ms** | $23.00 | 30 GB | 100GB | ✅ | 4h | 3h/mes | Compleja |
| **AWS Lambda** | $0.10 | - | - | ❌ | 1h | 0h | Simple |
| **Google Cloud Run** | $12-20 | - | - | ❌ | 1h | 0h | Simple |

**Notas:**
- AWS Lambda/Cloud Run sin "min instances" = cold starts (❌ no sirve para chatbots)
- AWS Lambda/Cloud Run con "min instances" = $12-20/mes (igual o más caro que VPS)

---

## 🎯 ANÁLISIS POR CASO DE USO

### **CASO 1: Chatbots Always-On (Assembly 2.0) - WhatsApp + Telegram + Web**

**Requisitos:**
- ✅ Proceso corriendo 24/7 (no cold starts)
- ✅ IP fija (WhatsApp Business API)
- ✅ Respuesta <1 segundo
- ✅ 3 servicios simultáneos (Node.js)
- ✅ Uptime >99%

**Ranking:**

| Posición | Opción | Costo/año | Razón |
|----------|--------|-----------|--------|
| 🥇 **1º** | **Hetzner CX11** | **$50** | Más barato, IP fija, 20TB transfer, simple |
| 🥈 **2º** | **AWS Lightsail** | $120 | Simple, AWS ecosystem, más caro que Hetzner |
| 🥉 **3º** | **DigitalOcean** | $144 | Balance precio/facilidad, buena docs |
| 4º | Linode | $144 | Similar a DigitalOcean |
| 5º | AWS EC2 | $211 | Más caro, facturación compleja |
| 6º | Google Compute | $172 | Más caro, facturación compleja |
| 7º | Azure | $276 | Más caro de todos |
| ❌ | Serverless | N/A | Cold starts = no sirve para always-on |

**GANADOR: Hetzner CX11 ($4.20/mes) ✅**

---

### **CASO 2: Si necesitaras integración profunda con AWS (S3, DynamoDB, Lambda, etc.)**

**Ejemplo:** Tu backend principal está en AWS y necesitas que los chatbots accedan a servicios AWS constantemente.

**Ventaja Cloud:**
```
AWS Lightsail + S3 + DynamoDB:
├─ Lightsail: $10/mes (chatbots)
├─ S3: $0.023/GB (storage archivos)
├─ DynamoDB: $0.25/GB (database NoSQL)
├─ Data transfer GRATIS entre servicios en misma región
└─ TOTAL: ~$15-20/mes

vs

Hetzner + AWS S3 + DynamoDB:
├─ Hetzner: $4.20/mes
├─ S3: $0.023/GB
├─ DynamoDB: $0.25/GB
├─ Data transfer OUT de AWS: $0.09/GB (costoso)
└─ TOTAL: ~$10-15/mes + latencia extra

Diferencia: $5/mes más con Lightsail, PERO:
- Menor latencia (misma región)
- Sin costos de data transfer
- Integración más simple
```

**Conclusión:** Si usas MUCHO AWS, Lightsail puede valer la pena ($5/mes extra = $60/año)

**Pero Assembly 2.0 usa Supabase (externo), no servicios AWS** → No hay ventaja de integración

---

### **CASO 3: Si necesitaras escalamiento automático global (multi-región)**

**Ejemplo:** Tienes usuarios en Europa, LATAM, Asia y necesitas latencia <100ms para todos.

**Ventaja Cloud:**
```
AWS/GCP/Azure multi-región:
├─ Deploy en 3-5 regiones (Europa, US, Asia)
├─ Load balancer global
├─ Auto-scaling basado en demanda
├─ Failover automático
└─ COSTO: $100-300/mes

vs

VPS multi-región:
├─ 3-5 VPS en diferentes regiones
├─ Load balancer manual (nginx)
├─ No auto-scaling (fixed resources)
├─ Failover manual
└─ COSTO: $20-60/mes (pero más trabajo)
```

**Conclusión:** Cloud gana en escalamiento global automático, PERO:
- Assembly 2.0 target: Panamá + LATAM (1 región suficiente)
- 0-200 clientes = No necesitas multi-región aún
- Año 2-3: Reconsiderar si expandes a Europa/Asia

---

## ⚖️ DECISIÓN POR ESCENARIO

### **ESCENARIO A: MVP (0-50 clientes, 0-500 conversaciones/día)**

**RECOMENDACIÓN: Hetzner CX11 ($4.20/mes) 🏆**

**Razones:**
- ✅ **65-80% más barato** que Cloud ($50 vs $120-276/año)
- ✅ **IP fija incluida** (crítico para WhatsApp Business API)
- ✅ **20 TB transfer incluido** (vs 1-4 TB Cloud)
- ✅ **Sin costos ocultos** (storage, bandwidth incluidos)
- ✅ **Facturación simple** (un precio fijo)
- ✅ **Setup idéntico** (3-4 horas, mismo que Cloud)
- ✅ **Performance suficiente** (2GB RAM para 3 bots Node.js)

**Desventajas vs Cloud:**
- ⚠️ No auto-scaling (pero no lo necesitas en MVP)
- ⚠️ Una sola región (pero tu target es LATAM)
- ⚠️ No integración AWS (pero usas Supabase)

**Conclusión:** Hetzner es **objetivamente mejor** para MVP. Ahorras $70-220/año sin sacrificar nada que necesites.

---

### **ESCENARIO B: Producción (50-200 clientes, 5,000 conversaciones/día)**

**RECOMENDACIÓN: DigitalOcean Regular ($12/mes) o AWS Lightsail Large ($20/mes)**

**Razones:**
- ✅ **Más RAM** (2-4 GB para manejar picos)
- ✅ **Mejor uptime** (DigitalOcean/AWS SLA 99.99%)
- ✅ **Backups automáticos** (+$1.20-4/mes)
- ✅ **Monitoring incluido** (DO: gratis, AWS: CloudWatch)
- ✅ **Soporte 24/7** (DO: email, AWS: forum/paid)

**Costos:**
```
DigitalOcean Regular (2GB) + Backups:
├─ Droplet: $12/mes
├─ Backups: $2.40/mes (20% del droplet)
├─ Monitoring: $0 (incluido)
└─ TOTAL: $14.40/mes = $173/año

AWS Lightsail Large (4GB):
├─ Plan: $20/mes
├─ Backups: Incluidos
├─ Monitoring: Incluido
└─ TOTAL: $20/mes = $240/año

Hetzner CX21 (4GB) + Backups:
├─ Server: $6.40/mes
├─ Backups: $1.28/mes (20%)
├─ Monitoring: Manual
└─ TOTAL: $7.68/mes = $92/año
```

**Ranking Producción:**
1. **Hetzner CX21** ($92/año) - Más barato, pero menos soporte
2. **DigitalOcean** ($173/año) - Balance precio/soporte
3. **AWS Lightsail** ($240/año) - Más caro, pero AWS ecosystem

**Decisión:** 
- Si quieres **máximo ahorro**: Hetzner CX21 ($92/año)
- Si quieres **balance**: DigitalOcean ($173/año)
- Si usas **otros servicios AWS**: Lightsail ($240/año)

**Para Assembly 2.0 (con Supabase): DigitalOcean $12/mes ✅**

---

### **ESCENARIO C: Escala (200+ clientes, 50,000+ conversaciones/día)**

**RECOMENDACIÓN: Evaluar Cloud con auto-scaling**

**Opciones:**
```
OPCIÓN A: VPS Cluster (manual)
├─ 3 VPS (DigitalOcean $12/mes cada uno): $36/mes
├─ Load Balancer (DigitalOcean): $12/mes
├─ Backups: $7.20/mes
└─ TOTAL: $55.20/mes = $662/año

OPCIÓN B: AWS Lightsail + Load Balancer
├─ 2-3 Lightsail Large ($20/mes cada uno): $40-60/mes
├─ Lightsail Load Balancer: $18/mes
└─ TOTAL: $58-78/mes = $696-936/año

OPCIÓN C: AWS EC2 Auto Scaling Group
├─ 2-5 t3.small (promedio 3): $52.80/mes
├─ Application Load Balancer: $16/mes
├─ Data transfer: $10/mes
└─ TOTAL: $78.80/mes = $946/año

PERO con economías de escala (auto-scale inteligente):
- Usa 2 instancias en horas valle (80% del día)
- Usa 5 instancias en horas pico (20% del día)
= Costo promedio: ~$60/mes
```

**Decisión Escala:**
- **Si quieres control**: VPS Cluster manual ($662/año)
- **Si quieres auto-scaling**: AWS EC2 Auto Scaling ($946/año, pero más resiliente)

**Pero estás lejos de este escenario (tienes 0 clientes ahora)**

---

## 💡 VENTAJAS ÚNICAS DEL CLOUD (que VPS no tiene)

### **1. Auto-Scaling (AWS, GCP, Azure)**
```
Beneficio: Escala automáticamente según demanda
Costo: $50-100/mes (setup + instancias extra)

¿Lo necesitas?: NO (en MVP/Producción temprana)
Cuándo sí: 500+ clientes con picos impredecibles
```

---

### **2. Integración con Servicios Managed**
```
Ejemplo: AWS Lightsail + RDS + S3 + Lambda
- Chatbot en Lightsail: $10/mes
- RDS PostgreSQL: $15/mes
- S3 storage: $5/mes
- Lambda functions: $2/mes
TOTAL: $32/mes (todo en AWS, sin data transfer OUT)

vs VPS + Supabase (actual):
- Hetzner VPS: $4.20/mes
- Supabase: $0-25/mes
TOTAL: $4.20-29.20/mes

Diferencia: Similar costo, PERO Cloud requiere más setup
```

**¿Lo necesitas?**: NO, Supabase ya es managed y más simple que RDS

---

### **3. Global CDN y Multi-Región**
```
Beneficio: Deploy en 10+ regiones globales
Costo: $200-500/mes

¿Lo necesitas?: NO (target: LATAM, 1 región suficiente)
Cuándo sí: Expansión internacional (Año 2-3)
```

---

### **4. Compliance y Certificaciones (AWS, Azure)**
```
Beneficio: SOC 2, ISO 27001, HIPAA, PCI-DSS
Costo: Incluido (pero pagas más por instancias)

¿Lo necesitas?: NO (Assembly 2.0 no maneja pagos ni salud)
Cuándo sí: Si manejas datos médicos o tarjetas de crédito
```

---

### **5. Managed Kubernetes (EKS, GKE, AKS)**
```
Beneficio: Orquestación de containers a gran escala
Costo: $70-200/mes (cluster) + nodos

¿Lo necesitas?: NO (3 chatbots Node.js = PM2 suficiente)
Cuándo sí: 50+ microservicios, 10+ developers
```

---

## ❌ DESVENTAJAS DEL CLOUD (vs VPS)

### **1. Facturación Compleja y Costos Ocultos**
```
AWS EC2 ejemplo real:
- EC2 t3.small: $14.60/mes (base)
- EBS Storage: $3/mes
- Data Transfer OUT: $5-20/mes (variable)
- Elastic IP (si detienes VM): $3.65/mes
- CloudWatch monitoring: $3/mes
TOTAL REAL: $29-44/mes (vs $14.60 esperado)

vs Hetzner CX11:
- Server: $4.20/mes
- TOTAL: $4.20/mes (sin sorpresas)
```

**Problema:** Factura AWS puede ser 2-3x el precio base por costos ocultos.

---

### **2. Curva de Aprendizaje (AWS, GCP, Azure)**
```
VPS setup: 3-4 horas (SSH, Nginx, PM2, SSL)
AWS EC2 setup: 6-8 horas (VPC, Security Groups, IAM, EBS, CloudWatch)

Diferencia: 2x más tiempo aprendiendo Cloud-specific concepts
```

**Problema:** El Coder necesita aprender AWS/GCP/Azure (días de documentación) vs VPS (conocimiento estándar Linux).

---

### **3. Vendor Lock-In**
```
Con VPS tradicional:
- Puedes migrar entre Hetzner, DO, Linode en 1 hora
- Código funciona igual en cualquier Ubuntu server

Con Cloud (AWS/GCP/Azure):
- Usas servicios específicos (RDS, Lambda, S3)
- Migrar a otro provider = reescribir partes del código
- Dependencia del vendor
```

**Problema:** Si AWS sube precios 50% (ha pasado), estás atrapado o necesitas semanas de re-arquitectura.

---

### **4. Overkill para Proyectos Pequeños**
```
Assembly 2.0 MVP:
- 3 chatbots Node.js
- Conexión a Supabase (externo)
- Sin auto-scaling necesario
- Sin multi-región necesario
- Sin compliance especial

AWS/GCP/Azure ventajas: Auto-scaling, multi-región, compliance
¿Las usas?: NO

= Estás pagando por features que no necesitas
```

---

## ✅ RECOMENDACIÓN FINAL

### **FASE 1: MVP (Mes 1-6, 0-50 clientes)**

**STACK:**
```
✅ Hetzner CX11 ($4.20/mes)
   └─ 3 Chatbots (WhatsApp + Telegram + Web)
   └─ 1 vCPU, 2GB RAM, 20GB SSD, 20TB transfer

✅ Supabase Free ($0/mes)
   └─ PostgreSQL + Auth + Storage

✅ Vercel Free ($0/mes)
   └─ Landing page + Dashboards

TOTAL: $4.20/mes = $50/año
```

**Por qué Hetzner (no Cloud):**
- ✅ 65-80% más barato ($50 vs $120-276/año)
- ✅ IP fija (crítico para WhatsApp Business API)
- ✅ Facturación simple (sin costos ocultos)
- ✅ Setup idéntico a Cloud VMs (3-4 horas)
- ✅ Performance suficiente (2GB RAM para 3 bots)
- ❌ No auto-scaling (pero no lo necesitas)
- ❌ No multi-región (pero tu target es LATAM)

**Ahorro vs Cloud:** $70-220/año

---

### **FASE 2: Producción (Mes 6-12, 50-200 clientes)**

**STACK:**
```
✅ DigitalOcean Regular ($12/mes) + Backups ($2.40/mes)
   └─ 1 vCPU, 2GB RAM, 50GB SSD, 2TB transfer
   └─ Backups automáticos
   └─ Monitoring incluido

✅ Supabase Pro ($25/mes)
   └─ 500 conexiones, 8GB storage, backups

✅ Vercel Free ($0/mes)

TOTAL: $39.40/mes = $473/año
```

**Por qué DigitalOcean (no Cloud completo):**
- ✅ Balance precio/facilidad ($473 vs $696 AWS Lightsail)
- ✅ Docs excelentes (comunidad grande)
- ✅ Backups automáticos (incluidos)
- ✅ Soporte 24/7 (email)
- ✅ Más barato que AWS/GCP/Azure (30-50%)

**Ahorro vs Cloud:** $220-460/año

---

### **FASE 3: Escala (Año 2+, 200+ clientes)**

**RECONSIDERAR Cloud si:**
1. ✅ Necesitas auto-scaling por picos impredecibles
2. ✅ Quieres expandir a Europa/Asia (multi-región)
3. ✅ Tienes DevOps dedicado (justifica complejidad Cloud)
4. ✅ Usas otros servicios AWS/GCP (integración)

**Opciones Escala:**
```
OPCIÓN A: VPS Cluster (DigitalOcean)
├─ 3 Droplets ($12/mes cada uno): $36/mes
├─ Load Balancer: $12/mes
├─ Backups: $7.20/mes
└─ TOTAL: $55.20/mes = $662/año

OPCIÓN B: AWS Lightsail Cluster
├─ 2 Lightsail Large ($20/mes): $40/mes
├─ Load Balancer: $18/mes
└─ TOTAL: $58/mes = $696/año

Diferencia: $34/año (5%) más con AWS
Beneficio AWS: Integración con otros servicios AWS (si los usas)
```

**Decisión:**
- Si **no usas otros servicios AWS**: DigitalOcean Cluster ($662/año)
- Si **usas S3, Lambda, RDS, etc.**: AWS Lightsail ($696/año)

---

## 📊 TABLA DE DECISIÓN FINAL

| Criterio | Peso | Hetzner/DO (VPS) | AWS/GCP/Azure (Cloud) | Ganador |
|----------|------|------------------|-----------------------|---------|
| **Costo (MVP)** | 30% | 10/10 ($50/año) | 4/10 ($120-276/año) | ✅ **VPS** |
| **Costo (Producción)** | 20% | 10/10 ($173/año) | 6/10 ($240-946/año) | ✅ **VPS** |
| **Simplicidad** | 15% | 10/10 (setup estándar) | 6/10 (más complejo) | ✅ **VPS** |
| **Facturación** | 10% | 10/10 (precio fijo) | 5/10 (costos ocultos) | ✅ **VPS** |
| **Auto-Scaling** | 5% | 3/10 (manual) | 10/10 (automático) | Cloud |
| **Multi-Región** | 5% | 4/10 (manual) | 10/10 (automático) | Cloud |
| **Integración AWS** | 5% | 3/10 (externo) | 10/10 (nativo) | Cloud |
| **IP Fija** | 5% | 10/10 (incluida) | 8/10 (extra $3.65) | ✅ **VPS** |
| **Support** | 5% | 7/10 (email) | 8/10 (24/7 forum) | Cloud |
| **TOTAL PONDERADO** | 100% | **8.8/10** | **6.2/10** | ✅ **VPS** |

**GANADOR: VPS Tradicionales (Hetzner MVP, DigitalOcean Producción) ✅**

---

## 🎯 RESPUESTA DIRECTA A HENRY

**"¿Cloud vs VPS?"**

**Para Assembly 2.0 chatbots: VPS tradicionales ganan** 🏆

**Razones:**
1. **65-80% más barato** ($50-473/año VPS vs $120-946/año Cloud)
2. **IP fija incluida** (crítico para WhatsApp Business API)
3. **Facturación simple** (sin costos ocultos)
4. **Setup idéntico** (3-4 horas, mismo código)
5. **Performance suficiente** (2GB RAM para 3 bots)

**Cloud solo vale si:**
- ❌ Necesitas auto-scaling (no, tienes 0-200 clientes)
- ❌ Necesitas multi-región (no, target es LATAM)
- ❌ Usas otros servicios AWS (no, usas Supabase)
- ❌ Necesitas compliance especial (no, no manejas pagos/salud)

**DECISIÓN FINAL:**
```
MVP (Mes 1-6): Hetzner CX11 ($4.20/mes) ✅
Producción (Mes 6+): DigitalOcean Regular ($12/mes) ✅
Escala (Año 2+): Reconsiderar Cloud si escalas a 500+ clientes
```

**Ahorro vs Cloud: $220-460/año** (suficiente para pagar 1 cliente gratis como marketing)

---

**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Status:** 🟢 ANÁLISIS COMPLETO

**¿Procedemos con VPS (Hetzner MVP, DigitalOcean Producción)?** 🚀
