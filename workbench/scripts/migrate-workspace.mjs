#!/usr/bin/env node
import net from "node:net";
import { migrateWorkspace, migrationPlan } from "../server/workspace-migration.mjs";

try {
  if (!process.argv.includes("--apply")) {
    const plan = migrationPlan();
    console.log(JSON.stringify(plan.items.map(item => ({
      name: item.project.name, from: item.source, to: item.destination,
    })), null, 2));
    console.log("停止工作台后，使用 --apply 迁移；旧文件会校验并保留备份。");
  } else {
    const listening = await new Promise(resolve => {
      const socket = net.connect({ host: "127.0.0.1", port: Number(process.env.PORT || 4310) });
      socket.setTimeout(1500);
      socket.once("connect", () => { socket.destroy(); resolve(true); });
      socket.once("error", () => resolve(false));
      socket.once("timeout", () => { socket.destroy(); resolve(true); });
    });
    if (listening) throw new Error("本地服务仍在运行，请先停止工作台再迁移");
    const report = migrateWorkspace();
    console.log(JSON.stringify(report, null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
