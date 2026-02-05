# Cron jobs FASE 08 - Créditos acumulables

Configurar en el servidor (crontab -e):

```bash
# Otorgar créditos mensuales (día 1 de cada mes, 1:00 AM)
0 1 1 * * cd /var/www/assembly && node scripts/grant-monthly-credits.js >> /var/log/grant-credits.log 2>&1

# Expirar créditos vencidos (diario 2:00 AM)
0 2 * * * cd /var/www/assembly && node scripts/expire-assembly-credits.js >> /var/log/expire-credits.log 2>&1
```

**Nota:** Los scripts están en TypeScript (`.ts`). Compilar con `npm run build` o ejecutar con `npx ts-node` si se invocan como `.ts`. Para cron usar versión compilada (`.js`) o wrapper que llame a `npx ts-node scripts/grant-monthly-credits.ts`.
