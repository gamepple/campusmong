import { env } from "cloudflare:workers";

const encoder = new TextEncoder();
const SESSION_AGE = 60 * 60 * 24 * 30;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signature(value: string) {
  if (!env.EDITOR_SESSION_SECRET) throw new Error("Editor authentication is unavailable");
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.EDITOR_SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

function cookieValue(request: Request, name: string) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

export async function createEditorSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_AGE;
  const payload = `editor.${expires}`;
  return `${payload}.${await signature(payload)}`;
}

export async function isEditor(request: Request) {
  const session = cookieValue(request, "campusmong_editor");
  if (!session) return false;
  const parts = session.split(".");
  if (parts.length !== 3 || parts[0] !== "editor") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  return parts[2] === await signature(`${parts[0]}.${parts[1]}`);
}

export function sessionCookie(value: string) {
  return `campusmong_editor=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_AGE}`;
}

export const clearSessionCookie = "campusmong_editor=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
export function editorIdMatches(value: string) { return value === (env.EDITOR_LOGIN_ID || "jhm7195"); }
