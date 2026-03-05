# Acceso al Dashboard Henry (Platform Admin)

## Cómo entrar con henry.batista27@gmail.com

1. **Asegurar que el usuario existe en la base de datos**  
   El snippet `sql_snippets/00_auth_otp_local.sql` ya incluye a `henry.batista27@gmail.com` con rol `ADMIN_PLATAFORMA` e `is_platform_owner = TRUE`.  
   - Si usas Docker con init SQL, ese script suele ejecutarse al crear la BD.  
   - Si la BD ya existía antes, ejecuta al menos la parte de usuarios (o el INSERT que no choque con existentes):

   ```sql
   INSERT INTO users (id, organization_id, email, role, is_platform_owner) VALUES
     ('00000000-0000-0000-0000-000000000001', NULL, 'henry.batista27@gmail.com', 'ADMIN_PLATAFORMA', TRUE)
   ON CONFLICT (email) DO UPDATE SET role = 'ADMIN_PLATAFORMA', is_platform_owner = TRUE;
   ```

2. **Entrar por login OTP**  
   - Abre **http://localhost:3000/login** (o tu dominio, ej. https://chatvote.click/login).  
   - Escribe **henry.batista27@gmail.com** y pulsa "Enviar código".  
   - En **modo prueba OTP** (Configuración Chatbot → Modo OTP = Prueba), el PIN de 6 dígitos puede aparecer en la respuesta de la API o en la interfaz; cópialo y pégalo.  
   - En **modo producción**, el PIN se envía al correo; revisa bandeja (y spam).  
   - Tras verificar el código, la app te redirige a **/dashboard/platform-admin** (Dashboard Henry).

3. **URLs útiles**  
   - Login: `/login`  
   - Dashboard principal (redirige según rol): `/dashboard`  
   - Dashboard Henry (platform admin): `/dashboard/platform-admin` o `/dashboard/admin`  
   - Desde el menú lateral: Chatbot, Buzón correo, Leads, Aprobaciones, etc.

## Si "Usuario no encontrado" al pedir el código

El usuario debe existir en la tabla `users`. En la VPS o local con Docker:

```bash
docker exec -i assembly-db psql -U postgres -d assembly -c "
  SELECT id, email, role, is_platform_owner FROM users WHERE email = 'henry.batista27@gmail.com';
"
```

Si no sale ninguna fila, inserta el usuario (ver SQL de arriba) con el usuario/BD correctos (`postgres`/`assembly` o los que uses).

## Lentitud en localhost

- Reinicia los contenedores: `docker compose down && docker compose up -d postgres redis pgbouncer app`.  
- La primera carga de Next.js puede ser lenta; las siguientes suelen ir más rápido.  
- Si sigue lento, revisa `docker compose ps` y `docker logs assembly-app --tail 50` por errores.
