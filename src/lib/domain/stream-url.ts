/**
 * Validación de URL de streams antes de entregarlas al reproductor.
 *
 * Solo se aceptan:
 * - rutas relativas del propio sitio (medios de demostración en /demo/...), o
 * - URL absolutas https.
 *
 * Se rechazan javascript:, data:, http: sin cifrar, credenciales embebidas y
 * rutas relativas ambiguas ("//host", "../"). Cuando haya un panel de
 * administración, esta misma función validará las URL en el servidor.
 */
export function isAllowedStreamUrl(raw: string): boolean {
  const value = raw.trim();
  if (value.length === 0 || value.length > 2048) return false;

  if (value.startsWith("/")) {
    if (value.startsWith("//")) return false; // URL relativa al protocolo: apunta a otro host
    if (value.includes("..") || value.includes("\\")) return false;
    return /^\/[\w\-./]+$/.test(value);
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  return true;
}
