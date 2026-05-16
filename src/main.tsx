import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error("Global Error Caught:", event.error);
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.right = '0';
  div.style.backgroundColor = 'red';
  div.style.color = 'white';
  div.style.padding = '20px';
  div.style.zIndex = '9999';
  div.textContent = `Uncaught Error: ${event.error?.message || event.message}\n${event.error?.stack || ''}`;
  document.body.appendChild(div);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.right = '0';
  div.style.backgroundColor = 'orange';
  div.style.color = 'white';
  div.style.padding = '20px';
  div.style.zIndex = '9999';
  div.textContent = `Unhandled Promise Rejection: ${event.reason?.message || event.reason}\n${event.reason?.stack || ''}`;
  document.body.appendChild(div);
});

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (e: any) {
  console.error("Error rendering App:", e);
  const div = document.getElementById('root');
  if (div) {
    div.innerHTML = `<div style="color: red; padding: 20px;">Render Error: ${e.message}<br/>${e.stack}</div>`;
  }
}
