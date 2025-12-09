import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import mermaid from 'mermaid';
import { MERMAID_BASE_CONFIG } from './components/content/utils/mermaidUtils';

// Initialize Mermaid globally once
mermaid.initialize(MERMAID_BASE_CONFIG);

createRoot(document.getElementById('root')!).render(
  <App />
)
