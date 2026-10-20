import path from "node:path";
import fs from "node:fs";

const stageNames = {
  script: "剧本创作",
  audit: "剧本审核",
  assets: "资产拆分",
  storyboard: "分镜设计",
  prompts: "视频 Prompt",
  html: "生产 HTML",
};

export function skillThreadName(store, job) {
  let project = store.projectName || path.basename(store.root);
  if (project === "project") project = "测试项目";
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(project)) project = "本地项目";
  project = [...project.replace(/\s+/g, " ").trim()].slice(0, 48).join("");
  return ["工作台", project, stageNames[job.stage] || job.stage, job.scene]
    .filter(Boolean)
    .join(" · ");
}

// Keep the execution cwd (and its Registry) intact. Bind to an already saved
// ancestor project so internal UUID/test directories do not become sidebar groups.
export async function skillThreadProject(client, root) {
  const canonical = value => {
    try { return fs.realpathSync(value); }
    catch { return path.resolve(value); }
  };
  root = canonical(root);
  let cursor, match;
  do {
    const page = await client.request("project/list", {
      limit: 100,
      ...(cursor ? { cursor } : {}),
    });
    for (const project of page.data || [])
      for (const candidate of project.roots || []) {
        const candidatePath = canonical(candidate.path);
        const relative = path.relative(candidatePath, root);
        if (
          !path.isAbsolute(relative) &&
          relative !== ".." &&
          !relative.startsWith(`..${path.sep}`) &&
          (!match || candidatePath.length > match.path.length)
        ) match = { id: project.id, path: candidatePath };
      }
    cursor = page.nextCursor;
  } while (cursor);
  return match?.id;
}

export async function archiveSkillThread(client, root, threadId) {
  try {
    await client.request("thread/archive", { threadId }, 15000);
  } catch (error) {
    // Archive is not idempotent in app-server. Confirm an external/prior archive
    // through the API instead of interpreting a missing rollout as success.
    if (!/no rollout found for thread id/i.test(error.message)) throw error;
    let cursor;
    do {
      const page = await client.request("thread/list", {
        cwd: root, archived: true,
        // Desktop-launched older workers can be recorded as vscode/cli.
        // Ownership is established by the saved job's exact thread ID, not source.
        sourceKinds: ["appServer", "vscode", "cli", "exec", "unknown"], limit: 100,
        ...(cursor ? { cursor } : {}),
      }, 15000);
      if (page.data?.some(thread => thread.id === threadId)) return;
      cursor = page.nextCursor;
    } while (cursor);
    throw error;
  }
}
