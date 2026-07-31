import "server-only";

export function getPasswordRecoveryRedirectUrl(): string | null {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredSiteUrl) return null;

  try {
    const siteUrl = new URL(configuredSiteUrl);
    if (
      (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") ||
      siteUrl.username ||
      siteUrl.password
    ) {
      return null;
    }

    return new URL("/reset-password", siteUrl.origin).toString();
  } catch {
    return null;
  }
}
