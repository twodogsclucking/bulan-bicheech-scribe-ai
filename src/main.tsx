
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply font CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian:wght@300;400;500;600;700&display=swap');
`;
document.head.appendChild(styleSheet);

createRoot(document.getElementById("root")!).render(<App />);
