export default function RunsPlaceholder() {
  return (
    <main className="mx-auto max-w-3xl space-y-3 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">任务</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        队列还没接上本地数据库。生成不会从这一页扣费。批准和估价会在任务页里单独确认。
      </p>
    </main>
  );
}
