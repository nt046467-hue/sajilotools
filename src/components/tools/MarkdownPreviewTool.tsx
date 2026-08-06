"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Check, Eye, Code2, Columns, Download, Bold, Italic, Link, Heading, List, ListOrdered, Code, Quote, Table } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLE_MD = `# Markdown Preview

## Features
- **Bold text** and *italic text*
- [Links](https://sajilotools.vercel.app)
- Inline \`code\` blocks

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, SajiloTools!");
}
\`\`\`

### Table
| Tool | Category | Status |
|------|----------|--------|
| JSON Formatter | Developer | ✅ |
| Word Counter | Text | ✅ |
| QR Generator | Utility | ✅ |

> **Note:** This is a live preview rendered in real-time.
`;

interface ToolbarAction {
  icon: any;
  label: string;
  prefix: string;
  suffix: string;
  block?: boolean; // true = insert on new line
  placeholder: string;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { icon: Italic, label: "Italic", prefix: "*", suffix: "*", placeholder: "italic text" },
  { icon: Link, label: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
  { icon: Heading, label: "Heading", prefix: "## ", suffix: "", block: true, placeholder: "Heading" },
  { icon: List, label: "Bullet List", prefix: "- ", suffix: "", block: true, placeholder: "List item" },
  { icon: ListOrdered, label: "Numbered List", prefix: "1. ", suffix: "", block: true, placeholder: "List item" },
  { icon: Code, label: "Code Block", prefix: "```\n", suffix: "\n```", block: true, placeholder: "code" },
  { icon: Quote, label: "Blockquote", prefix: "> ", suffix: "", block: true, placeholder: "Blockquote" },
  { icon: Table, label: "Table", prefix: "| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |", suffix: "", block: true, placeholder: "" },
];

export default function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState(SAMPLE_MD);
  const [view, setView] = useState<"split" | "editor" | "preview">("split");
  const [copied, setCopied] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-switch to single-column tab mode on narrow mobile screens
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setView("editor");
    }
  }, []);

  const copyText = useCallback((label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }, []);

  const insertFormatting = useCallback((action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const before = markdown.substring(0, start);
    const after = markdown.substring(end);

    let insertion: string;
    let cursorOffset: number;

    if (selectedText) {
      // Wrap selected text
      insertion = action.prefix + selectedText + action.suffix;
      cursorOffset = start + insertion.length;
    } else {
      // Insert with placeholder
      const text = action.placeholder;
      insertion = action.prefix + text + action.suffix;
      cursorOffset = start + action.prefix.length + text.length;
    }

    // If block-level, ensure we're on a new line
    const needsNewline = action.block && before.length > 0 && !before.endsWith("\n");
    const prefix = needsNewline ? "\n" : "";

    const newMd = before + prefix + insertion + after;
    setMarkdown(newMd);

    // Restore cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      const offset = cursorOffset + prefix.length;
      textarea.setSelectionRange(offset, offset);
    });
  }, [markdown]);

  const getRenderedHtml = useCallback(() => {
    // Create a temporary container with ReactMarkdown and extract HTML
    const container = document.createElement("div");
    const previewEl = document.querySelector("[data-md-preview]");
    return previewEl?.innerHTML || "";
  }, []);

  const copyRenderedHtml = useCallback(() => {
    const html = getRenderedHtml();
    if (html) {
      navigator.clipboard.writeText(html);
      setCopied("html");
      setTimeout(() => setCopied(""), 1500);
    }
  }, [getRenderedHtml]);

  const downloadMd = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown]);

  const downloadHtml = useCallback(() => {
    const html = getRenderedHtml();
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export — SajiloTools</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1.5rem; color: #18181B; line-height: 1.7; }
    h1, h2, h3, h4, h5, h6 { color: #1F2544; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 2px solid #E4E0D8; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; }
    a { color: #F5A623; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #FAFAF8; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; color: #F5A623; }
    pre { background: #1F2544; color: #F4F4F5; padding: 1em; border-radius: 12px; overflow-x: auto; }
    pre code { background: none; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #F5A623; margin: 1em 0; padding: 0.5em 1em; color: #52525B; background: #FAFAF8; border-radius: 0 8px 8px 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #E4E0D8; padding: 0.6em 1em; text-align: left; }
    th { background: #FAFAF8; font-weight: 600; }
    img { max-width: 100%; border-radius: 8px; }
    ul, ol { padding-left: 1.5em; }
    li { margin-bottom: 0.3em; }
    hr { border: none; border-top: 2px solid #E4E0D8; margin: 2em 0; }
    .footer { margin-top: 3em; padding-top: 1em; border-top: 1px solid #E4E0D8; font-size: 0.8em; color: #A1A1AA; text-align: center; }
  </style>
</head>
<body>
  ${html}
  <div class="footer">Exported from SajiloTools Markdown Preview — sajilotools.vercel.app</div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [getRenderedHtml]);

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        {/* View Mode Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
          {[
            { id: "editor" as const, icon: Code2, label: "Editor" },
            { id: "preview" as const, icon: Eye, label: "Preview" },
            { id: "split" as const, icon: Columns, label: "Split" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v.id
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                }`}
            >
              <v.icon size={13} />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => copyText("md", markdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] transition-colors"
          >
            {copied === "md" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            {copied === "md" ? "Copied!" : "Copy MD"}
          </button>

          <button
            onClick={copyRenderedHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] transition-colors"
          >
            {copied === "html" ? <Check size={13} className="text-emerald-500" /> : <Code2 size={13} />}
            {copied === "html" ? "Copied!" : "Copy HTML"}
          </button>

          <button
            onClick={downloadMd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] transition-colors"
          >
            <Download size={13} /> .md
          </button>

          <button
            onClick={downloadHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90 transition-all shadow-sm"
          >
            <Download size={13} /> .html
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      {(view === "editor" || view === "split") && (
        <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => insertFormatting(action)}
              title={action.label}
              className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#141829] transition-colors"
            >
              <action.icon size={15} />
            </button>
          ))}
        </div>
      )}

      {/* Editor / Preview Grid */}
      <div
        className={`grid gap-4 ${view === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
      >
        {(view === "editor" || view === "split") && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                Markdown Code
              </span>
              <span className="text-[10px] text-[#A1A1AA] font-mono">
                {markdown.length} chars
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your markdown content here..."
              className="w-full h-[320px] sm:h-[480px] p-3.5 sm:p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs sm:text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none font-mono leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        {(view === "preview" || view === "split") && (
          <div className="space-y-1.5">
            <div className="px-1">
              <span className="text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                Rendered HTML Preview
              </span>
            </div>
            <div
              data-md-preview
              className="h-[320px] sm:h-[480px] overflow-y-auto overflow-x-auto p-4 sm:p-5 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] prose prose-xs sm:prose-sm dark:prose-invert max-w-none prose-headings:text-[#18181B] dark:prose-headings:text-[#F4F4F5] prose-a:text-[#F5A623] prose-code:text-[#F5A623] prose-code:bg-[#FAFAF8] dark:prose-code:bg-[#1E2338] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#1F2544] dark:prose-pre:bg-[#0C0F1E] prose-pre:rounded-xl"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
