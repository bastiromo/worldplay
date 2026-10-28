# WorldPlay

Plataforma web para descubrir y reproducir canales de televisión y emisoras de radio de distintos países desde un solo lugar.

> **Estado:** fase 1, interfaz navegable con catálogo de demostración. Todas las señales son ficticias y sus streams son medios sintéticos generados por el propio proyecto. Aún no hay fuentes reales, base de datos ni cuentas de usuario.

## Puesta en marcha

Requisitos: Node.js 20 o superior y pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| Script | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `pnpm start` | Compilación y servidor de producción |
| `pnpm typecheck` | Genera los tipos de rutas y ejecuta TypeScript estricto |
| `pnpm lint` | ESLint (reglas de Next.js y React) |
| `pnpm test` | Pruebas unitarias con Vitest |
| `pnpm check` | Las tres comprobaciones anteriores |
| `pnpm media` | Regenera los medios de demostración (requiere ffmpeg) |

## Stack

- **Next.js 16** (App Router, Cache Components y Partial Prefetching), **React 19**, **TypeScript** estricto.
- **Tailwind CSS 4**: los tokens de diseño están en `src/app/globals.css`.
- **hls.js**: se carga bajo demanda solo cuando el navegador no reproduce HLS de forma nativa (Safari e iOS sí lo hacen).
- **Fuentes autoalojadas** (Onest y Big Shoulders Display, vía Fontsource): las visitas no generan peticiones a servicios de terceros.

## Estructura

```
src/
  app/                    Rutas: /, /tv, /radio, /explorar, /ver/[slug]
  components/
    shell/                Logo, navegación, buscador global
    catalog/              Tarjetas, sintonizador de países, filtros, vista de catálogo
    player/               Reproductores de vídeo (HLS) y radio, y el hook de conexión al stream
    home/                 Vista previa de la portada
  lib/
    domain/               Tipos, búsqueda, filtros y validación de URL (sin dependencias de UI)
    catalog/              Repositorio del catálogo y datos de demostración
scripts/generate-demo-media.sh   Generación de vídeo HLS y audio de prueba
public/demo/              Medios sintéticos generados
```

**Separación de capas.** Las páginas solo usan la interfaz `CatalogRepository` (`src/lib/catalog/repository.ts`). Hoy la implementa un repositorio en memoria; en la fase de persistencia se sustituirá por Supabase sin tocar los componentes.

## Política de señales

Cada señal registra procedencia, sitio oficial, estado de derechos (`rightsStatus`), disponibilidad técnica (`availability`) y fecha de última comprobación. Funcionar técnicamente y estar autorizada son condiciones distintas:

- Solo se publican señales con `rightsStatus: "approved"`. Las pendientes, rechazadas o retiradas no aparecen en listados, búsquedas ni fichas.
- Una señal marcada como fuera del aire informa al usuario y sugiere alternativas, sin intentar reproducirse.
- Las URL de stream se validan (`isAllowedStreamUrl`): solo `https:` o rutas propias del sitio. Se rechazan `javascript:`, `data:`, `http:`, credenciales embebidas y rutas ambiguas.
- WorldPlay no retransmite señales por sus servidores ni elude DRM, geobloqueos o restricciones de incrustación.

## Seguridad

- Los parámetros de la URL (`pais`, `categoria`, `q`) se validan contra listas de valores conocidos y la búsqueda se limita a 80 caracteres.
- Cabeceras de seguridad en `next.config.ts`: `X-Frame-Options`, `frame-ancestors`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
- No hay secretos ni variables de entorno en esta fase.

## Medios de demostración

`pnpm media` sintetiza con ffmpeg tres señales de vídeo (HLS con segmentos fMP4) y tres de audio (MP3). No contienen material de terceros.
