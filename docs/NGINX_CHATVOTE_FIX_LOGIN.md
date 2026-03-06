# Nginx: evitar "Internal Server Error" y que el login se quede pensando

Cuando **chatvote.click/login** se queda cargando y luego muestra "Internal Server Error", suele ser porque la **primera** petición a la app tarda mucho (Next.js compila la ruta, 10–20 segundos) y **Nginx corta** la conexión por timeout.

## Solución: subir timeouts en Nginx

En la **VPS**, edita el sitio de chatvote:

```bash
sudo nano /etc/nginx/sites-available/chatvote
```

Sustituye el contenido por el siguiente (o añade las líneas `proxy_*_timeout` y `proxy_buffer` si ya tienes un `server`):

```nginx
server {
    listen 80;
    server_name chatvote.click www.chatvote.click;

    # Timeouts largos: la primera carga de /login puede tardar 15–30 s (compilación)
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

Guarda (Ctrl+O, Enter, Ctrl+X) y comprueba:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Comprobar

1. Abre **http://chatvote.click/login**.
2. La primera vez puede tardar **15–30 segundos** (no cierres la pestaña).
3. Cuando cargue, deberías ver el formulario de login. Las siguientes veces suele ir más rápido.

## Si sigue fallando

En la VPS, con la terminal abierta en los logs:

```bash
docker logs -f assembly-app
```

Entra desde el navegador a **chatvote.click/login** y espera a que salga el error. Copia la línea que muestre **Error** o **500** (y el stack trace si aparece) para ver la causa exacta.
