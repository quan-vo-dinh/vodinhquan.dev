import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const routes = [
  { name: "home", manifest: "page", budget: 1_250_000 },
  { name: "blog", manifest: "blog/page", budget: 1_250_000 },
  { name: "moments", manifest: "moments/page", budget: 1_250_000 },
];

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function getRouteBundleBytes(manifestPath) {
  const source = await readFile(manifestPath, "utf8");
  const match = source.match(/=\s*(\{[\s\S]*\});\s*$/);

  if (!match) {
    throw new Error(`Could not parse ${manifestPath}.`);
  }

  const manifest = JSON.parse(match[1]);
  const chunks = new Set([
    ...Object.values(manifest.clientModules).flatMap((module) => module.chunks),
    ...Object.values(manifest.entryJSFiles).flat(),
  ]);
  let bytes = 0;

  for (const chunk of chunks) {
    if (!chunk.startsWith("/_next/")) {
      continue;
    }

    bytes += (await stat(join(process.cwd(), ".next", chunk.slice("/_next/".length)))).size;
  }

  return { bytes, chunkCount: chunks.size };
}

for (const route of routes) {
  const manifestPath = join(
    process.cwd(),
    ".next/server/app",
    `${route.manifest}_client-reference-manifest.js`
  );
  const { bytes, chunkCount } = await getRouteBundleBytes(manifestPath);
  const budget = Number(
    process.env[`ROUTE_BUNDLE_${route.name.toUpperCase()}_BYTES`] ?? route.budget
  );

  console.log(
    `${route.name}: ${formatBytes(bytes)} / ${formatBytes(budget)} (${chunkCount} chunks)`
  );

  if (bytes > budget) {
    console.error(
      `${route.name} client bundle budget exceeded by ${formatBytes(bytes - budget)}.`
    );
    process.exitCode = 1;
  }
}
