#!/usr/bin/env bash
# PASO 2: Instalar Docker en el VPS (ejecutar DENTRO del servidor por SSH).
# Uso:
#   1. Conéctate:  ssh root@45.63.104.7
#   2. Copia este script al servidor o pega los comandos.
#   3. Ejecuta:  bash paso2-instalar-docker.sh

set -e
echo "=== Actualizando sistema ==="
apt update && apt upgrade -y

echo "=== Instalando Docker ==="
apt install -y docker.io docker-compose-v2 git curl

echo "=== Habilitando Docker al inicio ==="
systemctl enable docker
systemctl start docker

echo "=== Comprobando instalación ==="
docker --version
docker compose version

echo ""
echo "✅ Paso 2 listo. Siguiente: Paso 3 (clonar proyecto y levantar stack)."
echo "   Desde tu PC: ssh root@45.63.104.7"
echo "   Luego en el servidor: cd /opt && git clone <repo> assembly-2-0 && cd assembly-2-0"
