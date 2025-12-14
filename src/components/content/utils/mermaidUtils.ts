import type { Mermaid, MermaidConfig } from 'mermaid';


/**
 * Shared base configuration for Mermaid across the application.
 * Theme is controlled via directives (wrapWithMermaidTheme), so we set a default here
 * but it will be overridden per-diagram.
 */
export const MERMAID_BASE_CONFIG: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'loose',
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
  suppressErrorRendering: true,
};

/**
 * Wraps the Mermaid diagram source with an initialization directive to force a specific theme.
 * This is robust for v10+ and ensures Class Diagrams etc. respect the theme.
 * 
 * @param src The original Mermaid source code
 * @param theme The theme name to apply ('default' for light, 'dark' for dark)
 */
export const wrapWithMermaidTheme = (src: string, theme: 'default' | 'dark'): string => {
  return `%%{init:{'theme':'${theme}'}}%%\n${src}`;
};

/**
 * Generates a random ID for Mermaid containers.
 * @param prefix Optional prefix for the ID
 */
export const generateMermaidId = (prefix: string = 'mermaid'): string => {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
};

let mermaidPromise: Promise<Mermaid> | null = null;

/**
 * Lazy loads and initializes mermaid.
 * Ensures initialization happens only once.
 */
export const getMermaid = (): Promise<Mermaid> => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      const mermaidInstance = m.default;
      mermaidInstance.initialize(MERMAID_BASE_CONFIG);
      return mermaidInstance;
    });
  }
  return mermaidPromise;
};
