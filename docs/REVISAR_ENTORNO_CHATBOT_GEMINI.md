# Cómo revisar el entorno del chatbot (Lex + Gemini)

## 1. Variables de entorno

El chat de residentes usa **Gemini** y lee estas variables (Next.js carga `.env.local` y `.env` automáticamente):

| Variable         | Uso                                      | Ejemplo (solo referencia) |
|------------------|------------------------------------------|---------------------------|
| `GEMINI_API_KEY` | Obligatoria para que el chat responda con IA | Clave de Google AI Studio |
| `GEMINI_MODEL`   | Opcional; modelo a usar                  | `gemini-1.5-flash` (por defecto) |

- **Archivos:** `.env.local` (prioridad) o `.env`. Puedes copiar desde `.env.example`.
- **Seguridad:** No subas `.env` ni `.env.local` a Git (ya están en `.gitignore`).

## 2. Comprobar si la clave está cargada

### Opción A – Endpoint de estado (recomendado)

Con la app en marcha (`npm run dev`), abre en el navegador o con `curl`:

```bash
curl -s http://localhost:3000/api/chat/resident
```

Respuesta esperada si está configurado:

```json
{ "geminiConfigured": true, "model": "gemini-1.5-flash" }
```

Si no hay clave:

```json
{ "geminiConfigured": false, "model": "gemini-1.5-flash" }
```

No se expone la clave, solo si está definida o no.

### Opción A2 – Validar que la API responde (llamada real a Gemini)

Para comprobar que la clave es válida y Gemini responde en tu entorno:

```bash
curl -s "http://localhost:3000/api/chat/resident?validate=1"
```

Si todo está bien:

```json
{ "ok": true, "message": "API Gemini respondió correctamente." }
```

Si la clave falla o hay error de red:

```json
{ "ok": false, "error": "La llamada a Gemini falló...", "detail": "..." }
```

### Opción B – Revisar archivos (sin mostrar la clave)

En la raíz del proyecto:

```bash
# ¿Existe .env.local y tiene la variable?
grep -q "GEMINI_API_KEY=." .env.local 2>/dev/null && echo "GEMINI_API_KEY está definida" || echo "Falta o está vacía"
```

No uses `cat .env.local` en entornos compartidos para no mostrar la clave.

## 3. Logs del servidor al usar el chat

Al enviar un mensaje en el chat, el servidor (la terminal donde corre `npm run dev`) escribe:

- Si **Gemini falla** (red, clave inválida, contenido bloqueado):
  - `[api/chat/resident] Gemini error (revisar GEMINI_API_KEY o red):` + detalle del error.
- Si **Gemini responde vacío**:
  - `[api/chat/resident] Gemini devolvió respuesta vacía; usando fallback (revisar GEMINI_API_KEY).`

Si siempre ves el mismo mensaje genérico en el chat (“Soy Lex, el asistente…”) y no hay errores en consola, puede ser respuesta vacía de Gemini; en ese caso debería aparecer el aviso de “respuesta vacía” arriba.

## 4. Obtener o revisar la API key de Gemini

1. Entra en [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Crea o elige una API key.
3. Ponla en `.env.local`:
   ```env
   GEMINI_API_KEY=tu_clave_aqui
   ```
4. Reinicia el servidor (`Ctrl+C` y de nuevo `npm run dev`).

## 5. Resumen rápido

| Qué quieres saber              | Cómo hacerlo |
|--------------------------------|--------------|
| ¿Está configurada la clave?    | `curl -s http://localhost:3000/api/chat/resident` → `geminiConfigured` |
| ¿Por qué no responde con sentido? | Revisar la terminal del servidor al escribir en el chat (errores o “respuesta vacía”) |
| ¿Dónde se define la clave?     | `.env.local` en la raíz del proyecto |
| ¿La API responde de verdad?   | `curl -s "http://localhost:3000/api/chat/resident?validate=1"` → `ok: true` |
| ¿Dónde se amplía el conocimiento? | `docs/chatbot-knowledge-resident.md` |

## 5.1 Base de conocimiento (IA + documento)

El chat usa **Gemini** y además una **base de conocimiento en archivo**: `docs/chatbot-knowledge-resident.md` (cómo votar, quórum, Ley 284, opciones). Ese contenido se inyecta en el prompt; puedes editarlo para ampliar lo que Lex sabe sin tocar código. Fuente completa: `Marketing/BASE_CONOCIMIENTO_CHATBOT_LEX.md`.
