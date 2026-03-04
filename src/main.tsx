// src/main.tsx
// ✅ CRITICAL: react-native-gesture-handler MUST be the absolute first import.
// It installs polyfills that all subsequent RN components depend on.
import 'react-native-gesture-handler';

window.addEventListener('error', (e) => {
  console.error('RUNTIME ERROR:', e.message, e.filename, e.lineno, e.error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background:#1A1E24;color:#E07A5F;padding:32px;font-family:monospace;white-space:pre-wrap;height:100vh;overflow:auto;">
        <h2 style="color:#F4F1EA">RUNTIME ERROR</h2>
        <p><strong>Message:</strong> ${e.message}</p>
        <p><strong>File:</strong> ${e.filename}:${e.lineno}</p>
        <pre style="background:#000;padding:16px;border-radius:8px;margin-top:16px;">${e.error?.stack || 'No stack trace'}</pre>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED PROMISE REJECTION:', e.reason);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background:#1A1E24;color:#E07A5F;padding:32px;font-family:monospace;white-space:pre-wrap;height:100vh;overflow:auto;">
        <h2 style="color:#F4F1EA">UNHANDLED PROMISE REJECTION</h2>
        <pre style="background:#000;padding:16px;border-radius:8px;margin-top:16px;">${e.reason?.stack || String(e.reason)}</pre>
      </div>
    `;
  }
});

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// ✅ DO NOT call enableScreens() — react-native-screens conflicts with
// the JS-based createStackNavigator used for web compatibility.
// enableScreens() is only needed with createNativeStackNavigator.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error(
    'Root element #root not found. Check index.html has <div id="root"></div>.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
