import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const publicDirectory = join(process.cwd(), "public");
const maxPublicBytes = Number(process.env.PUBLIC_ASSET_BUDGET_BYTES ?? 16 * 1024 * 1024);
const maxSingleAssetBytes = Number(
  process.env.PUBLIC_SINGLE_ASSET_BUDGET_BYTES ?? 2 * 1024 * 1024
);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile() && entry.name !== ".DS_Store") {
      files.push(path);
    }
  }

  return files;
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

const files = await collectFiles(publicDirectory);
const assets = await Promise.all(
  files.map(async (file) => ({
    path: relative(publicDirectory, file),
    bytes: (await stat(file)).size,
  }))
);
const totalBytes = assets.reduce((total, asset) => total + asset.bytes, 0);
const oversizedAssets = assets.filter((asset) => asset.bytes > maxSingleAssetBytes);

console.log(
  `public/: ${formatBytes(totalBytes)} / ${formatBytes(maxPublicBytes)} (${assets.length} files)`
);

for (const asset of [...assets].sort((a, b) => b.bytes - a.bytes).slice(0, 5)) {
  console.log(`  ${formatBytes(asset.bytes)}  ${asset.path}`);
}

if (totalBytes > maxPublicBytes) {
  console.error(
    `Public asset budget exceeded by ${formatBytes(totalBytes - maxPublicBytes)}.`
  );
  process.exitCode = 1;
}

if (oversizedAssets.length > 0) {
  console.error(
    `Single-asset budget exceeded (${formatBytes(maxSingleAssetBytes)}): ${oversizedAssets
      .map((asset) => asset.path)
      .join(", ")}`
  );
  process.exitCode = 1;
}
