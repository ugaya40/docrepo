import { create } from 'zustand';
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
import { useRawDynamicStore } from '../dynamic/useRawDynamicStore';
import { createDynamicStore } from '../dynamic/createDynamicStore';
import { removeDynamicStore } from '../dynamic/removeDynamicStore';
import { useContentStore } from '../contentStore';
import { useFileTreeStore } from '../fileTreeStore';
import { useRepoContextStore } from '../repoContextStore';
import { rehypeEmbedImages } from '../../components/content/download/rehypeEmbedImages';
import { rehypeMermaid } from '../../components/content/download/rehypeMermaid';
import { createHtmlDocument } from '../../components/content/download/htmlTemplate';

export type HtmlGenerateResult = {
  html: string;
  fileName: string;
  blob: Blob;
  file: File;
};

export type HtmlGenerateState = {
  result: HtmlGenerateResult | null;
  isGenerating: boolean;
};

const initialState: HtmlGenerateState = {
  result: null,
  isGenerating: false,
};

const getSessionKey = (sessionId: number) => `htmlGenerate_${sessionId}`;

type HtmlGenerateSessionStore = {
  sessionId: number;
  getSessionKey: () => string | null;
  nextSession: () => void;
};

const useHtmlGenerateSessionStore = create<HtmlGenerateSessionStore>((set, get) => ({
  sessionId: 0,

  getSessionKey: () => {
    const sessionId = get().sessionId;
    return sessionId > 0 ? getSessionKey(sessionId) : null;
  },

  nextSession: () => {
    const oldSessionId = get().sessionId;

    if (oldSessionId > 0) {
      removeDynamicStore(getSessionKey(oldSessionId));
    }

    const newSessionId = oldSessionId + 1;
    set({ sessionId: newSessionId });
    createDynamicStore(getSessionKey(newSessionId), { ...initialState });
  },
}));

export const useHtmlGenerateSession = () => {
  const sessionKey = useHtmlGenerateSessionStore((s) => s.getSessionKey());

  const state = useRawDynamicStore((s) =>
    sessionKey ? (s.states.get(sessionKey) as HtmlGenerateState | undefined) : undefined
  ) ?? initialState;

  return { state };
};

export const htmlGenerateSession = {
  nextSession: () => useHtmlGenerateSessionStore.getState().nextSession(),

  getContext: () => {
    const sessionKey = useHtmlGenerateSessionStore.getState().getSessionKey();

    const getState = (): HtmlGenerateState => {
      if (!sessionKey) return initialState;
      return (useRawDynamicStore.getState().states.get(sessionKey) as HtmlGenerateState | undefined) ?? initialState;
    };

    const updateState = (updater: (prev: HtmlGenerateState) => HtmlGenerateState) => {
      if (!sessionKey) return;
      useRawDynamicStore.getState().set(sessionKey, updater);
    };

    return {
      getHtml: async (): Promise<HtmlGenerateResult | null> => {
        const currentState = getState();

        if (currentState.result) {
          return currentState.result;
        }

        if (currentState.isGenerating) {
          return null;
        }

        const content = useContentStore.getState().content;
        const selectedFile = useFileTreeStore.getState().selectedFile;
        const selectedRepo = useRepoContextStore.getState().selectedRepo;

        if (!content || !selectedFile || !selectedRepo) {
          return null;
        }

        updateState(prev => ({ ...prev, isGenerating: true }));

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

          const result: HtmlGenerateResult = {
            html: htmlContent,
            fileName,
            blob,
            file: htmlFile,
          };

          updateState(() => ({ result, isGenerating: false }));
          return result;
        } catch (e) {
          console.error('Failed to generate HTML', e);
          updateState(prev => ({ ...prev, isGenerating: false }));
          return null;
        }
      },
    };
  },
};
