export const INTERNAL_AUTH_DOMAIN = "temploapp.local";

export function cleanUsername(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizedName(value: string): string {
  return cleanUsername(value)
    .toLocaleLowerCase("es-UY")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/[^\p{L}\p{N} ]+/gu, "");
}

export function usernameToAuthEmail(value: string): string {
  const identifier = normalizedName(value)
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${identifier}@${INTERNAL_AUTH_DOMAIN}`;
}
