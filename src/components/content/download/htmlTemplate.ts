export const createHtmlDocument = (title: string, content: string, theme: 'light' | 'dark' = 'dark'): string => {
  const isDark = theme === 'dark';
  const hljsStyle = isDark ? 'github-dark.min.css' : 'github.min.css';
  const mdStyle = isDark ? 'github-markdown-dark.min.css' : 'github-markdown-light.min.css';
  const bgColor = isDark ? '#0d1117' : '#ffffff';
  const alertBg = isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.8)';
  const mermaidTheme = isDark ? 'dark' : 'default';

  const alertColors = isDark
    ? { note: '#60a5fa', tip: '#34d399', important: '#c084fc', warning: '#fbbf24', caution: '#f87171' }
    : { note: '#2563eb', tip: '#059669', important: '#9333ea', warning: '#d97706', caution: '#dc2626' };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${hljsStyle}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/${mdStyle}">
  <style>
    body { background-color: ${bgColor}; margin: 0; padding: 0; min-height: 100vh; }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    @media (max-width: 767px) { .markdown-body { padding: 15px; } }
    .markdown-body img { max-width: 100%; background-color: transparent; }
    /* Mermaid Styles */
    .mermaid { text-align: center; background: transparent; }
    /* GitHub Alerts Styles */
    .markdown-alert { border-left: 4px solid; border-radius: 0 0.5rem 0.5rem 0; padding: 0.75rem 1rem; margin: 1rem 0; background: ${alertBg}; }
    .markdown-alert-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem; }
    .markdown-alert-title svg { fill: currentColor; width: 1rem; height: 1rem; }
    .markdown-alert-note { border-color: #3b82f6; }
    .markdown-alert-note .markdown-alert-title { color: ${alertColors.note}; }
    .markdown-alert-tip { border-color: #10b981; }
    .markdown-alert-tip .markdown-alert-title { color: ${alertColors.tip}; }
    .markdown-alert-important { border-color: #a855f7; }
    .markdown-alert-important .markdown-alert-title { color: ${alertColors.important}; }
    .markdown-alert-warning { border-color: #f59e0b; }
    .markdown-alert-warning .markdown-alert-title { color: ${alertColors.warning}; }
    .markdown-alert-caution { border-color: #ef4444; }
    .markdown-alert-caution .markdown-alert-title { color: ${alertColors.caution}; }
  </style>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: false, theme: '${mermaidTheme}' });
    await mermaid.run();
    window.parent.postMessage('mermaid-ready', '*');
  </script>
</head>
<body class="markdown-body">
  ${content}
</body>
</html>`;
};
