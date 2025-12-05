import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

export const rehypeMermaid = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
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

          node.properties = { className: ['mermaid'] };
          node.children = [{ type: 'text', value: mermaidCode }];
        }
      }
    });
  };
};
