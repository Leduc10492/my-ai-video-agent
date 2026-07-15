import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import type { CreateProjectInput, ProjectSummaryDto } from "../shared/ipc";

export interface CatalogProjectSummary extends ProjectSummaryDto {
  rootPath: string;
}

interface CatalogFile {
  schemaVersion: 1;
  activeProjectId?: string;
  projects: CatalogProjectSummary[];
}

const EMPTY_CATALOG: CatalogFile = { schemaVersion: 1, projects: [] };

function defaultProjectSummary(id: string, name: string, rootPath: string): CatalogProjectSummary {
  return {
    id,
    name,
    rootPath,
    updatedAt: new Date().toISOString(),
    archived: false,
    currentStage: "剧本",
    progress: 0,
    sceneCount: 0,
    openTaskCount: 0,
    staleCount: 0
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export class ProjectCatalog {
  readonly #catalogPath: string;

  constructor(userDataPath: string) {
    this.#catalogPath = join(userDataPath, "catalog", "projects.json");
  }

  async read(): Promise<CatalogFile> {
    try {
      const parsed = JSON.parse(await readFile(this.#catalogPath, "utf8")) as CatalogFile;
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.projects)) return EMPTY_CATALOG;
      return parsed;
    } catch {
      return { ...EMPTY_CATALOG, projects: [] };
    }
  }

  async list(): Promise<CatalogProjectSummary[]> {
    const catalog = await this.read();
    const checked = await Promise.all(catalog.projects.map(async (project) => {
      const available = await exists(project.rootPath);
      return available ? project : { ...project, currentStage: "路径不可用" };
    }));
    return checked.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async create(input: CreateProjectInput, authorizedRootPath: string): Promise<CatalogProjectSummary> {
    const selectedRoot = resolve(authorizedRootPath);
    const info = await stat(selectedRoot);
    if (!info.isDirectory()) throw new Error("请选择一个空的项目文件夹。");
    const projectRoot = await realpath(selectedRoot);
    const existingEntries = (await readdir(projectRoot)).filter((entry) => entry !== ".DS_Store");
    if (existingEntries.length > 0) {
      throw new Error("新项目需要使用空文件夹；已有项目请使用“导入项目”。");
    }
    if (await exists(join(projectRoot, ".ai-director", "project.json")) || await exists(join(projectRoot, ".ai-director", "project.db"))) {
      throw new Error("这个文件夹已经包含 AI 导演项目，请使用“导入项目”。");
    }
    const project = defaultProjectSummary(randomUUID(), input.name, projectRoot);
    const metadataPath = join(projectRoot, ".ai-director", "project.json");
    try {
      await mkdir(dirname(metadataPath), { recursive: false, mode: 0o700 });
      await writeFile(metadataPath, `${JSON.stringify({
        schemaVersion: 1,
        id: project.id,
        name: project.name,
        template: input.template,
        createdAt: project.updatedAt
      }, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
      await this.initializeProjectFolders(projectRoot);
      const catalog = await this.read();
      catalog.projects = [project, ...catalog.projects.filter((item) => item.rootPath !== projectRoot)];
      catalog.activeProjectId = project.id;
      await this.write(catalog);
      return project;
    } catch (error) {
      await Promise.all([
        rm(join(projectRoot, ".ai-director"), { recursive: true, force: true }),
        rm(join(projectRoot, "assets"), { recursive: true, force: true }),
        rm(join(projectRoot, "deliverables"), { recursive: true, force: true })
      ]);
      throw error;
    }
  }

  async importExisting(rootPath: string): Promise<CatalogProjectSummary> {
    const projectRoot = await realpath(resolve(rootPath));
    const info = await stat(projectRoot);
    if (!info.isDirectory()) throw new Error("请选择项目文件夹。");
    await this.initializeProjectFolders(projectRoot);
    let metadata: { id?: string; name?: string } = {};
    try {
      metadata = JSON.parse(await readFile(join(projectRoot, ".ai-director", "project.json"), "utf8")) as typeof metadata;
    } catch {
      // Existing deliverables-only projects are migrated without touching their approved files.
    }
    const project = defaultProjectSummary(metadata.id ?? randomUUID(), metadata.name ?? basename(projectRoot), projectRoot);
    const catalog = await this.read();
    catalog.projects = [project, ...catalog.projects.filter((item) => item.rootPath !== projectRoot && item.id !== project.id)];
    catalog.activeProjectId = project.id;
    await this.write(catalog);
    return project;
  }

  async update(projectId: string, patch: Partial<Omit<ProjectSummaryDto, "id">>): Promise<void> {
    const catalog = await this.read();
    const index = catalog.projects.findIndex((item) => item.id === projectId);
    if (index < 0) throw new Error("项目不存在或已被移除。");
    const current = catalog.projects[index];
    if (!current) throw new Error("项目不存在或已被移除。");
    catalog.projects[index] = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await this.write(catalog);
  }

  async replaceIdentity(projectId: string, nextId: string, name: string): Promise<CatalogProjectSummary> {
    const catalog = await this.read();
    const index = catalog.projects.findIndex((item) => item.id === projectId);
    if (index < 0) throw new Error("项目不存在或已被移除。");
    const current = catalog.projects[index];
    if (!current) throw new Error("项目不存在或已被移除。");
    const replacement = { ...current, id: nextId, name, updatedAt: new Date().toISOString() };
    catalog.projects = catalog.projects
      .filter((item) => item.id !== nextId || item.rootPath === current.rootPath)
      .map((item) => item.id === projectId ? replacement : item);
    if (catalog.activeProjectId === projectId) catalog.activeProjectId = nextId;
    await writeFile(join(current.rootPath, ".ai-director", "project.json"), `${JSON.stringify({
      schemaVersion: 1,
      id: nextId,
      name,
      importedAt: replacement.updatedAt
    }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await this.write(catalog);
    return replacement;
  }

  async get(projectId: string): Promise<CatalogProjectSummary> {
    const project = (await this.read()).projects.find((item) => item.id === projectId);
    if (!project) throw new Error("项目不存在或已被移除。");
    return project;
  }

  async setActive(projectId: string): Promise<void> {
    const catalog = await this.read();
    if (!catalog.projects.some((item) => item.id === projectId)) throw new Error("项目不存在或已被移除。");
    catalog.activeProjectId = projectId;
    await this.write(catalog);
  }

  async activeProjectId(): Promise<string | undefined> {
    return (await this.read()).activeProjectId;
  }

  private async initializeProjectFolders(rootPath: string): Promise<void> {
    await Promise.all([
      mkdir(join(rootPath, ".ai-director", "runs"), { recursive: true }),
      mkdir(join(rootPath, ".ai-director", "snapshots"), { recursive: true }),
      mkdir(join(rootPath, "assets", "source"), { recursive: true }),
      mkdir(join(rootPath, "assets", "generated"), { recursive: true }),
      mkdir(join(rootPath, "deliverables", "00_admin"), { recursive: true }),
      mkdir(join(rootPath, "deliverables", "10_story"), { recursive: true }),
      mkdir(join(rootPath, "deliverables", "20_assets"), { recursive: true }),
      mkdir(join(rootPath, "deliverables", "30_shotlist"), { recursive: true })
    ]);
  }

  private async write(catalog: CatalogFile): Promise<void> {
    await mkdir(dirname(this.#catalogPath), { recursive: true });
    const temporaryPath = `${this.#catalogPath}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.#catalogPath);
  }
}
