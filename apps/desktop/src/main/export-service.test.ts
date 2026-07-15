import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { openDirectorStore } from "@ai-director/storage";
import { createExportPayload, toProductionExport } from "./export-service";

const temporaryPaths: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("desktop approved exports", () => {
  it("preserves ordered Shot Row to Prompt Envelope mapping", async () => {
    const root = await mkdtemp(join(tmpdir(), "ai-director-desktop-"));
    temporaryPaths.push(root);
    const store = openDirectorStore(root);
    const demo = store.seedDemo();
    const bundle = store.getBundle(demo.project.id);
    const output = toProductionExport(bundle);
    expect(output.envelopes.find((item) => item.id === "P001")?.shotRowIds).toEqual(["R01", "R02"]);
    const html = await createExportPayload("html", bundle);
    expect(String(html.data)).toContain("这不是我录的");
    store.close();
  });
});
