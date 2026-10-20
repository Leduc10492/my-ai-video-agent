import { Node, mergeAttributes, type Editor, type JSONContent } from "@tiptap/core";
import { Plugin, TextSelection } from "@tiptap/pm/state";
import { closeHistory } from "@tiptap/pm/history";
import { paragraphTypes, newBlockId, type ScriptDocument, type ParagraphType } from "../../shared/screenplay.ts";

export const ScriptParagraph = Node.create({
  name: "scriptParagraph", group: "block", content: "inline*",
  addAttributes() {
    return {
      id: { default: null, rendered: false }, kind: { default: "action", rendered: false }, level: { default: 3, rendered: false },
      sceneId: { default: null, rendered: false }, warning: { default: null, rendered: false },
    };
  },
  parseHTML: () => [{ tag: "p[data-script]" }],
  renderHTML({ node, HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes, {
      "data-script": node.attrs.kind, "data-block-id": node.attrs.id,
      "data-warning": node.attrs.warning ? "true" : undefined,
      "data-level": node.attrs.level,
    }), 0];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        if (this.editor.view.composing) return false;
        const { state, view } = this.editor;
        if (state.selection.$from.parent.type.name !== this.name) return false;
        const kind = state.selection.$from.parent.attrs.kind as ParagraphType;
        const next = ({ scene: "action", character: "dialogue", parenthetical: "dialogue", dialogue: "character", transition: "scene", shot: "action" } as Record<string, ParagraphType>)[kind] || kind;
        if (!state.selection.$from.parent.textContent) return changeParagraphType(this.editor, "action");
        const tr = state.tr.deleteSelection();
        const pos = tr.selection.from;
        tr.split(pos, 1, [{ type: state.schema.nodes.scriptParagraph, attrs: { kind: next, id: newBlockId() } }]);
        view.dispatch(tr.scrollIntoView()); return true;
      },
      Tab: () => cycleType(this.editor, 1),
      "Shift-Tab": () => cycleType(this.editor, -1),
      "Mod-Alt-1": () => changeParagraphType(this.editor, "scene"),
      "Mod-Alt-2": () => changeParagraphType(this.editor, "action"),
      "Mod-Alt-3": () => changeParagraphType(this.editor, "character"),
      "Mod-Alt-4": () => changeParagraphType(this.editor, "dialogue"),
      "Mod-Alt-5": () => changeParagraphType(this.editor, "parenthetical"),
      "Mod-Alt-6": () => changeParagraphType(this.editor, "transition"),
      "Mod-Alt-7": () => changeParagraphType(this.editor, "shot"),
      "Escape": () => { (document.activeElement as HTMLElement)?.blur(); return true; },
    };
  },
  addProseMirrorPlugins() {
    return [new Plugin({
      appendTransaction(transactions, _old, state) {
        if (!transactions.some(t => t.docChanged)) return null;
        const used = new Set<string>(); const tr = state.tr;
        state.doc.descendants((node, pos) => {
          if (node.type.name !== "scriptParagraph") return;
          if (!node.attrs.id || used.has(node.attrs.id)) tr.setNodeMarkup(pos, undefined, { ...node.attrs, id: newBlockId(), sceneId: null });
          used.add(node.attrs.id);
        });
        return tr.docChanged ? tr : null;
      },
    })];
  },
});

function cycleType(editor: Editor, direction: number) {
  if (editor.view.composing) return false;
  const types = paragraphTypes.map(p => p.type);
  const current = editor.state.selection.$from.parent.attrs.kind;
  const next = (types.indexOf(current) + direction + types.length) % types.length;
  return changeParagraphType(editor, types[next]);
}

export function changeParagraphType(editor: Editor, kind: ParagraphType) {
  const { state, view } = editor;
  const tr = closeHistory(state.tr);
  const { from, to } = state.selection;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === "scriptParagraph") tr.setNodeMarkup(pos, undefined, {
      ...node.attrs, kind, warning: null, sceneId: kind === "scene" ? node.attrs.sceneId : null,
    });
  });
  view.dispatch(tr.scrollIntoView()); view.focus(); return true;
}

export function toEditorDocument(doc: ScriptDocument): JSONContent {
  return { type: "doc", content: doc.blocks.map(b => ({
    type: "scriptParagraph", attrs: { id: b.id, kind: b.type, level: b.level || 3, sceneId: b.sceneId || null, warning: b.warning || null },
    content: b.text.split("\n").flatMap((line, i) => [
      ...(i ? [{ type: "hardBreak" }] : []), ...(line ? [{ type: "text", text: line }] : []),
    ]),
  })) };
}

export function fromEditor(editor: Editor): ScriptDocument {
  const blocks: ScriptDocument["blocks"] = [];
  editor.state.doc.forEach(node => {
    blocks.push({ id: node.attrs.id, type: node.attrs.kind, level: node.attrs.level,
      sceneId: node.attrs.sceneId, warning: node.attrs.warning,
      text: node.textBetween(0, node.content.size, "", "\n"),
    });
  });
  return { version: 1, blocks };
}

export function replaceDocument(editor: Editor, doc: ScriptDocument, history = true) {
  const newDoc = editor.schema.nodeFromJSON(toEditorDocument(doc));
  const tr = closeHistory(editor.state.tr).replaceWith(0, editor.state.doc.content.size, newDoc.content);
  tr.setMeta("addToHistory", history);
  editor.view.dispatch(tr);
}

export function focusBlock(editor: Editor, id: string) {
  editor.state.doc.forEach((node, pos) => {
    if (node.attrs.id === id) {
      const tr = editor.state.tr.setSelection(TextSelection.create(editor.state.doc, pos + 1)).scrollIntoView();
      editor.view.dispatch(tr); editor.view.focus();
      requestAnimationFrame(() => {
        if (!editor.isDestroyed) (editor.view.nodeDOM(pos) as HTMLElement | null)?.scrollIntoView({ block: "center", inline: "nearest" });
      });
    }
  });
}
