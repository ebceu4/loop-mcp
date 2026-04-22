export function sanitizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function jsonText(value: unknown) {
  return JSON.stringify(value, null, 2);
}
