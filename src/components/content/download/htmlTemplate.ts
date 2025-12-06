const exportCss = `
/* Reset & Base */
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.75;
  color: #374151;
  background-color: #ffffff;
}

/* Container */
.markdown-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 767px) {
  .markdown-body { padding: 1rem; }
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  color: #111827;
  line-height: 1.25;
  font-weight: 600;
}
h1 { font-size: 2em; margin-top: 0; margin-bottom: 0.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
h3 { font-size: 1.25em; margin-top: 1.5em; margin-bottom: 0.5em; }
h4 { font-size: 1em; margin-top: 1.5em; margin-bottom: 0.5em; }
h5 { font-size: 0.875em; margin-top: 1.5em; margin-bottom: 0.5em; }
h6 { font-size: 0.85em; margin-top: 1.5em; margin-bottom: 0.5em; color: #6b7280; }

p { margin: 1.25em 0; }

a { color: oklch(67.3% 0.182 276.935); text-decoration: underline; font-weight: 500; }
a:hover { color: oklch(75% 0.182 276.935); }

strong { color: #111827; font-weight: 600; }

/* Lists */
ul, ol {
  margin: 1em 0;
  padding-left: 1.625em;
  list-style-position: outside;
}
ul { list-style-type: disc; }
ol { list-style-type: decimal; }
ul > li::marker { color: oklch(0.872 0.01 258.338); }
ol > li::marker { color: oklch(0.551 0.027 264.364); }
li { margin: 0.25em 0; padding-left: 0.375em; }
li > ul, li > ol { margin: 0.25em 0; }

/* Task Lists */
input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #94a3b8;
  border-radius: 3px;
  background: transparent;
  margin-right: 0.5em;
  vertical-align: middle;
  cursor: default;
}
input[type="checkbox"]:checked {
  background: #4f46e5;
  border-color: #4f46e5;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' fill='none' d='M3 8l3.5 3.5L13 5'/%3E%3C/svg%3E");
}

/* Blockquote */
blockquote {
  margin: 1.6em 0;
  padding-left: 1em;
  border-left: 0.25rem solid #e5e7eb;
  color: #111827;
  font-style: italic;
  font-weight: 500;
}
blockquote p:first-child { margin-top: 0; }
blockquote p:last-child { margin-bottom: 0; }
blockquote p::before { content: '"'; }
blockquote p::after { content: '"'; }

/* Code */
code {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 1em;
  color: #111827;
  background: rgba(129, 139, 152, 0.12);
  padding: 0.2em 0.4em;
  border-radius: 6px;
}
pre code {
  background: none;
  padding: 0;
}

pre {
  font-size: 0.875em;
  line-height: 1.7143;
  margin: 1.7143em 0;
  padding: 0.8571em 1.1429em;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
  font-weight: 400;
  color: inherit;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 2em 0;
  font-size: 0.875em;
  line-height: 1.7143;
}

th, td {
  padding: 0.5714em 0.8571em;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: top;
}

th {
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #d1d5db;
}

thead th { padding-bottom: 0.5714em; }
tbody tr:last-child td { border-bottom: none; }

/* Images */
img { display: block; max-width: 100%; height: auto; margin: 1em 0; }

/* Horizontal Rule */
hr {
  margin: 3em 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

/* GitHub Alerts */
.markdown-alert {
  border-left: 4px solid;
  border-radius: 0 0.5rem 0.5rem 0;
  padding: 0.75rem 1rem;
  margin: 1.25em 0;
  background: #f8fafc;
}

.markdown-alert-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.markdown-alert-title svg { fill: currentColor; width: 1rem; height: 1rem; }

.markdown-alert-note { border-color: #3b82f6; }
.markdown-alert-note .markdown-alert-title { color: #2563eb; }

.markdown-alert-tip { border-color: #10b981; }
.markdown-alert-tip .markdown-alert-title { color: #059669; }

.markdown-alert-important { border-color: #a855f7; }
.markdown-alert-important .markdown-alert-title { color: #9333ea; }

.markdown-alert-warning { border-color: #f59e0b; }
.markdown-alert-warning .markdown-alert-title { color: #d97706; }

.markdown-alert-caution { border-color: #ef4444; }
.markdown-alert-caution .markdown-alert-title { color: #dc2626; }

/* Syntax Highlighting (Light Theme) */
.hljs { color: #1f2937; }
.hljs-comment, .hljs-quote { color: #6b7280; font-style: italic; }
.hljs-keyword, .hljs-selector-tag { color: rgb(215, 58, 73); }
.hljs-attr { color: #059669; }
.hljs-string { color: rgb(3, 47, 98)}
.hljs-number, .hljs-literal { color: #2563eb; }
.hljs-variable, .hljs-template-variable { color: #dc2626; }
.hljs-title, .hljs-section { color: rgb(111, 66, 193); }
.hljs-type, .hljs-built_in { color: rgb(227, 98, 9); }
.hljs-name, .hljs-selector-class { color: #7c3aed; }
.hljs-attribute { color: rgb(0, 92, 197); }
.hljs-symbol, .hljs-bullet { color: #059669; }
.hljs-addition { color: #059669; background-color: #dcfce7; }
.hljs-deletion { color: #dc2626; background-color: #fee2e2; }

/* Print Styles */
@media print {
  body { background: white; }
  .markdown-body { max-width: none; padding: 0; }
  pre { white-space: pre-wrap; word-wrap: break-word; }
  a { color: #111827; }
  h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
  pre, blockquote, table, img { page-break-inside: avoid; }
}
`;

export const createHtmlDocument = (title: string, content: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${exportCss}</style>
</head>
<body class="markdown-body">
  ${content}
</body>
</html>`;
};
