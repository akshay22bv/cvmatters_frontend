/** Safari has no `crypto.randomUUID` outside a secure context (and on older versions). */
export function newId() {
  const web = globalThis.crypto;
  if (web && typeof web.randomUUID === "function") return web.randomUUID();

  const bytes = new Uint8Array(16);
  if (web?.getRandomValues) web.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
