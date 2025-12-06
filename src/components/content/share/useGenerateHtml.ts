import { useState } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { useContentStore } from '../../../stores/contentStore';
import { useFileTreeStore } from '../../../stores/fileTreeStore';
import { useRepoContextStore } from '../../../stores/repoContextStore';
import { rehypeEmbedImages } from '../download/rehypeEmbedImages';
import { rehypeMermaid } from '../download/rehypeMermaid';
import { rehypeKatexToSvg } from '../download/rehypeKatexToSvg';
import { createHtmlDocument } from '../download/htmlTemplate';

type GenerateResult = {
  blob: Blob;
  file: File;
  fileName: string;
};

export const useGenerateHtml = () => {
  const content = useContentStore((s) => s.content);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHtml = async (): Promise<GenerateResult | null> => {
    if (isGenerating || !content || !selectedFile || !selectedRepo) return null;
    setIsGenerating(true);

    try {
      const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkAlert)
        .use(remarkEmoji)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeMermaid)
        .use(rehypeKatex)
        .use(rehypeKatexToSvg)
        .use(rehypeHighlight)
        .use(rehypeEmbedImages, {
          filePath: selectedFile.path,
          repoOwner: selectedRepo.owner,
          repoName: selectedRepo.name,
        })
        .use(rehypeStringify)
        .process(content);

      const htmlContent = createHtmlDocument(selectedFile.name, String(file));
      const fileName = selectedFile.name.replace(/\.md$/i, '.html');
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const htmlFile = new File([blob], fileName, { type: 'text/html' });

      return { blob, file: htmlFile, fileName };
    } catch (e) {
      console.error('Failed to generate HTML', e);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateHtml, isGenerating };
};
