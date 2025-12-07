import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { useThemeStore } from '../../../stores/themeStore';
import { contentRenderSession } from '../../../stores/sessions/contentRenderSession';

interface MermaidRendererProps {
  chart: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;

      const sessionOperation = contentRenderSession.getContext();

      sessionOperation.incrementPendingRender();
      setSvg('');

      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'light' ? 'default' : 'dark',
        securityLevel: 'loose',
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        },
        suppressErrorRendering: true
      });

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);

        // Preserve original width for horizontal scroll instead of shrinking
        const maxWidthMatch = svg.match(/style="[^"]*max-width:\s*([^;\"]+)/);
        const maxWidth = maxWidthMatch ? maxWidthMatch[1].trim() : undefined;
        let fixedSvg = maxWidth ? svg.replace(/width="100%"/, `width="${maxWidth}"`) : svg;

        // Make SVG inline-block for text-align: center to work
        fixedSvg = fixedSvg.replace(/(<svg[^>]*style=")/, '$1display: inline-block; ');

        setSvg(fixedSvg);
      } catch (error) {
        console.error('Mermaid render error:', error);
        setSvg(`<pre class="text-red-400 text-xs p-2 border border-red-900 rounded bg-red-950/30">Mermaid Syntax Error</pre>`);
      } finally {
        sessionOperation.decrementPendingRender();
      }
    };

    renderChart();
  }, [chart, theme]);

  const isLight = theme === 'light';

  return (
    <div
      className={`my-1 overflow-x-auto p-1 pb-3 rounded-lg text-center mermaid-scroll ${isLight ? '' : 'bg-slate-900/50'}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};