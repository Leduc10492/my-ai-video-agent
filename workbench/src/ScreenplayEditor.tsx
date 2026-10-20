import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import HardBreak from "@tiptap/extension-hard-break";
import { UndoRedo } from "@tiptap/extensions";
import { Fragment, Slice } from "@tiptap/pm/model";
import { Download, Upload, Undo2, Redo2, MessageSquare, Send, X, Loader2, Check, AlertCircle } from "lucide-react";
import { Button, Dialog, Badge, Textarea, Placeholder } from "./components/ui";
import { api, post, uid } from "./lib/api";
import { ScriptParagraph, changeParagraphType, toEditorDocument, fromEditor, replaceDocument, focusBlock } from "./lib/screenplay-editor";
import { importMarkdown, exportMarkdown, paragraphTypes, applyProposal, validateDocument, type ScriptDocument, type EditProposal } from "../shared/screenplay";

type EditEntry = { id: string; instruction: string; status: string; baseline?: ScriptDocument; before?: Record<string, string>; result?: EditProposal; error?: string };
type Draft = { document: ScriptDocument; baselineHash: string | null; applied: string[]; filename: string; at: string };
export default function ScreenplayEditor({ base, body, baselineHash, sceneHeading, onChange, onRecoverHash, onBindings, savedBody, savedHash, sceneMap }: {
  base: string; body: string; savedBody: string; baselineHash: string | null;
  savedHash: string | null; sceneMap: { header: string; label: string }[];
  sceneHeading?: string; onChange: (value: string) => void;
  onRecoverHash: (value: string | null) => void;
  onBindings: (value: Record<number, string>) => void;
}) {
  const [tick, setTick] = useState(0), [chat, setChat] = useState(false), [instruction, setInstruction] = useState("");
  const [entries, setEntries] = useState<EditEntry[]>([]), [applied, setApplied] = useState<string[]>([]);
  const [pending, setPending] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<ScriptDocument | null>(null), [filename, setFilename] = useState("剧本.md");
  const [importName, setImportName] = useState(""), [selectedOnly, setSelectedOnly] = useState(true);
  const [recovered, setRecovered] = useState(false), [draftError, setDraftError] = useState("");
  const storageKey = `film-screenplay-v1:${base}`;
  const fileInput = useRef<HTMLInputElement>(null), lastEmitted = useRef(body), restored = useRef(false);
  const callback = useRef(onChange); callback.current = onChange;
  const hashRef = useRef(baselineHash); hashRef.current = baselineHash;
  const appliedRef = useRef(applied); appliedRef.current = applied;
  const nameRef = useRef(filename); nameRef.current = filename;
  const importWithBindings = (source: string) => {
    const doc = importMarkdown(source), used = new Set<string>();
    for (const b of doc.blocks) if (b.type === "scene") {
      const match = sceneMap.find(s => !used.has(s.label) && s.header.replace(/^#{1,6}\s+/, "").replace(/^场景[：:] ?/, "") === b.text.split("\n")[0]);
      if (match) { b.sceneId = match.label; used.add(match.label); }
    }
    return doc;
  };
  const initial = useRef<ScriptDocument | null>(null);
  if (!initial.current) initial.current = importWithBindings(body);
  const persist = (document: ScriptDocument) => {
    try {
      const draft: Draft = { document, baselineHash: hashRef.current, applied: appliedRef.current, filename: nameRef.current, at: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(draft)); setDraftError("");
    } catch { setDraftError("浏览器草稿保存失败，请保存新版本或导出 Markdown。"); }
  };
  const editor = useEditor({
    extensions: [Document, Text, HardBreak, UndoRedo, ScriptParagraph],
    content: toEditorDocument(initial.current),
    editorProps: {
      attributes: { class: "screenplay-document", role: "textbox", "aria-label": "可编辑剧本", "aria-multiline": "true", spellcheck: "false" },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain");
        if (text === undefined) return false;
        // Literal text stays text: pasted HTML cannot create an untyped document.
        event.preventDefault();
        const { schema, tr } = view.state;
        const content = text.replace(/\r\n?/g, "\n").split("\n").flatMap((s, i) => [
          ...(i ? [schema.nodes.hardBreak.create()] : []), ...(s ? [schema.text(s)] : []),
        ]);
        view.dispatch(tr.replaceSelection(new Slice(Fragment.fromArray(content), 0, 0)).scrollIntoView());
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const document = fromEditor(editor), markdown = exportMarkdown(document);
      if (markdown !== lastEmitted.current) { lastEmitted.current = markdown; callback.current(markdown); }
      persist(document); setTick(t => t + 1);
    },
    onSelectionUpdate: () => setTick(t => t + 1),
  });
  // External saved versions and imports replace the view only when the parent actually changes text.
  useEffect(() => {
    if (!editor || body === lastEmitted.current) return;
    lastEmitted.current = body;
    editor.commands.setContent(toEditorDocument(importWithBindings(body)), { emitUpdate: false });
    setTick(t => t + 1);
  }, [body, editor]);
  useEffect(() => {
    if (!editor || restored.current) return;
    restored.current = true;
    try {
      const text = localStorage.getItem(storageKey);
      if (text) {
        const draft = JSON.parse(text) as Draft; validateDocument(draft.document);
        setFilename(draft.filename || "剧本.md"); setApplied(draft.applied || []);
        const markdown = exportMarkdown(draft.document);
        // Keep stable paragraph IDs even when a draft has already been saved.
        editor.commands.setContent(toEditorDocument(draft.document), { emitUpdate: false });
        if (markdown !== exportMarkdown(importMarkdown(savedBody))) {
          lastEmitted.current = markdown; callback.current(markdown);
          hashRef.current = draft.baselineHash;
          onRecoverHash(draft.baselineHash); setRecovered(true); setTick(t => t + 1);
        } else { hashRef.current = savedHash; onRecoverHash(savedHash); setTick(t => t + 1); }
      }
    } catch { setDraftError("发现无法读取的浏览器草稿；当前已载入项目文件，请先导出备份再继续。"); }
  }, [editor]);
  useEffect(() => {
    if (!editor) return;
    persist(fromEditor(editor));
  }, [baselineHash, applied]);
  useEffect(() => {
    if (!editor) return;
    const tr = editor.state.tr;
    const used = new Set(fromEditor(editor).blocks.map(b => b.sceneId).filter(Boolean));
    editor.state.doc.forEach((node, pos) => {
      if (node.attrs.kind !== "scene" || node.attrs.sceneId) return;
      const match = sceneMap.find(s => !used.has(s.label) && s.header.replace(/^#{1,6}\s+/, "").replace(/^场景[：:] ?/, "") === node.textContent);
      if (match) { used.add(match.label); tr.setNodeMarkup(pos, undefined, { ...node.attrs, sceneId: match.label }); }
    });
    if (tr.docChanged) editor.view.dispatch(tr.setMeta("addToHistory", false));
  }, [editor, savedHash]);
  useEffect(() => {
    if (!editor || !sceneHeading) return;
    const heading = sceneHeading.replace(/^#{1,6}\s+/, "").replace(/^场景[：:]\s*/, "");
    const block = fromEditor(editor).blocks.find(b => b.type === "scene" && b.text === heading);
    if (block) focusBlock(editor, block.id);
  }, [editor, sceneHeading]);
  useEffect(() => {
    if (!editor) return;
    const bindings: Record<number, string> = {};
    fromEditor(editor).blocks.filter(b => b.type === "scene").forEach((b, i) => { if (b.sceneId) bindings[i + 1] = b.sceneId; });
    onBindings(bindings);
  }, [editor, tick]);
  const refreshEdits = async () => setEntries(await api(`${base}/script/edits`));
  useEffect(() => {
    void refreshEdits().catch(e => setError(e.message));
    const timer = window.setInterval(() => void refreshEdits().catch(() => {}), 2000);
    return () => window.clearInterval(timer);
  }, [base]);
  const active = entries.some(e => ["starting", "running"].includes(e.status));
  const send = async () => {
    if (!editor || !instruction.trim() || pending || active) return;
    setPending(true); setError("");
    try {
      const doc = fromEditor(editor);
      const scope: string[] = [];
      const selection = editor.state.selection;
      if (selectedOnly && !selection.empty) editor.state.doc.nodesBetween(selection.from, selection.to, node => { if (node.type.name === "scriptParagraph") scope.push(node.attrs.id); });
      await post(`${base}/script/edits`, { document: doc, scope, instruction, request_key: uid() });
      setInstruction(""); await refreshEdits();
    } catch (e) { setError((e as Error).message); }
    finally { setPending(false); }
  };
  const apply = async (entry: EditEntry) => {
    if (!editor) return;
    setError("");
    try {
      const full = await api<EditEntry>(`${base}/script/edits/${entry.id}`);
      const doc = applyProposal(fromEditor(editor), full.baseline!, full.result!);
      replaceDocument(editor, doc);
      const first = full.result?.edits.find(e => e.replacement.length);
      if (first) focusBlock(editor, first.id);
      setApplied(v => [...v, entry.id]); setNotice("修改已应用到草稿，可撤销；保存新版本后写入项目。");
    } catch (e) { setError((e as Error).message); }
  };
  const exportFile = () => {
    if (!editor) return;
    const text = exportMarkdown(fromEditor(editor));
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = filename.replace(/\.[^.]+$/, "") + "_编辑稿.md";
    a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    setNotice("已发起草稿下载");
  };
  if (!editor) return null;
  const screenplay = fromEditor(editor), warnings = screenplay.blocks.filter(b => b.warning);
  const isApplied = (entry: EditEntry) => applied.includes(entry.id) && entry.result?.edits.every(edit => {
    const pos = screenplay.blocks.findIndex(b => b.id === edit.id);
    return edit.replacement.length ? pos >= 0 && edit.replacement.every((r, i) => screenplay.blocks[pos + i]?.text === r.text && screenplay.blocks[pos + i]?.type === r.type) : pos < 0;
  });
  const hasTargets = (entry: EditEntry) => entry.result?.edits.every(edit => screenplay.blocks.some(b => b.id === edit.id));
  const selectedType = editor.state.selection.$from.parent.attrs.kind;
  return <div className="screenplay-workspace flex min-h-0 flex-1 flex-col">
    <div className="panel-toolbar flex shrink-0 flex-wrap items-center gap-2 border-b px-6 py-2">
      <span className="mr-auto text-xs text-muted-foreground">{screenplay.blocks.filter(b => b.type === "scene").length} 场 · {screenplay.blocks.length} 段</span>
      <Button size="sm" variant="ghost" onClick={() => { const first = screenplay.blocks.find(b => b.type === "scene"); if (first) focusBlock(editor, first.id); }}>跳到正文</Button>
      <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}><Upload />导入 MD</Button>
      <Button size="sm" variant="outline" onClick={exportFile}><Download />导出 Markdown</Button>
      <Button size="sm" variant={chat ? "default" : "outline"} aria-pressed={chat} onClick={() => setChat(v => !v)}><MessageSquare />对话修改</Button>
      <input ref={fileInput} type="file" accept=".md,.txt,text/markdown,text/plain" className="hidden" aria-label="导入 Markdown 文件" onChange={async e => {
        const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
        if (f.size > 2 * 1024 * 1024) { setError("请导入小于 2 MB 的剧本。"); return; }
        try { const doc = importWithBindings(await f.text()); validateDocument(doc); setPreview(doc); setImportName(f.name); } catch (err) { setError((err as Error).message); }
      }} />
    </div>
    {(recovered || notice || draftError || error) && <div className="border-b px-6 py-2 text-xs leading-6" role="status">
      {recovered && <span className="mr-3">已恢复本机草稿。<button className="underline" onClick={() => {
        localStorage.setItem(storageKey + ":recovery", JSON.stringify({ document: fromEditor(editor), baselineHash: hashRef.current }));
        hashRef.current = savedHash; onRecoverHash(savedHash);
        replaceDocument(editor, importWithBindings(savedBody)); setRecovered(false);
      }}>使用项目已保存稿</button></span>}
      {notice && <span>{notice}</span>}{(draftError || error) && <p role="alert" className="text-destructive">{draftError || error}</p>}
    </div>}
    <div className="screenplay-body relative flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        {warnings.length > 0 && <div className="flex items-center gap-2 border-b bg-amber-50 px-6 py-2 text-xs text-amber-950 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle size={14} className="shrink-0" /><span title="引用文字保留原文，请确认段落类型是否为对白。">{warnings.length} 处引用待确认</span>
          <button className="ml-auto shrink-0 underline" onClick={() => focusBlock(editor, warnings[0].id)}>定位第一处</button>
        </div>}
        <div className="screenplay-scroll min-h-0 flex-1 overflow-auto bg-muted/30 px-4 py-7 md:px-8">
          <div className="screenplay-paper"><EditorContent editor={editor} /></div>
        </div>
        <div className="screenplay-toolbar" role="toolbar" aria-label="剧本段落类型">
          <Button variant="ghost" size="icon" title="撤销（⌘Z）" aria-label="撤销剧本修改" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></Button>
          <Button variant="ghost" size="icon" title="重做（⌘⇧Z）" aria-label="重做剧本修改" onMouseDown={e => e.preventDefault()} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></Button>
          <span className="mx-1 h-6 border-l" />
          {paragraphTypes.map((p, i) => <button key={p.type} type="button" aria-label={`${p.label} ${p.short}`} aria-pressed={selectedType === p.type} title={`设为${p.label} · ⌘⌥${i + 1}`} className="screenplay-type" onMouseDown={e => e.preventDefault()} onClick={() => changeParagraphType(editor, p.type)}><span>{p.label}</span></button>)}
        </div>
      </div>
      {chat && <aside className="screenplay-chat flex w-80 shrink-0 flex-col border-l bg-background xl:w-96" aria-label="剧本修改对话">
        <div className="flex shrink-0 items-center border-b px-4 py-2"><p className="mr-auto text-sm font-medium">对话修改</p><Button variant="ghost" size="icon" aria-label="收起对话" onClick={() => setChat(false)}><X /></Button></div>
        <div className="min-h-0 flex-1 space-y-5 overflow-auto p-4" aria-live="polite">
          {!entries.length && <div className="flex flex-col items-center py-5 text-center"><Placeholder kind="project" compact /><p className="mt-3 text-xs leading-6 text-muted-foreground">描述修改要求，或先选中一段正文。</p></div>}
          {entries.map(entry => <article key={entry.id} className="space-y-3 text-sm">
            <p className="ml-4 whitespace-pre-wrap rounded-2xl bg-muted px-4 py-3 leading-6">{entry.instruction}</p>
            {["starting", "running"].includes(entry.status) ? <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" />正在修改…<button className="ml-auto underline" onClick={async () => { try { await post(`${base}/script/edits/${entry.id}/cancel`); await refreshEdits(); } catch (e) { setError((e as Error).message); } }}>取消</button></div> : <>
              <p className="whitespace-pre-wrap leading-6">{entry.error || entry.result?.summary || (entry.status === "cancelled" ? "已取消，草稿未变。" : "等待结果")}</p>
              {entry.result?.edits.map(edit => <div key={edit.id} className="rounded-xl border bg-muted/20 p-3 text-xs leading-6"><p className="mb-1 text-muted-foreground">修改前</p><p className="mb-3 whitespace-pre-wrap border-l-2 border-red-300 pl-2">{entry.before?.[edit.id]}</p><p className="mb-1 text-muted-foreground">修改后</p>{edit.replacement.length ? edit.replacement.map((b, i) => <p key={i} className="whitespace-pre-wrap border-l-2 border-emerald-300 pl-2"><span className="mr-2 text-muted-foreground">{paragraphTypes.find(p => p.type === b.type)?.label || "原文"}</span>{b.text}</p>) : <p>删除这一段</p>}</div>)}
              {!!entry.result?.edits.length && (isApplied(entry) ? <Badge><Check size={12} className="mr-1" />已应用 · 可用撤销恢复</Badge> : hasTargets(entry) ? <Button size="sm" variant="outline" onClick={() => void apply(entry)}>应用这次修改</Button> : <p className="text-xs text-muted-foreground">这次修改对应旧草稿。可基于当前内容重新发送要求。</p>)}
            </>}
          </article>)}
        </div>
        <div className="shrink-0 space-y-3 border-t p-4">
          <Textarea aria-label="对话修改要求" placeholder="告诉我想改哪里、怎么改…" className="min-h-24 resize-none" value={instruction} onChange={e => setInstruction(e.target.value)} />
          <div className="flex items-center gap-2"><label className="mr-auto flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={selectedOnly} onChange={e => setSelectedOnly(e.target.checked)} />有选区时仅修改选中段落</label><Button size="sm" disabled={pending || active || !instruction.trim()} onClick={() => void send()}><Send size={14} />发送</Button></div>
        </div>
      </aside>}
    </div>
    <Dialog wide open={!!preview} onOpenChange={o => !o && setPreview(null)} title="导入剧本" description="识别段落类型，保留备注、表格与无法确定的文字。应用后仍可撤销。">
      {preview && <><div className="mb-4 flex flex-wrap gap-2"><Badge>{importName}</Badge><Badge>{preview.blocks.filter(b => b.type === "scene").length} 场</Badge><Badge>{preview.blocks.length} 段</Badge><Badge>{preview.blocks.filter(b => b.warning).length} 处待确认</Badge></div><div className="max-h-72 overflow-auto rounded-xl border p-4 text-sm leading-7">{preview.blocks.slice(0,20).map(b => <p key={b.id} className="mb-2 whitespace-pre-wrap"><span className="mr-3 text-xs text-muted-foreground">{paragraphTypes.find(p => p.type === b.type)?.label || "原文"}</span>{b.text}</p>)}</div><Button className="mt-5" onClick={() => {
        setFilename(importName); nameRef.current = importName;
        replaceDocument(editor, preview); setPreview(null); setRecovered(false); setNotice("已导入草稿，原始文件保留。可在底部切换段落类型。");
        const first = preview.blocks.find(b => b.type === "scene"); if (first) focusBlock(editor, first.id);
      }}>导入到编辑器</Button></>}
    </Dialog>
  </div>;
}
