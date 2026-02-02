# 🚀 SETUP VPS PARA CHATBOTS MULTI-CANAL
## Guía Completa: WhatsApp Business API + Telegram + Web App Chatbot

**Versión:** 1.0  
**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Audiencia:** Coder (para implementación)  
**Tiempo estimado:** 3-4 horas setup inicial

---

## 🎯 OBJETIVO

Configurar un VPS con 3 chatbots corriendo simultáneamente:
1. **WhatsApp Business API Bot** (soporte y demo)
2. **Telegram Bot** (lead generation)
3. **Web App Chatbot** (widget en dashboards)

**Stack:**
- VPS: Hetzner CX11 ($6/mes) o DigitalOcean Droplet ($12-24/mes)
- OS: Ubuntu 22.04 LTS
- Runtime: Node.js 20 LTS
- Process Manager: PM2
- Reverse Proxy: Nginx
- SSL: Let's Encrypt (Certbot)
- Database: Supabase Cloud (externa)

---

## 📋 PREREQUISITOS

### **1. Cuenta VPS (elegir una):**

**OPCIÓN A: Hetzner (🏆 Recomendado para MVP - más barato)**
```
Plan: CX11
CPU: 1 vCPU AMD
RAM: 2 GB
Storage: 20 GB SSD
Network: 20 TB traffic
Precio: €4.15/mes (~$4.50 USD)
Ubicación: Ashburn, VA (USA) o Falkenstein, Germany

Registro: https://www.hetzner.com/cloud
```

**OPCIÓN B: DigitalOcean (Más fácil para principiantes)**
```
Plan: Basic Droplet
CPU: 1 vCPU
RAM: 1-2 GB (elegir 2GB = $12/mes para mejor rendimiento)
Storage: 25-50 GB SSD
Network: 2-3 TB
Precio: $6/mes (1GB) o $12/mes (2GB)
Ubicación: New York (NYC1) o San Francisco (SFO3)

Registro: https://www.digitalocean.com/
```

---

### **2. Dominio (para SSL y WhatsApp Business)**
```
Comprar: Namecheap, Google Domains, Cloudflare

Costo: $10-15/año

Subdomains necesarios:
├─ bot.assembly20.com (Telegram webhook)
├─ whatsapp.assembly20.com (WhatsApp webhook)
└─ chat.assembly20.com (Web App chatbot)

Configurar DNS A records apuntando a IP del VPS
```

---

### **3. WhatsApp Business API Access**

**Opción 1: WhatsApp Business API (Gratis - 1,000 conversaciones/mes)**
```
Registro:
1. Meta Business Account: https://business.facebook.com/
2. WhatsApp Business Platform: https://business.facebook.com/wa/manage/home/
3. Crear app en Meta for Developers: https://developers.facebook.com/
4. Agregar producto "WhatsApp"
5. Obtener:
   - Phone Number ID
   - WhatsApp Business Account ID
   - Access Token
   - Webhook Verify Token (tú lo creas)

Pricing (tras free tier):
- $0 primeras 1,000 conversaciones/mes
- $0.005-0.009 por conversación adicional (depende del país)
```

**Opción 2: Twilio WhatsApp Business API (Más fácil setup)**
```
Registro: https://www.twilio.com/console/sms/whatsapp/learn
Pricing:
- $0.005 por mensaje inbound
- $0.005-0.03 por mensaje outbound (depende del país)

Ventaja: Sandbox gratuito para testing
Desventaja: Más caro que Meta directo
```

---

### **4. Telegram Bot Token**
```
Ya tienes:
- Bot Token: 123456789:ABCdef... (de @BotFather)
```

---

## 🔧 PASO 1: PROVISIONAR VPS (15 minutos)

### **1.1 Crear Droplet/VPS**

**En Hetzner:**
```
1. Cloud Console → Projects → New Project: "Assembly 2.0"
2. Add Server
3. Location: Ashburn, VA (más cerca de LATAM)
4. Image: Ubuntu 22.04
5. Type: Standard CX11 (2GB RAM)
6. Networking: IPv4 + IPv6
7. SSH Keys: Agregar tu llave pública SSH
8. Name: assembly-chatbots
9. Create & Buy Now
```

**En DigitalOcean:**
```
1. Create → Droplets
2. Region: New York (NYC1)
3. Image: Ubuntu 22.04 LTS
4. Size: Basic → $12/mes (2GB RAM)
5. Authentication: SSH Key (agregar la tuya)
6. Hostname: assembly-chatbots
7. Create Droplet
```

**Resultado:** Obtienes IP pública (ej: `159.223.45.123`)

---

### **1.2 Conectar por SSH**

```bash
# Desde tu Mac
ssh root@TU_IP_VPS

# Primera vez: Verificar fingerprint y escribir "yes"
# Deberías ver: root@assembly-chatbots:~#
```

---

## 🔐 PASO 2: SEGURIDAD BÁSICA (20 minutos)

### **2.1 Actualizar sistema**

```bash
apt update && apt upgrade -y
```

---

### **2.2 Crear usuario no-root**

```bash
# Crear usuario
adduser deployer
# (Contraseña: [crear una segura y guardarla])

# Dar permisos sudo
usermod -aG sudo deployer

# Copiar SSH keys
rsync --archive --chown=deployer:deployer ~/.ssh /home/deployer
```

---

### **2.3 Configurar firewall (UFW)**

```bash
# Instalar UFW
apt install ufw -y

# Configurar reglas
ufw allow OpenSSH        # Puerto 22 (SSH)
ufw allow 80/tcp         # HTTP (para Let's Encrypt verification)
ufw allow 443/tcp        # HTTPS (webhooks)

# Activar firewall
ufw enable

# Verificar status
ufw status
```

**Output esperado:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

---

### **2.4 Instalar Fail2Ban (protección contra brute-force)**

```bash
apt install fail2ban -y

# Iniciar servicio
systemctl start fail2ban
systemctl enable fail2ban
```

---

## 📦 PASO 3: INSTALAR STACK (30 minutos)

### **3.1 Instalar Node.js 20 LTS**

```bash
# Cambiar a usuario deployer
su - deployer

# Instalar nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Cargar nvm
source ~/.bashrc

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar instalación
node --version  # Debería mostrar: v20.x.x
npm --version   # Debería mostrar: 10.x.x
```

---

### **3.2 Instalar PM2 (Process Manager)**

```bash
npm install -g pm2

# Verificar instalación
pm2 --version

# Configurar PM2 para iniciar en boot
pm2 startup systemd
# (Copiar y ejecutar el comando que te muestra)

sudo env PATH=$PATH:/home/deployer/.nvm/versions/node/v20.11.0/bin pm2 startup systemd -u deployer --hp /home/deployer
```

---

### **3.3 Instalar Nginx**

```bash
# Volver a root
exit

# Instalar Nginx
apt install nginx -y

# Iniciar y habilitar
systemctl start nginx
systemctl enable nginx

# Verificar status
systemctl status nginx

# Verificar que funciona: Abre http://TU_IP_VPS en navegador
# Deberías ver: "Welcome to nginx!"
```

---

### **3.4 Instalar Certbot (Let's Encrypt SSL)**

```bash
apt install certbot python3-certbot-nginx -y
```

---

## 🤖 PASO 4: DEPLOYAR CHATBOTS (60 minutos)

### **4.1 Crear estructura de carpetas**

```bash
# Como usuario deployer
su - deployer

# Crear carpetas
mkdir -p ~/apps/telegram-bot
mkdir -p ~/apps/whatsapp-bot
mkdir -p ~/apps/web-chatbot
mkdir -p ~/logs
```

---

### **4.2 Clonar repositorio (o subir código)**

**Opción A: Git (recomendado)**
```bash
cd ~/apps

# Clonar repo
git clone https://github.com/hbatista2720/assembly-2-0.git

# Copiar bots a sus carpetas
cp -r assembly-2-0/bots/telegram/* telegram-bot/
cp -r assembly-2-0/bots/whatsapp/* whatsapp-bot/
cp -r assembly-2-0/bots/web/* web-chatbot/
```

**Opción B: SCP (si no tienes Git)**
```bash
# Desde tu Mac (otra terminal)
scp -r ./bots/telegram/* deployer@TU_IP_VPS:~/apps/telegram-bot/
scp -r ./bots/whatsapp/* deployer@TU_IP_VPS:~/apps/whatsapp-bot/
scp -r ./bots/web/* deployer@TU_IP_VPS:~/apps/web-chatbot/
```

---

### **4.3 Configurar variables de entorno**

```bash
# Telegram Bot
cd ~/apps/telegram-bot
nano .env
```

**Contenido de `.env` (Telegram Bot):**
```env
NODE_ENV=production
PORT=3001

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdef-tu-token-aqui
TELEGRAM_WEBHOOK_DOMAIN=https://bot.assembly20.com

# Gemini AI
GEMINI_API_KEY=AIza-tu-api-key-aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

Guardar: `Ctrl+O`, Enter, `Ctrl+X`

---

```bash
# WhatsApp Bot
cd ~/apps/whatsapp-bot
nano .env
```

**Contenido de `.env` (WhatsApp Bot):**
```env
NODE_ENV=production
PORT=3002

# WhatsApp Business API (Meta)
WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=tu-business-account-id
WHATSAPP_ACCESS_TOKEN=tu-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu-verify-token-secreto-aqui
WHATSAPP_WEBHOOK_URL=https://whatsapp.assembly20.com

# Gemini AI
GEMINI_API_KEY=AIza-tu-api-key-aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

---

```bash
# Web Chatbot
cd ~/apps/web-chatbot
nano .env
```

**Contenido de `.env` (Web Chatbot):**
```env
NODE_ENV=production
PORT=3003

# Socket.io
CORS_ORIGIN=https://assembly20.com,https://www.assembly20.com

# Gemini AI
GEMINI_API_KEY=AIza-tu-api-key-aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

---

### **4.4 Instalar dependencias**

```bash
# Telegram Bot
cd ~/apps/telegram-bot
npm install --production

# WhatsApp Bot
cd ~/apps/whatsapp-bot
npm install --production

# Web Chatbot
cd ~/apps/web-chatbot
npm install --production
```

---

### **4.5 Iniciar bots con PM2**

```bash
# Telegram Bot
cd ~/apps/telegram-bot
pm2 start index.js --name telegram-bot

# WhatsApp Bot
cd ~/apps/whatsapp-bot
pm2 start index.js --name whatsapp-bot

# Web Chatbot
cd ~/apps/web-chatbot
pm2 start index.js --name web-chatbot

# Verificar que están corriendo
pm2 list
```

**Output esperado:**
```
┌─────┬──────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ status  │ cpu     │ memory  │ restarts │
├─────┼──────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ telegram-bot │ online  │ 0%      │ 45 MB   │ 0        │
│ 1   │ whatsapp-bot │ online  │ 0%      │ 50 MB   │ 0        │
│ 2   │ web-chatbot  │ online  │ 0%      │ 42 MB   │ 0        │
└─────┴──────────────┴─────────┴─────────┴─────────┴──────────┘
```

---

### **4.6 Guardar configuración PM2**

```bash
pm2 save
```

Esto guarda la config para que PM2 auto-reinicie los bots si el VPS se reinicia.

---

## 🌐 PASO 5: CONFIGURAR NGINX REVERSE PROXY (30 minutos)

### **5.1 Configurar DNS (primero)**

```
Ve a tu proveedor de dominio (Namecheap, Google Domains, etc.)

Agregar A records:
├─ bot.assembly20.com       → IP_DEL_VPS
├─ whatsapp.assembly20.com  → IP_DEL_VPS
└─ chat.assembly20.com      → IP_DEL_VPS

Esperar 5-15 minutos para propagación DNS
```

**Verificar DNS:**
```bash
# Desde tu Mac
dig bot.assembly20.com +short
# Debería mostrar: IP_DEL_VPS
```

---

### **5.2 Crear config de Nginx para Telegram Bot**

```bash
# Como root
sudo nano /etc/nginx/sites-available/telegram-bot
```

**Contenido:**
```nginx
server {
    listen 80;
    server_name bot.assembly20.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### **5.3 Crear config para WhatsApp Bot**

```bash
sudo nano /etc/nginx/sites-available/whatsapp-bot
```

**Contenido:**
```nginx
server {
    listen 80;
    server_name whatsapp.assembly20.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### **5.4 Crear config para Web Chatbot**

```bash
sudo nano /etc/nginx/sites-available/web-chatbot
```

**Contenido:**
```nginx
server {
    listen 80;
    server_name chat.assembly20.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # WebSocket specific
        proxy_buffering off;
    }
}
```

---

### **5.5 Activar sitios**

```bash
# Crear symlinks
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/web-chatbot /etc/nginx/sites-enabled/

# Eliminar default site
sudo rm /etc/nginx/sites-enabled/default

# Verificar config
sudo nginx -t

# Si dice "syntax is ok" y "test is successful":
sudo systemctl reload nginx
```

---

## 🔒 PASO 6: INSTALAR SSL (15 minutos)

```bash
# Obtener certificados SSL para los 3 dominios
sudo certbot --nginx -d bot.assembly20.com -d whatsapp.assembly20.com -d chat.assembly20.com

# Certbot te preguntará:
# 1. Email: henry.batista27@gmail.com
# 2. Términos: Yes
# 3. Share email: No
# 4. Redirect HTTP to HTTPS: Yes (opción 2)

# Certbot automáticamente modifica las configs de Nginx y reinicia el servicio
```

**Verificar SSL:**
```bash
# Desde tu Mac o navegador
curl https://bot.assembly20.com/health
# Debería responder sin errores SSL
```

---

## ✅ PASO 7: TESTING (30 minutos)

### **7.1 Test Telegram Bot**

```bash
# Configurar webhook
curl -X POST "https://api.telegram.org/bot<TU_BOT_TOKEN>/setWebhook?url=https://bot.assembly20.com/webhook"

# Verificar webhook
curl "https://api.telegram.org/bot<TU_BOT_TOKEN>/getWebhookInfo"

# Debería mostrar:
# "url": "https://bot.assembly20.com/webhook"
# "has_custom_certificate": false
# "pending_update_count": 0
```

**Test manual:**
1. Abre Telegram
2. Busca tu bot: `@assembly20_assistant_bot`
3. Envía: `/start`
4. Debería responder en <1 segundo

---

### **7.2 Test WhatsApp Bot**

```bash
# Configurar webhook en Meta for Developers
1. Ve a: https://developers.facebook.com/apps/
2. Tu app → WhatsApp → Configuration
3. Webhook:
   - Callback URL: https://whatsapp.assembly20.com/webhook
   - Verify Token: (el que pusiste en .env)
4. Click "Verify and Save"
5. Subscribe to "messages" field
```

**Test manual:**
1. Envía mensaje de WhatsApp al número de tu bot
2. Debería responder en <1 segundo

---

### **7.3 Test Web Chatbot**

```bash
# Desde tu Mac
curl https://chat.assembly20.com/health

# Debería responder:
# {"status":"ok","service":"web-chatbot"}
```

**Test desde frontend:**
```javascript
// En tu Next.js app (frontend)
import io from 'socket.io-client';

const socket = io('https://chat.assembly20.com');

socket.on('connect', () => {
  console.log('Chatbot conectado!');
  socket.emit('message', { text: 'Hola' });
});

socket.on('response', (data) => {
  console.log('Bot dice:', data.text);
});
```

---

## 📊 PASO 8: MONITOREO (15 minutos)

### **8.1 Ver logs en tiempo real**

```bash
# Telegram Bot
pm2 logs telegram-bot --lines 100

# WhatsApp Bot
pm2 logs whatsapp-bot --lines 100

# Web Chatbot
pm2 logs web-chatbot --lines 100

# Todos los bots
pm2 logs
```

---

### **8.2 Ver métricas**

```bash
pm2 monit
```

Muestra:
- CPU usage
- Memory usage
- Logs en tiempo real

---

### **8.3 Configurar alertas (opcional)**

```bash
# Instalar PM2 monitoring (gratis hasta 5 servidores)
pm2 link <public-key> <secret-key>

# O usar Uptime Robot (gratis):
# https://uptimerobot.com/
# Agregar monitores:
# - https://bot.assembly20.com/health (cada 5 min)
# - https://whatsapp.assembly20.com/health (cada 5 min)
# - https://chat.assembly20.com/health (cada 5 min)
```

---

## 🔄 PASO 9: DEPLOY UPDATES (10 minutos)

### **Script de deploy automático**

```bash
# Crear script
nano ~/deploy.sh
```

**Contenido:**
```bash
#!/bin/bash

echo "🚀 Deploying updates..."

# Pull latest code
cd ~/apps/assembly-2-0
git pull origin main

# Update Telegram Bot
echo "📱 Updating Telegram Bot..."
cd ~/apps/telegram-bot
npm install --production
pm2 restart telegram-bot

# Update WhatsApp Bot
echo "💬 Updating WhatsApp Bot..."
cd ~/apps/whatsapp-bot
npm install --production
pm2 restart whatsapp-bot

# Update Web Chatbot
echo "🌐 Updating Web Chatbot..."
cd ~/apps/web-chatbot
npm install --production
pm2 restart web-chatbot

echo "✅ Deploy complete!"
pm2 list
```

**Hacer ejecutable:**
```bash
chmod +x ~/deploy.sh
```

**Usar:**
```bash
# Cada vez que hagas cambios en GitHub
~/deploy.sh
```

---

## 💰 COSTOS FINALES

```
VPS (Hetzner CX11):              $6/mes
Dominio (assembly20.com):        $1/mes (amortizado)
Supabase Free:                   $0/mes
SSL (Let's Encrypt):             $0/mes
WhatsApp Business API:           $0/mes (primeras 1,000 conversaciones)
Telegram Bot API:                $0/mes
Gemini AI:                       $0/mes (gratis)

TOTAL MVP (Mes 1-3):             $7/mes = $84/año

Producción (tras 1,000 conversaciones/mes WhatsApp):
VPS upgrade (DigitalOcean):      $12-24/mes
Supabase Pro:                    $25/mes
WhatsApp extra conversations:    ~$5-10/mes (estimado 1,500 conversaciones)

TOTAL PRODUCCIÓN:                $42-59/mes = $504-708/año
```

---

## 🎯 CHECKLIST FINAL

```
[ ] VPS provisionado (Hetzner o DigitalOcean)
[ ] Seguridad configurada (UFW, Fail2Ban)
[ ] Node.js 20 instalado
[ ] PM2 instalado y configurado para startup
[ ] Nginx instalado
[ ] 3 bots deployados (Telegram, WhatsApp, Web)
[ ] PM2 corriendo los 3 bots (pm2 list = 3 online)
[ ] DNS configurado (3 subdomains)
[ ] Nginx reverse proxy configurado (3 sites)
[ ] SSL instalado (Certbot)
[ ] Telegram webhook configurado y funcionando
[ ] WhatsApp webhook configurado y verificado
[ ] Web chatbot accesible vía Socket.io
[ ] Logs verificados (sin errores)
[ ] Script de deploy creado
[ ] Monitoreo configurado (PM2 o Uptime Robot)
```

---

## 🆘 TROUBLESHOOTING

### **Problema: PM2 no inicia en boot**
```bash
pm2 unstartup systemd
pm2 startup systemd
# Ejecutar el comando que te muestra
pm2 save
```

---

### **Problema: Nginx 502 Bad Gateway**
```bash
# Verificar que los bots estén corriendo
pm2 list

# Verificar logs
pm2 logs

# Reiniciar bots
pm2 restart all

# Verificar puertos
sudo netstat -tulpn | grep LISTEN
# Deberías ver: 3001, 3002, 3003
```

---

### **Problema: SSL no funciona**
```bash
# Re-ejecutar Certbot
sudo certbot --nginx -d bot.assembly20.com -d whatsapp.assembly20.com -d chat.assembly20.com --force-renewal

# Verificar certificados
sudo certbot certificates
```

---

### **Problema: WhatsApp webhook verification fails**
```bash
# Verificar logs del WhatsApp bot
pm2 logs whatsapp-bot

# Verificar que el verify token en .env sea correcto
cd ~/apps/whatsapp-bot
cat .env | grep VERIFY_TOKEN

# Verificar que el endpoint responde
curl "https://whatsapp.assembly20.com/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=TU_VERIFY_TOKEN"

# Debería retornar: test
```

---

### **Problema: Telegram bot no responde**
```bash
# Verificar webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Si dice "last_error_date", eliminar y reconfigurar webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://bot.assembly20.com/webhook"

# Verificar logs
pm2 logs telegram-bot
```

---

## 📚 RECURSOS

**Documentación oficial:**
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Telegram Bot API: https://core.telegram.org/bots/api
- Socket.io: https://socket.io/docs/v4/
- PM2: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/

**Tutoriales:**
- Setup VPS con Node.js: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04
- WhatsApp Business API getting started: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

---

**Fecha:** 30 Enero 2026  
**Responsable:** Arquitecto  
**Status:** 🟢 LISTO PARA IMPLEMENTACIÓN

**Próximo paso:** Pasar este documento al Coder para que ejecute el setup en VPS.
