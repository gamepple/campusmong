import { env } from "cloudflare:workers";
import { database } from "@/db/store";

const encoder = new TextEncoder();
const SESSION_AGE = 60 * 60 * 24 * 30;
const FALLBACK_EDITOR_ID = "jhm7195";

function runtimeEditorLoginId(request?: Request) {
  const value =
    request?.headers.get("x-campusmong-editor-id") ??
    env.EDITOR_LOGIN_ID ??
    (typeof process !== "undefined" ? process.env.EDITOR_LOGIN_ID : undefined);
  return typeof value === "string" ? value.trim() : "";
}

function editorLoginId(request?: Request) {
  return runtimeEditorLoginId(request) || FALLBACK_EDITOR_ID;
}

export function editorAuthStatus(request: Request) {
  return {
    revision: "2026-09-14.1",
    loginSource: runtimeEditorLoginId(request) ? "environment" : "fallback",
    sessionMode: "d1",
  };
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function tokenHash(value: string) {
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

function newSessionToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

function cookieValue(request: Request, name: string) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

export async function createEditorSession() {
  const token = newSessionToken();
  const expires = Math.floor(Date.now() / 1000) + SESSION_AGE;
  const db = database();
  await db.prepare("DELETE FROM editor_sessions WHERE expires_at <= ?").bind(Math.floor(Date.now() / 1000)).run();
  await db.prepare("INSERT INTO editor_sessions (token_hash, expires_at) VALUES (?, ?)").bind(await tokenHash(token), expires).run();
  return token;
}

export async function isEditor(request: Request) {
  const session = cookieValue(request, "campusmong_editor");
  if (!session || !/^[A-Za-z0-9_-]{43}$/.test(session)) return false;
  const now = Math.floor(Date.now() / 1000);
  const hash = await tokenHash(session);
  const row = await database()
    .prepare("SELECT expires_at FROM editor_sessions WHERE token_hash = ?")
    .bind(hash)
    .first<{ expires_at: number }>();
  if (!row || row.expires_at <= now) {
    if (row) await database().prepare("DELETE FROM editor_sessions WHERE token_hash = ?").bind(hash).run();
    return false;
  }
  return true;
}

export async function deleteEditorSession(request: Request) {
  const session = cookieValue(request, "campusmong_editor");
  if (!session || !/^[A-Za-z0-9_-]{43}$/.test(session)) return;
  await database().prepare("DELETE FROM editor_sessions WHERE token_hash = ?").bind(await tokenHash(session)).run();
}

export function sessionCookie(value: string) {
  return `campusmong_editor=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_AGE}`;
}

export const clearSessionCookie = "campusmong_editor=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";

export function editorIdMatches(value: string, request?: Request) {
  return value.trim() === editorLoginId(request);
}
