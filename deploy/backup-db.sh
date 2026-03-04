#!/usr/bin/env bash
# Backup de PostgreSQL (Assembly 2.0).
# Crea un dump en deploy/backups/ o en ./backups si existe.
# Uso: ./deploy/backup-db.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

BACKUP_DIR="${PROJECT_ROOT}/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="${BACKUP_DIR}/assembly_${TIMESTAMP}.sql"

CONTAINER="assembly-db"
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "Error: contenedor ${CONTAINER} no está corriendo. Levanta el stack con: ./deploy/up.sh postgres"
  exit 1
fi

echo "Creando backup en ${FILE}..."
docker exec -t "$CONTAINER" pg_dump -U postgres -d assembly --no-owner --no-acl > "$FILE"
echo "Listo. Tamaño: $(du -h "$FILE" | cut -f1)"
