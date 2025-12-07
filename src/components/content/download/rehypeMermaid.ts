import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import mermaid from 'mermaid';

const svgToBase64Img = (svg: string): Element => {
  const maxWidthMatch = svg.match(/style="[^"]*max-width:\s*([^;\"]+)/);
  const maxWidth = maxWidthMatch ? maxWidthMatch[1].trim() : undefined;

  let fixedSvg = svg;
  if (maxWidth) {
    fixedSvg = svg.replace(/width="100%"/, `width="${maxWidth}"`);
  }

  const bytes = new TextEncoder().encode(fixedSvg);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  const base64 = btoa(binary);
  return {
    type: 'element',
    tagName: 'img',
    properties: {
      src: `data:image/svg+xml;base64,${base64}`,
      alt: 'mermaid diagram',
      style: maxWidth ? `display: inline-block; max-width: ${maxWidth}; height: auto;` : 'display: inline-block; max-width: 100%; height: auto;',
    },
    children: [],
  };
};

export const rehypeMermaid = () => {
  return async (tree: Root) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      suppressErrorRendering: true
    });

    const nodesToReplace: { parent: Element; index: number; mermaidCode: string }[] = [];

    visit(tree, 'element', (node, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children.length === 1 &&
        (node.children[0] as Element).tagName === 'code'
      ) {
        const codeNode = node.children[0] as Element;
        const className = codeNode.properties?.className as string[] | undefined;

        if (className?.includes('language-mermaid')) {
          const textNode = codeNode.children[0];
          const mermaidCode = textNode && 'value' in textNode ? textNode.value : '';

          if (mermaidCode && parent && typeof index === 'number') {
            nodesToReplace.push({ parent: parent as Element, index, mermaidCode });
          }
        }
      }
    });

    for (const { parent, index, mermaidCode } of nodesToReplace) {
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        const imgNode = svgToBase64Img(svg);

        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: {
            style: 'margin: 1rem 0; overflow-x: auto; padding: 1rem; border-radius: 0.5rem; background-color: #f8fafc; border: 1px solid #e5e7eb; text-align: center;',
          },
          children: [imgNode],
        };

        parent.children[index] = wrapper;
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
      }
    }
  };
};
