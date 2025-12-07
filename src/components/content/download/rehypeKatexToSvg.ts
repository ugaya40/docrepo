import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import { toHtml } from 'hast-util-to-html';
import { toSvg } from 'html-to-image';

const KATEX_CSS_URL = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
const KATEX_FONT_BASE = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/fonts/';

let katexCssCache: string | null = null;

const getKatexCss = async (): Promise<string> => {
  if (katexCssCache) return katexCssCache;
  const res = await fetch(KATEX_CSS_URL);
  let css = await res.text();
  css = css.replace(/url\(fonts\//g, `url(${KATEX_FONT_BASE}`);
  katexCssCache = css;
  return katexCssCache;
};

const renderKatexToSvg = async (katexHtml: string, isBlock: boolean): Promise<string> => {
  const katexCss = await getKatexCss();
  const color = isBlock ? '#0f172a' : '#047857';

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = `
    <style>${katexCss}
    .katex { color: ${color} !important; }
    </style>
    <div id="katex-render-target" style="display: inline-block; padding: 4px; background: white; font-size: 16px;">
      ${katexHtml}
    </div>
  `;
  document.body.appendChild(container);

  // Temporarily suppress CORS errors from html-to-image
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && (
      msg.startsWith('Error while reading CSS rules from') ||
      msg.startsWith('Error inlining remote css file')
    )) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  try {
    const target = container.querySelector('#katex-render-target') as HTMLElement;
    const svg = await toSvg(target, {
      backgroundColor: 'transparent'
    });
    return svg;
  } finally {
    console.error = originalConsoleError;
    document.body.removeChild(container);
  }
};

export const rehypeKatexToSvg = () => {
  return async (tree: Root) => {
    const katexNodes: { node: Element; parent: Element; index: number; isBlock: boolean }[] = [];

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'span' && Array.isArray(node.properties?.className)) {
        const classes = node.properties.className as string[];
        if (classes.includes('katex-display')) {
          if (parent && typeof index === 'number') {
            katexNodes.push({ node, parent: parent as Element, index, isBlock: true });
          }
        } else if (classes.includes('katex')) {
          const parentClasses = (parent as Element)?.properties?.className as string[] | undefined;
          const isBlock = parentClasses?.includes('katex-display') ?? false;
          if (!isBlock && parent && typeof index === 'number') {
            katexNodes.push({ node, parent: parent as Element, index, isBlock: false });
          }
        }
      }
    });

    if (katexNodes.length === 0) return;

    for (const { node, parent, index, isBlock } of katexNodes) {
      try {
        const html = toHtml(node);
        const svgDataUrl = await renderKatexToSvg(html, isBlock);

        const imgNode: Element = {
          type: 'element',
          tagName: 'img',
          properties: {
            src: svgDataUrl,
            alt: 'math formula',
            style: isBlock
              ? 'display: block; max-width: 100%; margin: 0 auto;'
              : 'display: inline-block; vertical-align: middle;',
          },
          children: [],
        };

        if (isBlock) {
          const wrapper: Element = {
            type: 'element',
            tagName: 'div',
            properties: { style: 'text-align: center; margin: 0;' },
            children: [imgNode],
          };
          parent.children[index] = wrapper;
        } else {
          parent.children[index] = imgNode;
        }
      } catch (error) {
        console.error('Failed to render KaTeX to SVG:', error);
      }
    }
  };
};
