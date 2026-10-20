import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { createApp } from "../server/app.mjs";
import {
  SkillSettings,
  registrySkills,
  skillInputs,
} from "../server/skill-settings.mjs";
import { startSkill } from "../server/codex.mjs";
import { atomic, sha } from "../server/files.mjs";
const doc = (name, body = "Write a screenplay.") =>
  `---\nname: ${name}\ndescription: Write screenplay and cinematic prompts.\n---\n\n${body}\n`;
class Client extends EventEmitter {
  requests = new Map();
  projectThreads = new Map();
  entries = [];
  calls = [];
  async request(method, params) {
    this.calls.push({ method, params });
    if (method === "skills/list")
      return {
        data: [{ cwd: params.cwds[0], skills: this.entries, errors: [] }],
      };
    if (method === "thread/start") return { thread: { id: "test-thread" } };
    if (method === "turn/start") return { turn: { id: "test-turn" } };
    return {};
  }
  close() {}
}
async function fixture(t) {
  const temp = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "skill-settings-")),
    ),
    root = path.join(temp, "project"),
    library = path.join(temp, "installed"),
    client = new Client();
  const original =
    "# Registry\n\n| Slot | Skill | Owner | Output |\n| --- | --- | --- | --- |\n| `script.primary` | `original` | `writer` | `deliverables/1_story/` |\n| `shotlist.prompt_compiler` | `original` | `director` | Prompt |\n\nKeep this documentation unchanged.\n";
  atomic(path.join(root, ".agents/skill_registry.md"), original);
  atomic(path.join(root, ".agents/skills/original/SKILL.md"), doc("original"));
  atomic(
    path.join(library, "writer/SKILL.md"),
    doc(
      "writer",
      "Write original screenplays. [Guide](references/guide.md)\n[Dependency](../helper/SKILL.md)",
    ),
  );
  atomic(
    path.join(library, "writer/references/guide.md"),
    "# A useful guide\nNo external execution.\n",
  );
  fs.mkdirSync(path.join(library, "writer/assets"), { recursive: true });
  fs.writeFileSync(
    path.join(library, "writer/assets/pixel.bin"),
    Buffer.from([0, 255, 1, 128, 0]),
  );
  atomic(path.join(library, "writer/scripts/helper.sh"), "#!/bin/sh\nexit 0\n");
  fs.chmodSync(path.join(library, "writer/scripts/helper.sh"), 0o755);
  atomic(
    path.join(library, "helper/SKILL.md"),
    doc("helper", "Help with screenplay."),
  );
  client.entries = [
    {
      name: "original",
      path: path.join(root, ".agents/skills/original/SKILL.md"),
      description: "Existing screenplay skill",
      scope: "repo",
      enabled: true,
    },
    {
      name: "writer",
      path: path.join(library, "writer/SKILL.md"),
      description: "Write a screenplay",
      scope: "user",
      enabled: true,
    },
    {
      name: "helper",
      path: path.join(library, "helper/SKILL.md"),
      description: "Screenplay helper",
      scope: "user",
      enabled: true,
    },
  ];
  const app = await createApp({
    dataDir: path.join(temp, "app"),
    initialRoot: root,
    codexClient: client,
    runWorker: false,
  });
  const store = app.stores.get(app.projects[0].project_id),
    service = new SkillSettings(client),
    base = `/api/projects/${app.projects[0].project_id}`;
  const call = (method, url, payload) =>
    app.app.inject({
      method,
      url: base + url,
      headers: { "x-workbench": "1" },
      payload,
    });
  t.after(async () => {
    await app.app.close();
    fs.rmSync(temp, { recursive: true, force: true });
  });
  const state = await service.state(store),
    selected = state.candidates.find((c) => c.name === "writer");
  const input = {
    expected_sha256: state.registry_sha256,
    changes: [{ slot: "script.primary", candidate_id: selected.candidate_id }],
  };
  return {
    ...app,
    temp,
    root,
    library,
    client,
    store,
    service,
    base,
    call,
    state,
    input,
    original,
  };
}

test("compiler binding retains the project language and payload contract", async (t) => {
  const f = await fixture(t);
  const input = {
    ...f.input,
    changes: [{ ...f.input.changes[0], slot: "shotlist.prompt_compiler" }],
  };
  const review = (await f.service.inspect(f.store, input)).public;
  assert.equal(review.can_save, true);
  await f.service.save(f.store, { ...input, check_sha256: review.check_sha256 });
  const compiler = registrySkills(f.root).find(
    (s) => s.slot === "shotlist.prompt_compiler",
  );
  const wrapper = fs.readFileSync(compiler.path, "utf8");
  assert.match(wrapper, /## Source And Language Override/);
  assert.match(wrapper, /Prompt content only/);
  assert.match(wrapper, /Simplified Chinese prompts only/);
  assert.equal(skillInputs([compiler])[1].name, "writer");
});

test("catalog preserves same-name sources, disabled state, and excludes other repositories without writing", async (t) => {
  const f = await fixture(t);
  f.client.entries.push({
    name: "writer",
    path: path.join(f.library, "plugin/SKILL.md"),
    scope: "user",
    pluginId: "test-plugin",
    enabled: false,
  });
  f.client.entries.push({
    name: "unrelated",
    path: path.join(f.temp, "another/.agents/skills/no/SKILL.md"),
    scope: "repo",
    enabled: true,
  });
  const state = await f.service.state(f.store, true);
  assert.equal(state.candidates.filter((c) => c.name === "writer").length, 2);
  assert.equal(
    new Set(state.candidates.map((c) => c.candidate_id)).size,
    state.candidates.length,
  );
  assert.equal(
    state.candidates.find((c) => c.source === "plugin").enabled,
    false,
  );
  assert.ok(!state.candidates.some((c) => c.name === "unrelated"));
  assert.equal(
    fs.readFileSync(path.join(f.root, ".agents/skill_registry.md"), "utf8"),
    f.original,
  );
  assert.deepEqual(fs.readdirSync(path.join(f.root, ".agents/skills")), [
    "original",
  ]);
});

test("check is read-only; save snapshots binary/resources/dependencies, preserves original files and routes new tasks", async (t) => {
  const f = await fixture(t),
    source = fs.readFileSync(path.join(f.library, "writer/SKILL.md"));
  const response = await f.call("POST", "/skills/check", f.input);
  assert.equal(response.statusCode, 200);
  const review = response.json();
  assert.equal(review.can_save, true);
  assert.deepEqual(review.reports[0].dependencies, ["helper"]);
  assert.ok(
    !fs.existsSync(path.join(f.root, "deliverables/0_admin/skill-config")),
  );
  const saved = await f.call("PUT", "/skills/settings", {
    ...f.input,
    check_sha256: review.check_sha256,
  });
  assert.equal(saved.statusCode, 200, saved.body);
  const config = registrySkills(f.root),
    chosen = config.find((s) => s.slot === "script.primary"),
    inputs = skillInputs([chosen]);
  assert.equal(
    config.find((s) => s.slot === "shotlist.prompt_compiler").name,
    "original",
  );
  assert.equal(chosen.display_name, "writer");
  assert.equal(inputs.length, 2);
  assert.equal(inputs[1].name, "writer");
  assert.ok(inputs[1].path.startsWith(f.root));
  assert.deepEqual(fs.readFileSync(inputs[1].path), source);
  assert.equal(
    fs.statSync(path.join(path.dirname(inputs[1].path), "scripts/helper.sh")).mode & 0o777,
    0o755,
  );
  assert.deepEqual(
    fs.readFileSync(
      path.join(path.dirname(inputs[1].path), "assets/pixel.bin"),
    ),
    Buffer.from([0, 255, 1, 128, 0]),
  );
  assert.ok(
    fs.existsSync(
      path.join(path.dirname(inputs[1].path), "../helper/SKILL.md"),
    ),
  );
  assert.deepEqual(
    fs.readFileSync(path.join(f.library, "writer/SKILL.md")),
    source,
  );
  assert.equal(
    fs.readFileSync(
      path.join(f.root, saved.json().history, "registry.before.md"),
      "utf8",
    ),
    f.original,
  );
  assert.ok(
    fs
      .readFileSync(path.join(f.root, ".agents/skill_registry.md"), "utf8")
      .endsWith("Keep this documentation unchanged.\n"),
  );
  await startSkill(f.client, f.store, {
    stage: "script",
    instruction: "Draft one short scene.",
    request_key: "new-config-request",
  });
  const injected = f.client.calls
    .find((c) => c.method === "turn/start")
    .params.input.filter((i) => i.type === "skill");
  assert.deepEqual(injected, inputs);
  const reopened = new SkillSettings(f.client);
  assert.equal(
    (await reopened.state(f.store)).stages[0].current.display_name,
    "writer",
  );
  // Global changes cannot silently change the bound project snapshot or its future task input.
  fs.appendFileSync(
    path.join(f.library, "writer/SKILL.md"),
    "\nA global update.",
  );
  assert.deepEqual(fs.readFileSync(skillInputs([chosen])[1].path), source);
});

test("missing resources, disabled skills and forged IDs cannot change the Registry", async (t) => {
  const f = await fixture(t);
  fs.appendFileSync(
    path.join(f.library, "writer/SKILL.md"),
    "\n[Missing](references/not-here.md)\n",
  );
  const review = (await f.service.inspect(f.store, f.input)).public;
  assert.equal(review.can_save, false);
  assert.match(
    review.reports[0].issues.find((i) => i.level === "error").text,
    /not-here/,
  );
  await assert.rejects(
    f.service.save(f.store, { ...f.input, check_sha256: review.check_sha256 }),
    /阻断项/,
  );
  await assert.rejects(
    f.service.inspect(f.store, {
      ...f.input,
      changes: [{ slot: "script.primary", candidate_id: sha("/etc/passwd") }],
    }),
    /发现列表/,
  );
  f.client.entries.find((e) => e.name === "writer").enabled = false;
  assert.equal(
    (await f.service.inspect(f.store, f.input, true)).public.can_save,
    false,
  );
  assert.equal(
    fs.readFileSync(path.join(f.root, ".agents/skill_registry.md"), "utf8"),
    f.original,
  );
});

test("changed source/dependencies, stale configuration and active batches reject saving", async (t) => {
  const f = await fixture(t),
    review = (await f.service.inspect(f.store, f.input)).public;
  fs.appendFileSync(
    path.join(f.library, "writer/references/guide.md"),
    "changed",
  );
  await assert.rejects(
    f.service.save(f.store, { ...f.input, check_sha256: review.check_sha256 }),
    /检查后发生变化/,
  );
  const fresh = (await f.service.inspect(f.store, f.input)).public;
  f.store.put("skill_batch", "active", {
    batch_id: "active",
    items: [{ scene: "scene-001", status: "queued" }],
  });
  await assert.rejects(
    f.service.save(f.store, { ...f.input, check_sha256: fresh.check_sha256 }),
    /未完成/,
  );
  fs.appendFileSync(
    path.join(f.root, ".agents/skill_registry.md"),
    "\nManual update\n",
  );
  await assert.rejects(
    f.service.save(f.store, { ...f.input, check_sha256: fresh.check_sha256 }),
    /配置已变化/,
  );
  assert.ok(
    !fs.existsSync(path.join(f.root, "deliverables/0_admin/skill-config")),
  );
});

test("managed snapshot tampering is rejected at execution, and local project choices reuse exact paths", async (t) => {
  const f = await fixture(t),
    review = (await f.service.inspect(f.store, f.input)).public;
  await f.service.save(f.store, {
    ...f.input,
    check_sha256: review.check_sha256,
  });
  const chosen = registrySkills(f.root)[0];
  const source = skillInputs([chosen])[1].path;
  fs.appendFileSync(source, "\nchanged snapshot\n");
  assert.throws(() => skillInputs([chosen]), /副本已改变/);
  const state = await f.service.state(f.store, true),
    original = state.candidates.find((c) => c.name === "original");
  const restore = {
    expected_sha256: state.registry_sha256,
    changes: [{ slot: "script.primary", candidate_id: original.candidate_id }],
  };
  const report = (await f.service.inspect(f.store, restore)).public;
  await f.service.save(f.store, {
    ...restore,
    check_sha256: report.check_sha256,
  });
  assert.equal(registrySkills(f.root)[0].name, "original");
  assert.equal(
    skillInputs([registrySkills(f.root)[0]])[0].path,
    path.join(f.root, ".agents/skills/original/SKILL.md"),
  );
});
