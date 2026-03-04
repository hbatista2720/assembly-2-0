#!/usr/bin/env bash
# Paso 3: Sube .env al VPS y levanta el stack (ejecutar desde tu Mac, en la raíz del proyecto).
# Uso: ./deploy/paso3-deploy-vps.sh
# Necesitas: tener el proyecto ya copiado en el VPS (/opt/assembly-2-0) y poder SSH como root.

set -e
VPS_IP="${VPS_IP:-45.63.104.7}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_DIR="/opt/assembly-2-0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "VPS: $REMOTE_USER@$VPS_IP"
echo "Directorio en servidor: $REMOTE_DIR"
echo ""

# 1) Preparar .env para el servidor (usar tu .env local o la plantilla)
if [ -f ".env" ]; then
  echo "Usando tu .env local y adaptando para el VPS..."
  TMP_ENV=$(mktemp)
  cp .env "$TMP_ENV"
  # NEXTAUTH_URL para que la app funcione por IP
  if grep -q "^NEXTAUTH_URL=" "$TMP_ENV"; then
    sed -i.bak "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://${VPS_IP}:3000|" "$TMP_ENV"
  else
    echo "NEXTAUTH_URL=http://${VPS_IP}:3000" >> "$TMP_ENV"
  fi
  # DATABASE_URL: en el servidor la app corre en Docker y debe usar el servicio "postgres"
  if grep -q "^DATABASE_URL=" "$TMP_ENV"; then
    # Extraer usuario y contraseña (postgres://USER:PASS@... o postgresql://USER:PASS@...)
    DB_USER=$(sed -n 's|^DATABASE_URL=postgres.*://\([^:]*\):.*|\1|p' .env | head -1)
    PASS=$(sed -n 's|^DATABASE_URL=postgres.*://[^:]*:\([^@]*\)@.*|\1|p' .env | head -1)
    [ -z "$DB_USER" ] && DB_USER=$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2)
    [ -z "$DB_USER" ] && DB_USER="postgres"
    [ -z "$PASS" ] && PASS=$(sed -n 's/^POSTGRES_PASSWORD=\(.*\)/\1/p' .env | head -1)
    [ -z "$PASS" ] && PASS="postgres"
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USER}:${PASS}@postgres:5432/assembly|" "$TMP_ENV"
  fi
  # NODE_ENV producción
  if grep -q "^NODE_ENV=" "$TMP_ENV"; then
    sed -i.bak "s/^NODE_ENV=.*/NODE_ENV=production/" "$TMP_ENV"
  else
    echo "NODE_ENV=production" >> "$TMP_ENV"
  fi
  rm -f "${TMP_ENV}.bak"
  ENV_TO_SEND="$TMP_ENV"
else
  echo "No hay .env en la raíz. Subiendo plantilla deploy/.env.vps.example como .env."
  echo "Después de ejecutar, entra al servidor (ssh $REMOTE_USER@$VPS_IP), edita /opt/assembly-2-0/.env y vuelve a ejecutar este script."
  ENV_TO_SEND="$SCRIPT_DIR/.env.vps.example"
fi

# 2) Subir .env al servidor
echo "Subiendo .env al servidor..."
scp "$ENV_TO_SEND" "$REMOTE_USER@$VPS_IP:$REMOTE_DIR/.env"
[ -n "$TMP_ENV" ] && rm -f "$TMP_ENV"

# 3) En el servidor: permisos y levantar contenedores
echo "Levantando Docker en el VPS (te pedirá la contraseña SSH si no usas key)..."
ssh "$REMOTE_USER@$VPS_IP" "cd $REMOTE_DIR && chmod +x deploy/up.sh deploy/backup-db.sh 2>/dev/null; docker compose up -d"

echo ""
echo "Listo. Comprueba con:"
echo "  ssh $REMOTE_USER@$VPS_IP 'cd $REMOTE_DIR && docker compose ps'"
echo "  Abre en el navegador: http://${VPS_IP}:3000"
