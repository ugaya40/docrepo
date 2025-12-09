import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { useThemeStore } from '../../../stores/themeStore';
import { contentRenderSession } from '../../../stores/sessions/contentRenderSession';
import { generateMermaidId, wrapWithMermaidTheme } from '../utils/mermaidUtils';

interface MermaidRendererProps {
  chart: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const [svgs, setSvgs] = useState<{ light: string; dark: string }>({ light: '', dark: '' });
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const renderCharts = async () => {
      if (!chart) return;

      const sessionOperation = contentRenderSession.getContext();
      sessionOperation.incrementPendingRender();
      setSvgs({ light: '', dark: '' });

      try {
        const idLight = generateMermaidId('mermaid-light');
        const lightSrc = wrapWithMermaidTheme(chart, 'default');
        const { svg: rawLight } = await mermaid.render(idLight, lightSrc);
        const lightSvg = processSvg(rawLight);

        const idDark = generateMermaidId('mermaid-dark');
        const darkSrc = wrapWithMermaidTheme(chart, 'dark');
        const { svg: rawDark } = await mermaid.render(idDark, darkSrc);
        const darkSvg = processSvg(rawDark);

        setSvgs({ light: lightSvg, dark: darkSvg });
      } catch (error) {
        console.error('Mermaid render error:', error);
        const errorHtml = `<pre class="text-red-400 text-xs p-2 border border-red-900 rounded bg-red-950/30">Mermaid Syntax Error</pre>`;
        setSvgs({ light: errorHtml, dark: errorHtml });
      } finally {
        sessionOperation.decrementPendingRender();
      }
    };

    renderCharts();
  }, [chart]);

  const isLight = theme === 'light';

  return (
    <div className={`my-1 overflow-x-auto p-1 pb-3 rounded-lg text-center mermaid-scroll ${isLight ? '' : 'bg-slate-900/50'}`}>
      {/* Light Theme Version */}
      <div
        className="mermaid-theme-light"
        dangerouslySetInnerHTML={{ __html: svgs.light }}
      />
      {/* Dark Theme Version */}
      <div
        className="mermaid-theme-dark"
        dangerouslySetInnerHTML={{ __html: svgs.dark }}
      />
    </div>
  );
};

function processSvg(svg: string): string {
  const maxWidthMatch = svg.match(/style="[^"]*max-width:\s*([^;\"]+)/);
  const maxWidth = maxWidthMatch ? maxWidthMatch[1].trim() : undefined;
  let fixedSvg = maxWidth ? svg.replace(/width="100%"/, `width="${maxWidth}"`) : svg;
  return fixedSvg.replace(/(<svg[^>]*style=")/, '$1display: inline-block; ');
}