import config from "~/config";

export function getMagicLinkFromToken(token: string) {
  return `${config.app.baseUrl}/ml/${token}`;
}
