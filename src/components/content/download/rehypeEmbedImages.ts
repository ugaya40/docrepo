import { visit } from 'unist-util-visit';
import type { Root } from 'hast';
import { useFileTreeStore } from '../../../stores/fileTreeStore';
import { githubApi } from '../../../lib/github';
import { resolvePath } from '../renderer/resolvePath';

const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
};

type Options = {
  filePath: string;
  repoOwner: string;
  repoName: string;
};

export const rehypeEmbedImages = (options: Options) => {
  const { filePath, repoOwner, repoName } = options;

  return async (tree: Root) => {
    const promises: Promise<void>[] = [];

    visit(tree, 'element', (node) => {
      if (node.tagName === 'img' && node.properties && typeof node.properties.src === 'string') {
        const src = node.properties.src;

        if (src.startsWith('http') || src.startsWith('data:')) return;

        const promise = async () => {
          try {
            const targetPath = resolvePath(filePath, src);

            const sha = useFileTreeStore.getState().getBlobSha(targetPath);
            if (!sha) return;

            const blobRes = await githubApi.getBlob(repoOwner, repoName, sha);

            const base64Content = blobRes.content.replace(/\n/g, '');
            const mime = getMimeType(targetPath);

            node.properties.src = `data:${mime};base64,${base64Content}`;
          } catch (error) {
            console.error(`Failed to embed image: ${src}`, error);
          }
        };
        promises.push(promise());
      }
    });

    await Promise.all(promises);
  };
};
