import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4190);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const safePath = normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  const fullPath = join(root, safePath === "/" ? "index.html" : safePath);

  if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
    return join(fullPath, "index.html");
  }

  return fullPath;
}

createServer((req, res) => {
  const filePath = resolvePath(req.url || "/");

  if (!existsSync(filePath)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "content-type": types[extname(filePath)] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`PRD Copilot is running on port ${port}`);
});
