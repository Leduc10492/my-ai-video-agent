/**
 * Mode B stays off. Text stages may later shell out to `codex exec`.
 * This build never spawns it, and generation never reaches this function.
 */
export function codexExecEnabled() {
  return process.env.WORKBENCH_CODEX_EXEC === "1";
}
