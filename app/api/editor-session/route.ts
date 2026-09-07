import { clearSessionCookie, createEditorSession, editorIdMatches, isEditor, sessionCookie } from "@/lib/editor-auth";
import { z } from "zod";

export async function GET(request: Request) {
  return Response.json({ canEdit: await isEditor(request) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
    const { id } = z.object({ id: z.string().trim().min(1).max(40) }).parse(await request.json());
    if (!editorIdMatches(id)) return Response.json({ error: "ID를 확인해 주세요." }, { status: 401 });
    return Response.json({ canEdit: true }, { headers: { "Set-Cookie": sessionCookie(await createEditorSession()), "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Editor login failed", error);
    return Response.json({ error: "로그인하지 못했습니다. 다시 시도해 주세요." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  return Response.json({ canEdit: false }, { headers: { "Set-Cookie": clearSessionCookie, "Cache-Control": "no-store" } });
}
