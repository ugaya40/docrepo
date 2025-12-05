import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { useThemeStore } from '../../../stores/themeStore';

interface MermaidRendererProps {
  chart: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [isRendered, setIsRendered] = useState(false);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    setIsRendered(false);
    const renderChart = async () => {
      if (!chart) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'light' ? 'default' : 'dark',
        securityLevel: 'loose',
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        }
      });
      
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid render error:', error);
        setSvg(`<pre class="text-red-400 text-xs p-2 border border-red-900 rounded bg-red-950/30">Mermaid Syntax Error</pre>`);
      } finally {
        setIsRendered(true);
      }
    };

    renderChart();
  }, [chart, theme]);

  const isLight = theme === 'light';

  return (
    <div
      data-rendering={isRendered ? 'complete' : 'pending'}
      className={`flex justify-center my-1 overflow-x-auto p-1 rounded-lg ${isLight ? '' : 'bg-slate-900/50'}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};