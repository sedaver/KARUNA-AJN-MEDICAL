import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve("dist");
const port = Number(process.env.PORT ?? 3001);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    let filePath = path.join(root, urlPath);
    if (!filePath.startsWith(root)) throw new Error("Invalid path");
    try {
      if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, "index.html");
    } catch {
      filePath = path.extname(filePath) ? filePath : path.join(filePath, "index.html");
    }
    await access(filePath);
    response.writeHead(200, { "Content-Type": types[path.extname(filePath)] ?? "application/octet-stream" });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(path.join(root, "404.html")).pipe(response);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static preview ready at http://127.0.0.1:${port}`);
});
