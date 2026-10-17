import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-semibold">没有这个页面</h1>
      <p className="mt-2 text-sm text-muted-foreground">技能、子代理或文件不在当前仓库里。</p>
      <Link href="/?source=example" className="mt-4 inline-block text-sm underline underline-offset-4">
        回到工作台
      </Link>
    </main>
  );
}
