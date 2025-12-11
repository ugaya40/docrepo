import React, { useMemo } from 'react';
import GithubSlugger from 'github-slugger';
import { useContentStore } from '../../stores/contentStore';
import { useThemeStore } from '../../stores/themeStore';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC = () => {
  const content = useContentStore((s) => s.content);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const toc = useMemo(() => {
    if (!content) return [];

    const slugger = new GithubSlugger();
    const lines = content.split('\n');
    const items: TocItem[] = [];
    let isInCodeBlock = false;

    // Regex for matching headers:
    // ^(#{2,3})\s+(.*)$
    // Captures group 1: ## or ###
    // Captures group 2: Header text
    // We strictly ignore # (h1) and ####+ (h4+) as per plan
    const headerRegex = /^(#{2,3})\s+(.*)$/;

    for (const line of lines) {
      // Simple code block toggle check
      if (line.trim().startsWith('```')) {
        isInCodeBlock = !isInCodeBlock;
        continue;
      }

      if (isInCodeBlock) continue;

      const match = line.match(headerRegex);
      if (match) {
        const level = match[1].length; // 2 or 3
        const text = match[2].trim();
        const id = slugger.slug(text);

        items.push({ id, text, level });
      }
    }

    return items;
  }, [content]);

  if (toc.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Adjust scroll position to account for sticky header or padding if needed
      // Currently just scrolling into view
      element.scrollIntoView({ behavior: 'smooth' });

      // Update URL hash without jumping
      history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <aside
      className={`
        w-0 opacity-0 xl:w-64 xl:opacity-100 xl:p-6 xl:border-l
        transition-all duration-300 ease-in-out
        overflow-y-auto overflow-x-hidden custom-scrollbar
        sticky top-0
        h-full
        shrink-0
        ${isLight ? 'border-slate-200 bg-white/50' : 'border-slate-800 bg-slate-900/50'}
      `}
      style={{
        // Ensure it fits within the viewport height minus header if necessary, 
        // but flexbox layout in MainContent should handle this if configured correctly.
        // If MainContent isn't setting a specific height for the flex container, 
        // 'h-full' here refers to the parent.
      }}
    >
      <h4 className={`text-sm font-semibold mb-3 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
        On this page
      </h4>
      <ul className="space-y-2 text-sm">
        {toc.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`
                block transition-colors duration-200
                hover:underline
                ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-100'}
              `}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};
