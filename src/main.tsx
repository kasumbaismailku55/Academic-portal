import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for offline caching of student records & dashboard views
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('EduPortal Offline Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('EduPortal Service Worker registration skipped:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
