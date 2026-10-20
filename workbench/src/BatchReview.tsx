import { Badge } from "./components/ui";
import { pretty } from "./lib/api";

const modelNames: Record<string, string> = {
  seedance_2_5: "Seedance 2.5",
};
const modeNames: Record<string, string> = {
  t2v: "无参考 · 文生视频",
  omni_reference: "多模态参考",
  video_edit: "视频编辑",
  video_extension: "视频延长",
};

export default function BatchReview({ request }: { request: any }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge>{request.items.length} 项待确认</Badge>
        <Badge>结果回收到本机</Badge>
      </div>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {request.items.map((item: any, index: number) => {
          const params = item.params;
          const facts = [
            ["模型", modelNames[params.model] || params.model],
            ["用量方式", params.use_unlim ? "仅使用 Unlim" : "使用 credits"],
            ["生成模式", modeNames[params.mode] || params.mode],
            ["时长", params.duration ? `${params.duration} 秒` : undefined],
            ["画幅 / 分辨率", [params.aspect_ratio, params.resolution].filter(Boolean).join(" / ")],
            ["声音", typeof params.generate_audio === "boolean" ? (params.generate_audio ? "生成声音" : "静音") : undefined],
          ].filter(([, value]) => value);
          const extras = Object.fromEntries(
            Object.entries(params).filter(([key]) => ![
              "model", "use_unlim", "mode", "duration", "aspect_ratio",
              "resolution", "generate_audio", "count", "medias",
            ].includes(key)),
          );
          return (
            <section key={index} className="space-y-4 rounded-lg border p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-all text-sm font-semibold">{item.asset_name}</h3>
                <Badge>{item.kind === "video" ? "视频" : "图片"}</Badge>
                {item.add_take && <Badge>新增 take</Badge>}
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="mb-1 text-xs text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-t pt-4">
                <p className="mb-2 text-xs text-muted-foreground">生成 Prompt</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-7">{item.prompt}</p>
              </div>
              {!!params.medias?.length && (
                <div className="border-t pt-3 text-xs">
                  <p className="mb-2 text-muted-foreground">参考素材</p>
                  {params.medias.map((ref: any, i: number) => (
                    <p key={i} className="break-all leading-6">{ref.role} · {ref.value}</p>
                  ))}
                </div>
              )}
              {!!Object.keys(extras).length && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">其他模型参数</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3">{pretty(extras)}</pre>
                </details>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
