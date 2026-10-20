import { createRequire } from "node:module";
import fs from "node:fs";
import postcss from "postcss";
const require = createRequire(import.meta.url),
  fromStudio = createRequire(require.resolve("@twick/studio"));
const css = [
  "@twick/video-editor/dist/video-editor.css",
  "@twick/studio/dist/studio.css",
]
  .map((spec) =>
    fs
      .readFileSync(fromStudio.resolve(spec), "utf8")
      .replace(/@import\s+url\((['"]?)https?:\/\/[^)]*\)\s*;/gi, ""),
  )
  .join("\n");
fs.mkdirSync("src/generated", { recursive: true });
const sheet = postcss.parse(css);
sheet.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes/.test(rule.parent.name))
    return;
  rule.selectors = rule.selectors.map((selector) => {
    const cleaned = selector.replace(
      /(^|\s)(:root|html|body|:host)(?=\b|\s|$|:)/g,
      "$1.twick-shell",
    );
    return cleaned.startsWith(".twick-shell")
      ? cleaned
      : `.twick-shell ${cleaned}`;
  });
});
const overrides = `
.twick-shell { color: #f5f5f5; --color-purple-500:#a3a3a3; --color-purple-600:#737373; --color-purple-400:#d4d4d4; }
.twick-shell .twick-editor-main-container { height:100%; min-height:0; gap:8px; padding:8px; box-sizing:border-box; }
.twick-shell .twick-editor-view-section { height:58%; min-height:240px; flex:0 0 58%; }
.twick-shell .twick-editor-container { flex:1 1 auto; width:0; height:100%; min-width:0; }
.twick-shell .twick-editor-view-section > div:last-child { flex:0 0 240px; max-width:240px; overflow:auto; }
.twick-shell .twick-editor-timeline-section { flex:1 1 auto; min-height:180px; height:auto; background:#171717; }
.twick-shell input, .twick-shell select { color:#e5e5e5; background:#262626; border-color:#525252; }
.twick-shell button { color:inherit; }
`;
fs.writeFileSync(
  "src/generated/twick.css",
  "/* Twick 0.15.31; scoped, remote font imports removed. See THIRD_PARTY.md. */\n" +
    sheet.toString() +
    overrides,
);
