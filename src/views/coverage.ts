import { FileDiff } from "../lib/models";

/**
 * Renders Git diffs into an HTML document suitable for a VS Code webview.
 */
export function renderDiffsHtml(files: FileDiff[]): string {
  const body =
    files.length === 0
      ? `<div class="empty">No diff found.</div>`
      : files.map(renderFileBlock).join("\n");

  return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Diff Coverage</title>
      <style>
        :root {
          --ln-bg: #eeeeee;     /* light gray background */
          --ln-fg: #555555;     /* dark gray numbers */
        }

        body {
          font-family: var(--vscode-editor-font-family);
          font-size: 14px;
          line-height: var(--vscode-editor-line-height);
          color: var(--vscode-editor-foreground);
        }

        .file {
          margin: 0 0 32px 0;
        }

        .filename {
          margin: 0 0 6px 0;
          font-weight: 700;
        }

        pre {
          margin: 0;
          white-space: pre; /* preserve spaces (important for padding) */
        }

        .line {
          display: block;
        }

        .ln {
          display: inline-block;
          background: var(--ln-bg);
          color: var(--ln-fg);
          padding: 2px 6px;
        }

        .old-code {
          color: color-mix(
            in srgb,
            var(--vscode-editor-foreground) 60%,
            transparent
          );
        }
        
        .covered {
          background: var(--vscode-diffEditor-insertedLineBackground);
        }

        .not-covered {
          background: var(--vscode-diffEditor-removedLineBackground);
        }

        .new-block {
          margin-top: 1.4em;
        }

        .empty {
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
    ${body}
    </body>
    </html>`;
}

/**
 * Renders a single file block:
 * - Bold filename
 * - Sorted lines with padded line numbers
 */
function renderFileBlock(file: FileDiff): string {
  const sorted = [...file.lines].sort((a, b) => a.number - b.number);

  const maxDigits = sorted.reduce(
    (m, l) => Math.max(m, String(l.number).length),
    1,
  );

  let lastLineNumber: number | null = null;

  const linesHtml = sorted
    .map((l) => {
      const paddedNo = padLeft(String(l.number), maxDigits, " ");
      const safeContent = escapeHtml(l.content);

      let classes: string[] = [];

      if (l.isAdded && l.called !== null) {
        classes.push(l.called > 0 ? "covered" : "not-covered");
      }

      if (!l.isAdded) {
        classes.push("old-code");
      }
      
      if (lastLineNumber && l.number - lastLineNumber > 1) {
        classes.push("new-block")
      }

      lastLineNumber = l.number;

      return `<span class="line ${classes.join(" ")}"><span class="ln">${escapeHtml(paddedNo)}</span>${safeContent}</span>`;
    })
    .join("");

  return `<div class="file">
      <div class="filename">${escapeHtml(file.filename)}</div>
      <pre>${linesHtml}</pre>
    </div>`;
}

/**
 * Left-pads a string to a fixed width using the given char (spaces here).
 * Padding is done on the left per your requirement.
 */
function padLeft(input: string, width: number, ch: string): string {
  if (input.length >= width) return input;
  return ch.repeat(width - input.length) + input;
}

/**
 * Escapes text for safe HTML rendering in a webview.
 */
function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
