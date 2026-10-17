/**
 * Adapted from LingyiChen-AI/AIComicBuilder (Apache-2.0)
 * src/lib/staleness.ts — hashScript only.
 * The upstream helpers write isStale into a database and expect a later regeneration.
 * This workbench never rewrites downstream files and never auto-reruns a skill.
 */
import { createHash } from "node:crypto";

export function hashScript(script: string): string {
  return createHash("sha256").update(script || "").digest("hex").slice(0, 16);
}

export function isDownstreamStale(currentScript: string, baselineHash: string | null | undefined) {
  if (!baselineHash) return false;
  return hashScript(currentScript) !== baselineHash;
}
