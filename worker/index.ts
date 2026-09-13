/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  EDITOR_LOGIN_ID?: string;
  EDITOR_SESSION_SECRET?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    // Vinext normally exposes bindings through cloudflare:workers. Forward the
    // two authentication bindings from the Worker fetch environment as an
    // additional reliable path. Incoming values are always removed first so a
    // visitor cannot supply or override these internal headers.
    const headers = new Headers(request.headers);
    headers.delete("x-campusmong-editor-id");
    headers.delete("x-campusmong-session-secret");
    if (env.EDITOR_LOGIN_ID) headers.set("x-campusmong-editor-id", env.EDITOR_LOGIN_ID);
    if (env.EDITOR_SESSION_SECRET) headers.set("x-campusmong-session-secret", env.EDITOR_SESSION_SECRET);

    return handler.fetch(new Request(request, { headers }), env, ctx);
  },
};

export default worker;
