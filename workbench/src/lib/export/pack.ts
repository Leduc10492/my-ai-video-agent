/**
 * Adapted from bo961386926/manga-studio (MIT)
 * src/services/exportService.ts — JSZip packaging of named entries.
 * Remote video download and browser object URLs removed. Files are read from disk.
 */
import { readFileSync } from "node:fs";

import JSZip from "jszip";

export async function packZip(entries: { name: string; filePath?: string; text?: string }[]) {
  const zip = new JSZip();
  for (const entry of entries) {
    if (entry.text !== undefined) zip.file(entry.name, entry.text);
    else if (entry.filePath) zip.file(entry.name, readFileSync(entry.filePath));
  }
  return zip.generateAsync({ type: "nodebuffer" });
}
