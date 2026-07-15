const INTERNAL_DOMAIN = "temploapp.local";

export function cleanUsername(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizedName(value: string): string {
  return cleanUsername(value).toLocaleLowerCase("es-UY");
}

export function usernameToAuthEmail(value: string): string {
  const encoded = Buffer.from(normalizedName(value), "utf8").toString("base64url");
  return `${encoded}@${INTERNAL_DOMAIN}`;
}

export { INTERNAL_DOMAIN };
