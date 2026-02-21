#!/usr/bin/env bash
# Levanta todos los contenedores de Assembly y aplica la política de reinicio
# (restart: unless-stopped) para que arranquen solos cuando se inicie Docker.
# Uso: ./start-assembly.sh   (desde la raíz del proyecto)

set -e
cd "$(dirname "$0")"
echo "Levantando contenedores Assembly (recreando para aplicar arranque automático)..."
docker compose up -d --force-recreate
echo "Listo. A partir de ahora, al abrir Docker Desktop los contenedores deberían arrancar solos."
echo ""
echo "Estado:"
docker compose ps
