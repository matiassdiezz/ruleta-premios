# Ruleta de Premios

Ruleta de premios interactiva para eventos presenciales. PWA offline-first con almacenamiento local en IndexedDB.

## Setup

```bash
npm install
npm run dev
```

## Config via URL params

| Param | Descripcion | Default |
|---|---|---|
| `event` | ID del evento | `default` |
| `brand` | Nombre de la marca | `diezypunto` |
| `logo` | URL del logo | `/wheel/logo.png` |
| `bg` | Color de fondo | `#0a0a1a` |
| `text` | Color de texto | `#ffffff` |
| `accent` | Color de acento | `#f59e0b` |

Ejemplo: `?brand=MiMarca&accent=%23ff0000&logo=https://example.com/logo.png`

Los parametros se persisten en IndexedDB — la siguiente visita sin params usa la config guardada.

## Deploy

Configurado para Vercel (static site, Vite build).

```bash
npx vercel --prod
```

## Supabase (coming soon)

Preparado para sync de spins a Supabase. Los spins se guardan localmente en IDB con flag `synced: 0`. Cuando se agregue Supabase, copiar `.env.example` a `.env` y completar las keys.
