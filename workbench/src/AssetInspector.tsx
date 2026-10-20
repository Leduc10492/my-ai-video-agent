import { useEffect, useState } from "react";
import { Copy, RefreshCw, Save, Upload } from "lucide-react";
import { Button, Field, Input, Select, Textarea, cn } from "./components/ui";
import { api, post, pretty } from "./lib/api";
import { Media, mediaDetails } from "./AssetsPanel";
import { AssetStatus, assetState, assetStates, type AssetState } from "./AssetStatus";

export default function AssetInspector({ asset, takes, base, busy, run, onDirtyChange, onGenerate }: {
  asset: any;
  takes: any[];
  base: string;
  busy: boolean;
  run: (action: () => Promise<any>, message?: string) => Promise<any>;
  onDirtyChange: (dirty: boolean) => void;
  onGenerate: (prompt: string) => void;
}) {
  const snapshot = () => ({ prompt: asset.prompt || "", tag: asset.tag || "", revision: asset.metadata_revision || 0 });
  const [saved, setSaved] = useState(snapshot), [form, setForm] = useState(snapshot);
  const [takeView, setTakeView] = useState(asset.selected_take_id || takes.at(-1)?.take_id || "");
  const dirty = form.prompt !== saved.prompt || form.tag !== saved.tag;
  const stale = (asset.metadata_revision || 0) !== saved.revision;
  const status = assetState(asset, takes.length > 0);
  const viewedTake = takes.find((take) => take.take_id === takeView) || takes.at(-1);
  const isDefault = viewedTake && viewedTake.take_id === asset.selected_take_id;
  useEffect(() => {
    if (!dirty && (asset.metadata_revision || 0) >= saved.revision) {
      const latest = snapshot();
      setSaved(latest);
      setForm(latest);
    }
  }, [asset.prompt, asset.tag, asset.metadata_revision, dirty]);
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const reset = () => { const latest = snapshot(); setSaved(latest); setForm(latest); };
  const save = () => run(async () => {
    const result = await api(`${base}/assets/${encodeURIComponent(asset.asset_name)}`, {
      method: "PATCH",
      body: pretty({
        expected_revision: saved.revision,
        ...(form.prompt !== saved.prompt ? { prompt: form.prompt } : {}),
        ...(form.tag !== saved.tag ? { tag: form.tag } : {}),
      }),
    });
    const latest = { prompt: result.prompt || "", tag: result.tag || "", revision: result.metadata_revision };
    setSaved(latest);
    setForm(latest);
    return result;
  }, "素材详情已保存");
  const changeStatus = (next: AssetState) => run(() => api(`${base}/assets/${encodeURIComponent(asset.asset_name)}`, {
    method: "PATCH",
    body: pretty({ review_status: next, expected_revision: asset.metadata_revision || 0, ...(next === "accepted" ? { selected_take_id: viewedTake?.take_id } : {}) }),
  }), next === "accepted" ? "已接受当前素材，设为后续制作的默认版本" : `已改为${assetStates[next].label}；现有剪辑保持原引用`);
  return (
    <div className="space-y-5 p-4">
      <div className="space-y-2">
        <h3 className="break-words font-medium">{asset.display_name || asset.asset_name}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <AssetStatus status={status} />
          <span className="text-xs text-muted-foreground">{asset.kind === "image" ? "图片" : asset.kind === "video" ? "视频" : "音频"} · {asset.scene || "共享参考"}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="资产状态">
          {(Object.keys(assetStates) as AssetState[]).map((key) => (
            <Button key={key} size="sm" variant="outline" className={cn("gap-1.5 px-2", status === key && assetStates[key].badge)}
              aria-pressed={status === key} disabled={busy || dirty || (key === "accepted" && !viewedTake)}
              onClick={() => changeStatus(key)}>
              <span aria-hidden="true" className={cn("size-2 rounded-full", assetStates[key].dot)} />{assetStates[key].label}
            </Button>
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {dirty ? "先保存或撤销编辑，再调整状态。" : !viewedTake ? "待定：尚待明确或补图。草稿：正在制作。补入素材后可标为已接受。" : "点「已接受」会确认当前图片或版本，并设为后续制作的默认素材。"}
        </p>
      </div>
      {viewedTake ? (
        <div className="space-y-2">
          <div className="aspect-video overflow-hidden rounded-lg bg-muted"><Media base={base} take={viewedTake} /></div>
          <Field label={asset.kind === "image" ? `参考图片（${takes.length} 张）` : `素材版本（${takes.length} 个）`}>
            {takes.length > 1 ? (
              <Select aria-label={asset.kind === "image" ? "查看参考图片" : "查看素材版本"} value={viewedTake.take_id} onChange={(e) => setTakeView(e.target.value)}>
                {takes.map((take, i) => <option key={take.take_id} value={take.take_id}>{take.source?.label || `版本 ${i + 1}`}{take.take_id === asset.selected_take_id ? " · 已接受" : ""}</option>)}
              </Select>
            ) : <p className="text-sm">{viewedTake.source?.label || "已补入素材"}</p>}
          </Field>
          <p className="text-xs text-muted-foreground">{mediaDetails(viewedTake)}{isDefault ? " · 默认素材" : " · 候选素材"}</p>
          {status === "accepted" && !isDefault && <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">正在查看另一张候选素材；点「已接受」可将默认素材切换为这一张。</p>}
          {viewedTake.source?.match_note && <p className="text-xs leading-6 text-muted-foreground">{viewedTake.source.match_note}</p>}
        </div>
      ) : <div className="rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">尚未补入素材</div>}
      <div className="space-y-3 border-t pt-4">
        <Field label="生成提示词" hint="生成新版本时使用。">
          <Textarea aria-label="生成提示词" className="min-h-36 resize-y leading-6" placeholder="在这里填写或粘贴提示词…" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
        </Field>
        {stale && dirty && <p role="alert" className="text-xs text-destructive">素材详情已在别处修改。你的输入仍保留；可先复制提示词，再载入最新内容。</p>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={!dirty || busy} onClick={save}><Save />保存详情</Button>
          <Button size="sm" variant="outline" disabled={!form.prompt} onClick={() => run(async () => { await navigator.clipboard.writeText(form.prompt); return true; }, "提示词已复制")}><Copy />复制</Button>
          {dirty && <Button size="sm" variant="ghost" disabled={busy} onClick={reset}>{stale ? "载入最新内容" : "撤销编辑"}</Button>}
        </div>
        <Button className="w-full" variant="outline" disabled={busy || asset.kind === "audio"} onClick={async () => { if (!dirty || await save()) onGenerate(form.prompt); }}><RefreshCw />{dirty ? "保存并生成新版本…" : "生成新版本…"}</Button>
        <p className="text-xs leading-5 text-muted-foreground">确认模型与用量后提交。</p>
        {asset.kind === "audio" && <p className="text-xs text-muted-foreground">目前可生成图片和视频；音频可通过导入媒体添加版本。</p>}
        {viewedTake && <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">当前图片或版本的原始提示词</summary><p className="mt-2 whitespace-pre-wrap leading-6">{viewedTake.prompt || "这个文件未附带原始提示词。上方可填写后续生成使用的提示词。"}</p></details>}
      </div>
      <details className="border-t pt-4">
        <summary className="cursor-pointer text-sm font-medium">Higgsfield 参考与 Tag</summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs leading-6 text-muted-foreground">将当前素材上传到已连接的 Higgsfield 账户，供生成时选作参考。上传不会自动生成或接受素材。</p>
          {viewedTake && <Button className="w-full" variant="outline" disabled={busy} onClick={() => run(() => post(`${base}/takes/${viewedTake.take_id}/upload`), "Higgsfield 参考已上传并绑定")}><Upload />{viewedTake.external?.media_id ? "核对已上传的参考" : "上传当前素材为参考"}</Button>}
          {viewedTake?.external?.media_id && <p className="text-xs text-emerald-700 dark:text-emerald-300">已上传，可在生成设置中选择此参考。</p>}
          <Field label="平台引用 Tag" hint="只填写平台实际提供的引用标签，原样保留；没有可留空。本地资产编号与上传得到的媒体 ID 都不是这个 Tag。保存 Tag 用于记录，生成时仍需选择已上传的参考素材。">
            <Input aria-label="平台引用 Tag" placeholder="粘贴平台实际提供的 Tag（可留空）" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
          </Field>
          <Button size="sm" variant="outline" disabled={!dirty || busy} onClick={save}>保存详情</Button>
        </div>
      </details>
      <details className="border-t pt-4 text-xs text-muted-foreground">
        <summary className="cursor-pointer">资产说明与文件来源</summary>
        <div className="mt-3 space-y-3">
          <p className="whitespace-pre-wrap leading-6">{asset.description}</p>
          {Array.isArray(asset.scenes) && <p className="leading-6">出现范围：{asset.scenes.join("、")}</p>}
          <p className="break-all">本地资产编号：{asset.asset_name}</p>
          {viewedTake && <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all leading-5">{pretty(viewedTake)}</pre>}
        </div>
      </details>
    </div>
  );
}
