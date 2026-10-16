/** Base URL encoded into every QR code. Set NEXT_PUBLIC_SITE_URL to your LAN/public address to scan from a phone. */
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
