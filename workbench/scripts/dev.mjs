import { spawn } from "node:child_process";
const processes = [
  spawn(
    process.execPath,
    [
      ...(process.env.WORKBENCH_WATCH_SERVER === "1" ? ["--watch"] : []),
      "server/index.mjs",
    ],
    {
      stdio: "inherit",
    },
  ),
  spawn("pnpm", ["exec", "vite", "--host", "127.0.0.1"], { stdio: "inherit" }),
];
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    for (const p of processes) p.kill(signal);
    process.exit(0);
  });
for (const p of processes)
  p.on("exit", (code) => {
    if (code) {
      for (const other of processes) other.kill();
      process.exit(code);
    }
  });
