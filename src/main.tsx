import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const showErrorCapsule = (message: string, stack: string = '', type: 'error' | 'rejection') => {
  const containerId = 'error-handler-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.setAttribute('style', 'position: fixed; bottom: 20px; right: 20px; z-index: 999999; display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 10px; pointer-events: none;');
    document.body.appendChild(container);
  }

  const capsule = document.createElement('div');
  capsule.setAttribute('style', `
    pointer-events: auto;
    background: ${type === 'error' ? '#fee2e2' : '#ffedd5'};
    border: 1px solid ${type === 'error' ? '#f87171' : '#fbbf24'};
    color: ${type === 'error' ? '#991b1b' : '#92400e'};
    padding: 8px 16px;
    border-radius: 9999px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    cursor: pointer;
    max-width: 320px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 36px;
  `);

  const header = document.createElement('div');
  header.setAttribute('style', 'display: flex; align-items: center; justify-content: space-between; min-height: 20px;');
  
  const title = document.createElement('span');
  title.textContent = `${type === 'error' ? '⚠️' : '⚡'}: ${message.split('\n')[0].substring(0, 35)}${message.length > 35 ? '...' : ''}`;
  header.appendChild(title);

  const close = document.createElement('button');
  close.innerHTML = '&times;';
  close.setAttribute('style', 'background: none; border: none; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 0 0 8px; opacity: 0.5;');
  close.onclick = (e) => {
    e.stopPropagation();
    capsule.style.opacity = '0';
    capsule.style.transform = 'translateY(10px)';
    setTimeout(() => capsule.remove(), 300);
  };
  header.appendChild(close);
  capsule.appendChild(header);

  const body = document.createElement('div');
  body.setAttribute('style', 'margin-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 12px; font-family: monospace; font-size: 11px; white-space: pre-wrap; overflow-x: auto; max-height: 200px;');
  body.textContent = `${message}${stack ? '\n\n' + stack : ''}`;
  capsule.appendChild(body);

  let expanded = false;
  capsule.onclick = () => {
    expanded = !expanded;
    if (expanded) {
      capsule.style.maxHeight = '300px';
      capsule.style.borderRadius = '16px';
      capsule.style.cursor = 'default';
    } else {
      capsule.style.maxHeight = '36px';
      capsule.style.borderRadius = '9999px';
      capsule.style.cursor = 'pointer';
    }
  };

  container.appendChild(capsule);
  
  setTimeout(() => {
    if (!expanded && capsule.parentElement) {
      capsule.style.opacity = '0';
      capsule.style.transform = 'translateY(10px)';
      setTimeout(() => capsule.remove(), 300);
    }
  }, 10000);
};

window.addEventListener('error', (event) => {
  const message = event.error?.message || event.message;
  
  if (message?.includes('WebSocket') || message?.includes('vite/client')) {
    return;
  }

  console.error("Global Error Caught:", event.error);
  showErrorCapsule(
    message,
    event.error?.stack,
    'error'
  );
});

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || String(event.reason);

  if (message?.includes('WebSocket') || message?.includes('vite/client')) {
    return;
  }

  console.error("Unhandled Promise Rejection:", event.reason);
  showErrorCapsule(
    message,
    event.reason?.stack,
    'rejection'
  );
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
