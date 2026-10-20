import { createApp } from "./app.mjs";
const { app } = await createApp();
await app.listen({ host: "127.0.0.1", port: Number(process.env.PORT || 4310) });
console.log(`本地影视工作台 http://127.0.0.1:${app.server.address().port}`);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
