import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const listener = "addEventListener('fetch',event=>event.respondWith(handle(event.request)));";
if (!source.trimEnd().endsWith(listener)) {
  throw new Error("Unexpected Worker entrypoint; refusing to deploy an unverified rewrite.");
}
const pagesWorker = source.trimEnd().slice(0, -listener.length) +
  "\nexport default { fetch(request) { return handle(request); } };\n";

const out = new URL("../dist/", import.meta.url);
await mkdir(out, { recursive: true });
await writeFile(new URL("_worker.js", out), pagesWorker);
await writeFile(
  new URL("index.html", out),
  "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>TaskForge AI</title></head><body>TaskForge AI</body></html>\n"
);
console.log("Cloudflare Pages Worker generated from the tested source Worker.");
