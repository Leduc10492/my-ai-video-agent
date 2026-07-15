import { randomUUID } from "node:crypto";
import { mkdtemp, mkdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectCatalog } from "./project-catalog";

const temporaryPaths: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryPaths.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("project catalog authorization boundary", () => {
  it("creates only in an empty authorized folder and never overwrites an existing project", async () => {
    const root = await mkdtemp(join(tmpdir(), "ai-director-catalog-"));
    temporaryPaths.push(root);
    const userData = join(root, "user-data");
    const projectRoot = join(root, "project");
    await mkdir(projectRoot);
    const catalog = new ProjectCatalog(userData);
    const created = await catalog.create({ name: "安全项目", rootToken: randomUUID(), template: "film" }, projectRoot);
    expect(created.rootPath).toBe(await realpath(projectRoot));
    await expect(catalog.create({ name: "覆盖尝试", rootToken: randomUUID(), template: "film" }, projectRoot))
      .rejects.toThrow(/空文件夹|导入项目/);
    expect((await catalog.get(created.id)).name).toBe("安全项目");
  });

  it("rejects a non-empty folder before creating metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "ai-director-catalog-"));
    temporaryPaths.push(root);
    const projectRoot = join(root, "not-empty");
    await mkdir(projectRoot);
    await writeFile(join(projectRoot, "notes.txt"), "user data", "utf8");
    const catalog = new ProjectCatalog(join(root, "user-data"));
    await expect(catalog.create({ name: "拒绝覆盖", rootToken: randomUUID(), template: "blank" }, projectRoot))
      .rejects.toThrow(/空文件夹/);
  });
});
