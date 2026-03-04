#!/usr/bin/env bash
# Levanta el stack Assembly 2.0 (Docker).
# Uso: ./deploy/up.sh [servicios]
#   Sin argumentos: levanta todos los servicios.
#   Ejemplo: ./deploy/up.sh postgres redis   (solo BD y Redis)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

if [ $# -eq 0 ]; then
  echo "Levantando stack completo..."
  docker compose up -d
else
  echo "Levantando: $*"
  docker compose up -d "$@"
fi

echo ""
echo "Estado:"
docker compose ps
echo ""
echo "Logs en tiempo real: docker compose logs -f"
